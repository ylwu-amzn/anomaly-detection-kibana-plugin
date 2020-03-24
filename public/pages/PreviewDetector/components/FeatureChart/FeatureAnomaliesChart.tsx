/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import {
  Chart,
  Axis,
  LineSeries,
  getSpecId,
  getAxisId,
  RectAnnotation,
  getAnnotationId,
  niceTimeFormatter,
  CustomSeriesColorsMap,
  DataSeriesColorsValues,
  Position,
  Settings,
} from '@elastic/charts';
import { EuiEmptyPrompt, EuiText } from '@elastic/eui';
import React from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { useDelayedLoader } from '../../../../hooks/useDelayedLoader';
import { Moment } from 'moment';
import { FeatureAggregationData } from 'public/models/interfaces';
import { darkModeEnabled } from '../../../../utils/kibanaUtils';
import { prepareDataForChart } from '../../../DetectorResults/utils/anomalyResultUtils';

interface FeatureChartProps {
  title: string;
  enabled: boolean;
  onEdit(ev: React.MouseEvent<HTMLButtonElement>): void;
  isEdit: boolean;
  featureData: FeatureAggregationData[];
  annotations: any[];
  isLoading: boolean;
  startDateTime: Moment;
  endDateTime: Moment;
  featureType: string;
  field?: string;
  aggregationMethod?: string;
  aggregationQuery?: string;
  featureDataSeriesName: string;
  featureAnomalyAnnotationSeriesName: string;
  showAnomalyAsBar: boolean;
}
const getDisabledChartBackground = () =>
  darkModeEnabled() ? '#25262E' : '#F0F0F0';
const getDisabledLineColor = () => (darkModeEnabled() ? '#434548' : '#C8CBCC');

export const FeatureChart = (props: FeatureChartProps) => {
  const timeFormatter = niceTimeFormatter([
    props.startDateTime.valueOf(),
    props.endDateTime.valueOf(),
  ]);
  const showLoader = useDelayedLoader(props.isLoading);
  const lineCustomSeriesColors: CustomSeriesColorsMap = new Map();
  const lineDataSeriesColorValues: DataSeriesColorsValues = {
    colorValues: [],
    specId: getSpecId('featureData'),
  };
  lineCustomSeriesColors.set(
    lineDataSeriesColorValues,
    props.enabled ? '#16191F' : getDisabledLineColor()
  );

  const barCustomSeriesColors: CustomSeriesColorsMap = new Map();
  const barDataSeriesColorValues: DataSeriesColorsValues = {
    colorValues: [],
    specId: getSpecId('anomlay'),
  };
  barCustomSeriesColors.set(barDataSeriesColorValues, '#E5830E');

  const featureDescription = () => (
    <EuiText size="s">
      {props.featureType === 'simple_aggs' ? (
        <p>
          Field: {props.field}; Aggregation method: {props.aggregationMethod};
          State: {props.enabled ? 'Enabled' : 'Disabled'}
        </p>
      ) : (
        <p>
          Custom expression; State: {props.enabled ? 'Enabled' : 'Disabled'}{' '}
        </p>
      )}
    </EuiText>
  );
  const customTheme = {
    lineSeriesStyle: {
      line: {
        strokeWidth: 2,
        visible: true,
        opacity: 0.5,
      },
      point: {
        visible: true,
        stroke: '#16191F',
      },
    },
  };

  const featureData = prepareDataForChart(
    props.featureData,
    props.startDateTime,
    props.endDateTime
  );
  return (
    <ContentPanel
      title={props.enabled ? props.title : `${props.title} ( disabled )`}
      titleSize="xs"
      panelStyles={props.isEdit ? { border: '5px solid #96C8DA' } : {}}
      bodyStyles={
        !props.enabled ? { backgroundColor: getDisabledChartBackground() } : {}
      }
      description={featureDescription()}
      titleClassName="preview-title"
    >
      {props.featureData.length > 0 ? (
        <div
          style={{
            height: '300px',
            width: '100%',
            opacity: showLoader ? 0.2 : 1,
          }}
        >
          <Chart>
            <Settings
              showLegend
              legendPosition={Position.Right}
              showLegendDisplayValue={false}
              theme={[customTheme]}
            />
            {props.enabled ? (
              <RectAnnotation
                dataValues={props.annotations || []}
                annotationId={getAnnotationId('react')}
                style={{
                  stroke: darkModeEnabled() ? 'red' : '#D5DBDB',
                  strokeWidth: 1,
                  opacity: 0.8,
                  fill: darkModeEnabled() ? 'red' : '#D5DBDB',
                }}
              />
            ) : null}
            <Axis
              id={getAxisId('left')}
              title={'Sample feature output'}
              position="left"
              showGridLines
            />
            <Axis
              id={getAxisId('bottom')}
              position="bottom"
              tickFormat={timeFormatter}
            />
            <LineSeries
              id={getSpecId('featureData')}
              name={props.featureDataSeriesName}
              xScaleType="time"
              yScaleType="linear"
              xAccessor={'plotTime'}
              yAccessors={['data']}
              customSeriesColors={lineCustomSeriesColors}
              data={featureData}
            />
          </Chart>
        </div>
      ) : (
        <EuiEmptyPrompt
          style={{ maxWidth: '45em' }}
          body={
            <EuiText>
              <p>{`There is no data to display for feature ${props.title}`}</p>
            </EuiText>
          }
        />
      )}
    </ContentPanel>
  );
};
