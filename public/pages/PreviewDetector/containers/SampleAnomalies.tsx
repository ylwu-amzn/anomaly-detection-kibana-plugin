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
  EuiPageBody,
  EuiCallOut,
  EuiButton,
  EuiFlexItem,
  EuiFlexGroup,
  EuiText,
  EuiLink,
  EuiPage,
} from '@elastic/eui';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import React, { useState } from 'react';
//@ts-ignore
import { toastNotifications } from 'ui/notify';

export function SampleAnomalies(props: any) {

  const [] = useState<boolean>(
    false
  );

  const sampleAnomaliesDescription = () => {
    return (
      <EuiText size="s">
        Preview how your anomalies may look like from sample feature output and
        adjust the feature settings as needed.{' '}
        <EuiLink
          href="https://opendistro.github.io/for-elasticsearch-docs/docs/ad/"
          target="_blank"
        >
          Learn more
        </EuiLink>
      </EuiText>
    );
  };
  return (
    <React.Fragment>
      <EuiPage>
        <EuiPageBody>
          <ContentPanel
            title="Sample anomalies"
            titleSize="m"
            description={sampleAnomaliesDescription()}
          >
            <EuiCallOut
              title="You can preview anomalies based on sample feature input"
              iconType="eye"
            >
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiText>
                    You can preview how your anomalies may look like from sample
                    feature output and adjust the feature settings as needed.
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiFlexGroup>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    type="submit"
                    isLoading={false}
                    data-test-subj="previewDetector"
                  >
                    Preview anomalies
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiCallOut>
          </ContentPanel>
        </EuiPageBody>
      </EuiPage>
    </React.Fragment>
  );
}
