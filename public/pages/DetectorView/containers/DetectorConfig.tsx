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

import { Detector } from '../../../models/interfaces';
import React, { Component } from 'react';
import { MetaData } from './MetaData';
import { Features } from './Features';
import { EuiSpacer, EuiPage, EuiPageBody } from '@elastic/eui';

interface DetectorConfigProps {
  detectorId: string;
  detector: Detector;
}

interface DetectorConfigState {
  showCodeModel: boolean;
}

export class DetectorConfig extends Component<
  DetectorConfigProps,
  DetectorConfigState
> {
  constructor(props: DetectorConfigProps) {
    super(props);
  }

  public render() {
    return (
      <React.Fragment>
        <EuiPage>
          <EuiPageBody>
            <EuiSpacer size="l" />
            <MetaData {...this.props} />
            <EuiSpacer />
            <Features {...this.props} />
          </EuiPageBody>
        </EuiPage>
      </React.Fragment>
    );
  }
}
