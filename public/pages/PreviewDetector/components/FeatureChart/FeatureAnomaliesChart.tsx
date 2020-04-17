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

import {
  Chart,
  Axis,
  LineSeries,
  RectAnnotation,
  niceTimeFormatter,
  Position,
  Settings,
} from '@elastic/charts';
import { EuiEmptyPrompt, EuiText, EuiLink } from '@elastic/eui';
import React, { useState } from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { useDelayedLoader } from '../../../../hooks/useDelayedLoader';
import { Moment } from 'moment';
import {
  FeatureAggregationData,
  FeatureAttributes,
} from 'public/models/interfaces';
import { darkModeEnabled } from '../../../../utils/kibanaUtils';
import { prepareDataForChart } from '../../../DetectorResults/utils/anomalyResultUtils';
// import { CodeModal } from '../../../DetectorView/components/CodeModal/CodeModal';

interface FeatureChartProps {
  feature: FeatureAttributes;
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

export const FeatureChart = (props: FeatureChartProps) => {
  const [showCustomExpression, setShowCustomExpression] = useState<boolean>(
    false
  );
  const timeFormatter = niceTimeFormatter([
    props.startDateTime.valueOf(),
    props.endDateTime.valueOf(),
  ]);
  const showLoader = useDelayedLoader(props.isLoading);

  const featureDescription = () => (
    <EuiText size="s">
      {props.featureType === 'simple_aggs' ? (
        <p style={{ fontSize: '12px', color: 'grey' }}>
          Field: {props.field}; Aggregation method: {props.aggregationMethod};
          State: {props.feature.featureEnabled ? 'Enabled' : 'Disabled'}
        </p>
      ) : (
        <p style={{ fontSize: '12px', color: 'grey' }}>
          Custom expression:{' '}
          <EuiLink onClick={() => setShowCustomExpression(true)}>
            View code
          </EuiLink>
          ; State: {props.feature.featureEnabled ? 'Enabled' : 'Disabled'}{' '}
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
      title={
        props.feature.featureEnabled
          ? props.feature.featureName
          : `${props.feature.featureName} ( disabled )`
      }
      panelStyles={props.isEdit ? { border: '5px solid #96C8DA' } : {}}
      bodyStyles={
        !props.feature.featureEnabled
          ? { backgroundColor: getDisabledChartBackground() }
          : {}
      }
      subTitle={featureDescription()}
    >
      {props.featureData.length > 0 ? (
        <div
          style={{
            height: '200px',
            width: '100%',
            opacity: showLoader ? 0.2 : 1,
          }}
        >
          <Chart>
            <Settings
              showLegend
              legendPosition={Position.Right}
              theme={[customTheme]}
            />
            {props.feature.featureEnabled ? (
              <RectAnnotation
                dataValues={props.annotations || []}
                id="annotations"
                style={{
                  stroke: darkModeEnabled() ? 'red' : '#D5DBDB',
                  strokeWidth: 1,
                  opacity: 0.8,
                  fill: darkModeEnabled() ? 'red' : '#D5DBDB',
                }}
              />
            ) : null}
            <Axis
              id="left"
              title={props.featureDataSeriesName}
              position="left"
              showGridLines
            />
            <Axis id="bottom" position="bottom" tickFormat={timeFormatter} />
            <LineSeries
              id="featureData"
              name={props.featureDataSeriesName}
              xScaleType="time"
              yScaleType="linear"
              xAccessor={'plotTime'}
              yAccessors={['data']}
              color={['#16191F']}
              data={featureData}
            />
          </Chart>
          {/* {showCustomExpression ? (
            <CodeModal
              title={props.feature.featureName}
              subtitle="Custom expression"
              code={JSON.stringify(props.feature.aggregationQuery, null, 4)}
              getModalVisibilityChange={() => true}
              closeModal={() => setShowCustomExpression(false)}
            />
          ) : null} */}
        </div>
      ) : (
        <EuiEmptyPrompt
          style={{ maxWidth: '45em' }}
          body={
            <EuiText>
              <p>{`There is no data to display for feature ${props.feature.featureName}`}</p>
            </EuiText>
          }
        />
      )}
    </ContentPanel>
  );
};
