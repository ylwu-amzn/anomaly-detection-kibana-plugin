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
  //@ts-ignore
  EuiBasicTable,
  EuiPage,
  EuiPageBody,
  EuiSpacer,
  EuiCallOut,
  EuiButton,
} from '@elastic/eui';
import { get } from 'lodash';
import React, { useEffect, Fragment } from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';
//@ts-ignore
import chrome from 'ui/chrome';
import { AppState } from '../../../redux/reducers';
import { BREADCRUMBS } from '../../../utils/constants';
import { AnomalyResultsLiveChart } from './AnomalyResultsLiveChart';
import { AnomalyHistory } from './AnomalyHistory';

interface AnomalyResultsProps extends RouteComponentProps {
  detectorId: string;
  onSwitchToConfiguration(): void;
}

export function AnomalyResults(props: AnomalyResultsProps) {
  const detectorId = get(props, 'match.params.detectorId', '') as string;
  const detector = useSelector(
    (state: AppState) => state.ad.detectors[detectorId]
  );

  useEffect(() => {
    chrome.breadcrumbs.set([
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.DETECTORS,
      { text: detector ? detector.name : '' },
    ]);
  }, []);

  const monitors = useSelector((state: AppState) => state.alerting.monitors);
  const monitor = get(monitors, `${detectorId}.0`);
  return (
    <Fragment>
      <EuiPage>
        <EuiPageBody>
          <EuiSpacer size="l" />
          {detector ? (
            <Fragment>
              {!detector.enabled &&
              detector.disabledTime &&
              detector.lastUpdateTime > detector.disabledTime ? (
                <EuiCallOut
                  title="There are change(s) to the detector configuration after the detector is stopped."
                  color="warning"
                  iconType="alert"
                >
                  <p>
                    Restart the detector to see accurate anomalies based on your
                    latest configuration.
                  </p>
                  <EuiButton
                    onClick={props.onSwitchToConfiguration}
                    color="warning"
                  >
                    View detector configuration
                  </EuiButton>
                </EuiCallOut>
              ) : null}
              <AnomalyResultsLiveChart
                detectorId={detectorId}
                detector={detector}
              />
              <EuiSpacer size="l" />
              <AnomalyHistory
                detectorId={detectorId}
                detector={detector}
                monitor={monitor}
                createFeature={() =>
                  props.history.push(`/detectors/${detectorId}/features`)
                }
              />
            </Fragment>
          ) : null}
        </EuiPageBody>
      </EuiPage>
    </Fragment>
  );
}
