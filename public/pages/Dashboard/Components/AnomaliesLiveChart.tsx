/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getDetector } from '../../../redux/reducers/ad';
import { Detector } from '../../../models/interfaces';
import {
  SORT_DIRECTION,
  AD_DOC_FIELDS,
  MIN_IN_MILLI_SECS,
} from '../../../../server/utils/constants';
import { searchES } from '../../../redux/reducers/elasticsearch';
import { get } from 'lodash';
import { getDetectorResults } from '../../../redux/reducers/anomalyResults';
import moment, { Moment } from 'moment';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import {
  Chart,
  Axis,
  Settings,
  Position,
  getAxisId,
  getSpecId,
  BarSeries,
  niceTimeFormatter,
  ScaleType,
  LineAnnotation,
  AnnotationDomainTypes,
  LineAnnotationDatum,
} from '@elastic/charts';
import React from 'react';
import {
  visualizeDetectorAnomalyResult,
  getFloorPlotTime,
} from '../../../../server/utils/helpers';
import { ANOMALY_RESULT_INDEX } from '../../../utils/constants';

export interface AnomaliesLiveChartProps {
  allDetectorsSelected: boolean;
  selectedDetectors: Detector[];
}

interface LiveTimeRangeState {
  startDateTime: Moment;
  endDateTime: Moment;
}

