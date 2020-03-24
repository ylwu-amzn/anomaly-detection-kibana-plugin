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

import { EuiFlexItem, EuiFlexGroup, EuiText, EuiButton } from '@elastic/eui';
import React, { Fragment } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Detector } from '../../../models/interfaces';
import { PLUGIN_NAME } from '../../../utils/constants';

interface DetectorConfigurationProps extends RouteComponentProps {
  detectorId: string;
  detector?: Detector;
}

export function DetectorConfiguration(props: DetectorConfigurationProps) {
  return (
    <Fragment>
      <EuiFlexGroup
        style={{ marginBottom: 0, padding: '10px 10px' }}
        direction="column"
      >
        <EuiFlexItem grow={false}>
          <EuiText>
            <h1>under constuction</h1>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false} style={{ maxWidth: 200 }}>
          <EuiButton
            isDisabled={!props.detector || props.detector.enabled}
            href={`${PLUGIN_NAME}#/detectors/${props.detectorId}/features`}
          >
            Edit features
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </Fragment>
  );
}
