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

import React, { useEffect, useState } from 'react';

import { get } from 'lodash';
import { useFetchDetectorInfo } from '../../createDetector/hooks/useFetchDetectorInfo';
//@ts-ignore
import { toastNotifications } from 'ui/notify';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router-dom';
import { DetectorConfig } from '../containers/DetectorConfig';
import { DetectorResults } from '../containers/DetectorResults';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiTabs,
  EuiTab,
} from '@elastic/eui';

interface ViewRouterProps {
  detectorId?: string;
}

interface ViewProps extends RouteComponentProps<ViewRouterProps> {}

const tabs = [
  {
    id: 'results',
    name: 'Anomaly results',
    route: 'results',
  },
  {
    id: 'config',
    name: 'Detector configuration',
    route: 'config',
  },
];

const getSelectedTabId = (pathname: string) => {
  if (pathname.includes('results')) return 'results';
  return 'config';
};

export const DetectorView = (props: ViewProps) => {
  const [selectedTab, setSelectedTab] = useState(
    getSelectedTabId(props.location.pathname)
  );

  const detectorId = get(props, 'match.params.detectorId', '');

  //In case user is refreshing Edit detector page, we'll lose existing detector state
  //This will ensure to fetch the detector based on id from URL
  const { detector, hasError } = useFetchDetectorInfo(detectorId);

  useEffect(() => {
    if (hasError) {
      toastNotifications.addDanger('Unable to find detector');
      props.history.push('/detectors');
    }
  }, [hasError]);

  const handleTabChange = (route: string) => {
    setSelectedTab(route);
    props.history.push(route);
  };

  return (
    <React.Fragment>
      <EuiFlexGroup direction="column">
        <EuiFlexItem grow={false} style={{ marginBottom: 0 }}>
          <EuiDescriptionList style={{ padding: '10px 20px' }}>
            <EuiDescriptionListTitle>
              <h2>header under construction </h2>
            </EuiDescriptionListTitle>
          </EuiDescriptionList>
        </EuiFlexItem>
        <EuiFlexItem style={{ marginTop: 0 }}>
          <EuiTabs>
            {tabs.map(tab => (
              <EuiTab
                onClick={() => {
                  handleTabChange(tab.route);
                }}
                isSelected={tab.id === selectedTab}
                key={tab.id}
              >
                {tab.name}
              </EuiTab>
            ))}
          </EuiTabs>
        </EuiFlexItem>
      </EuiFlexGroup>
      <Switch>
        <Route
          exact
          path="/detectors/:detectorId/view/config"
          render={props => (
            <DetectorConfig
              {...props}
              detectorId={detectorId}
              detector={detector}
            />
          )}
        />
        <Route
          exact
          path="/detectors/:detectorId/view/results"
          render={props => (
            <DetectorResults
              {...props}
              detectorId={detectorId}
              detector={detector}
            />
          )}
        />
        <Redirect to="/detectors/:detectorId/view/config" />
      </Switch>
    </React.Fragment>
  );
};