export const AnomaliesLiveChart = (props: AnomaliesLiveChartProps) => {
  const dispatch = useDispatch();

  const getRecentAnomalousDetectorsQuery = {
    index: ANOMALY_RESULT_INDEX,
    size: 10,
    query: {
      bool: {
        must: [
          {
            exists: {
              field: AD_DOC_FIELDS.ANOMALY_GRADE,
            },
          },
          {
            bool: {
              must_not: [
                {
                  exists: {
                    field: AD_DOC_FIELDS.ERROR,
                  },
                },
              ],
            },
          },
          {
            range: {
              [AD_DOC_FIELDS.ANOMALY_GRADE]: {
                gt: 0.0,
              },
            },
          },
        ],
      },
    },
    sort: {
      [AD_DOC_FIELDS.DATA_START_TIME]: SORT_DIRECTION.DESC,
    },
    collapse: {
      field: AD_DOC_FIELDS.DETECTOR_ID,
    },
  };

  const getRecentAnomalyResultQuery = {
    range: {
      [AD_DOC_FIELDS.DATA_START_TIME]: {
        gte: 'now-30m',
      },
    },
    size: 30,
    sortField: AD_DOC_FIELDS.DATA_START_TIME,
    from: 0,
    sortDirection: SORT_DIRECTION.DESC,
  };

  const timeNowLineStyle = {
    line: {
      strokeWidth: 1,
      stroke: '#3F3F3F',
      dash: [1, 2],
      opacity: 0.8,
    },
  };

  const [liveTimeRange, setLiveTimeRange] = useState<LiveTimeRangeState>({
    startDateTime: moment().subtract(30, 'minutes'),
    endDateTime: moment(),
  });

  const [timer, setTimer] = useState();

  const [liveAnomalyData, setLiveAnomalyData] = useState([] as object[]);

  const getLiveDetectors = async () => {
    if (!props.allDetectorsSelected) {
      return props.selectedDetectors;
    }
    const detectorArray = [] as Detector[];
    const searchResponse = await dispatch(
      searchES(getRecentAnomalousDetectorsQuery)
    );
    const searchResults = searchResponse.data.response;
    const numDetectors = get(searchResults, 'hits.total.value', 0);

    if (numDetectors < 1) {
      return detectorArray;
    }
    const liveDetectorIds: string[] = get(searchResults, 'hits.hits', []).map(
      (result: any) => result._source.detector_id
    );

    for (let detectorId of liveDetectorIds) {
      const getDetectorResp = await dispatch(getDetector(detectorId));
      detectorArray.push(getDetectorResp.data.response);
    }

    return detectorArray;
  };

  const getLiveAnomalyData = async (currentDetectors: Detector[]) => {
    // clear previous result
    const currentLiveAnomalyData = [] as object[];
    for (let detector of currentDetectors) {
      const resp = await dispatch(
        getDetectorResults(detector.id, getRecentAnomalyResultQuery)
      );
      currentLiveAnomalyData.push({
        detector: detector,
        results: resp.data.response.results,
      });
    }

    setLiveAnomalyData(currentLiveAnomalyData);

    setLiveTimeRange({
      startDateTime: moment().subtract(30, 'minutes'),
      endDateTime: moment(),
    });
  };

  useEffect(() => {
    async function initializeAnomaliesChart() {
      const liveDetectors = await getLiveDetectors();

      getLiveAnomalyData(liveDetectors);

      setTimer(
        setInterval(getLiveAnomalyData, MIN_IN_MILLI_SECS, liveDetectors)
      );
    }
    initializeAnomaliesChart();
    return () => {
      clearInterval(timer);
    };
  }, []);

  const timeFormatter = niceTimeFormatter([
    liveTimeRange.startDateTime.valueOf(),
    liveTimeRange.endDateTime.valueOf(),
  ]);

  const liveVisualizedAnomalies = liveAnomalyData.flatMap(
    detectorAnomalyResult =>
      visualizeDetectorAnomalyResult(detectorAnomalyResult)
  );

  const prepareVisualizedAnomalies = (
    liveVisualizedAnomalies: object[]
  ): object[] => {
    // add data point placeholder at every minute,
    // to ensure chart evenly distrubted
    const existingPlotTimes = liveVisualizedAnomalies.map(anomaly =>
      getFloorPlotTime(get(anomaly, AD_DOC_FIELDS.PLOT_TIME, 0))
    );
    const result = [...liveVisualizedAnomalies];

    for (
      let currentTime = getFloorPlotTime(liveTimeRange.startDateTime.valueOf());
      currentTime <= liveTimeRange.endDateTime.valueOf();
      currentTime += MIN_IN_MILLI_SECS
    ) {
      if (existingPlotTimes.includes(currentTime)) {
        continue;
      }
      result.push({
        [AD_DOC_FIELDS.DETECTOR_NAME]: '',
        [AD_DOC_FIELDS.PLOT_TIME]: currentTime,
        [AD_DOC_FIELDS.ANOMALY_GRADE]: null,
      });
    }
    return result;
  };

  const timeNowAnnotation = {
    dataValue: getFloorPlotTime(liveTimeRange.endDateTime.valueOf()),
    header: 'Now',
    details: moment(liveTimeRange.endDateTime).format('MM/DD/YY h:mm a'),
  } as LineAnnotationDatum;

  const annotations = [timeNowAnnotation];

  return (
    <ContentPanel
      title="Live Anomalies"
      titleSize="s"
      isLive={true}
      subtitle="Live anomaly results across detectors for the last 30 minutes"
      subtitleClassName="live-anomaly-results-subtile"
    >
      <div
        style={{
          height: '300px',
          width: '100%',
          opacity: 1,
        }}
      >
        <Chart>
          <Settings
            showLegend
            legendPosition={Position.Right}
            showLegendDisplayValue={false}
          />
          <LineAnnotation
            domainType={AnnotationDomainTypes.XDomain}
            dataValues={annotations}
            style={timeNowLineStyle}
            marker={'now'}
          />
          <Axis
            id={getAxisId('bottom')}
            position={Position.Bottom}
            tickFormat={timeFormatter}
            showOverlappingTicks={false}
          />
          <Axis
            id={getAxisId('left')}
            title={'Anomaly grade'}
            position={Position.Left}
            domain={{ min: 0, max: 1 }}
          />
          <BarSeries
            id={getSpecId('Detectors Anomaly grade')}
            xScaleType={ScaleType.Time}
            timeZone="local"
            yScaleType="linear"
            xAccessor={AD_DOC_FIELDS.PLOT_TIME}
            yAccessors={[AD_DOC_FIELDS.ANOMALY_GRADE]}
            splitSeriesAccessors={[AD_DOC_FIELDS.DETECTOR_NAME]}
            data={prepareVisualizedAnomalies(liveVisualizedAnomalies)}
          />
        </Chart>
      </div>
    </ContentPanel>
  );
};
