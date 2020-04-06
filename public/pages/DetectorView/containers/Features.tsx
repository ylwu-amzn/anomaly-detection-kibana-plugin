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
import React, { Component } from 'react';
import {
  EuiBasicTable,
  EuiText,
  EuiLink,
  EuiIcon,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
} from '@elastic/eui';
import {
  Detector,
  FEATURE_TYPE,
  FeatureAttributes,
} from '../../../models/interfaces';
import { get } from 'lodash';
import { PLUGIN_NAME } from '../../../utils/constants';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import { CodeModal } from '../../DetectorView/components/CodeModal/CodeModal';
import { RouteComponentProps } from 'react-router';

interface FeaturesProps extends RouteComponentProps {
  detectorId: string;
  detector: Detector;
}

interface FeaturesState {
  showCodeModel: boolean[];
}

export class Features extends Component<FeaturesProps, FeaturesState> {
  constructor(props: FeaturesProps) {
    super(props);
    this.state = {
      showCodeModel: get(props.detector, 'featureAttributes', []).map(
        () => false
      ),
    };
  }

  private closeModal(index: number) {
    const cloneShowCodeModal = [...this.state.showCodeModel];
    cloneShowCodeModal[index] = false;
    this.setState({
      showCodeModel: cloneShowCodeModal,
    });
  }

  private showModal(index: number) {
    const cloneShowCodeModal = [...this.state.showCodeModel];
    cloneShowCodeModal[index] = true;
    this.setState({
      showCodeModel: cloneShowCodeModal,
    });
  }

  private getModalVisibilityChange = (index: number) => {
    return this.state.showCodeModel[index];
  };

  public render() {
    const featureAttributes = get(this.props.detector, 'featureAttributes', []);

    const items = featureAttributes.map(
      (feature: FeatureAttributes, index: number) => ({
        name: feature.featureName,
        definition: index,
        state: feature.featureEnabled,
      })
    );

    const columns = [
      {
        field: 'name',
        name: 'Feature name',
        sortable: true,
      },
      {
        field: 'definition',
        name: 'Feature definition',
        width: '50%',
        render: (featureIndex: number) => {
          const feature = featureAttributes[featureIndex];

          const metaData = get(
            this.props.detector,
            `uiMetadata.features.${feature.featureName}`,
            {}
          );

          if (
            Object.keys(metaData).length === 0 ||
            metaData.featureType == FEATURE_TYPE.CUSTOM
          ) {
            return (
              <div>
                <p className="featureText">
                  Custom expression:{' '}
                  <EuiLink onClick={() => this.showModal(featureIndex)}>
                    View code
                  </EuiLink>
                </p>

                {!this.getModalVisibilityChange(featureIndex) ? null : (
                  <CodeModal
                    code={JSON.stringify(feature.aggregationQuery, null, 4)}
                    title={feature.featureName}
                    subtitle="Custom expression"
                    closeModal={() => this.closeModal(featureIndex)}
                    getModalVisibilityChange={() =>
                      this.getModalVisibilityChange(featureIndex)
                    }
                  />
                )}
              </div>
            );
          } else {
            return (
              <div>
                <p className="featureText">
                  Field: {metaData.aggregationOf || ''}
                </p>
                <p className="featureText">
                  Aggregation method: {metaData.aggregationBy || ''}
                </p>
              </div>
            );
          }
        },
      },
      {
        field: 'state',
        name: 'State',
      },
    ];

    const getCellProps = () => {
      return {
        textOnly: true,
      };
    };

    return (
      <ContentPanel
        title={`Features (${Object.keys(featureAttributes).length})`}
        titleSize="s"
        subTitle={
          <p>
            Specify index fields that you want to find anomalies for by defining
            features. A detector can discover anomalies across up to 5 features.
            Once you define the features, you can preview your anomalies from a
            sample feature output.{' '}
            <EuiLink
              href="https://github.com/opendistro-for-elasticsearch/anomaly-detection"
              target="_blank"
            >
              Learn more &nbsp;
              <EuiIcon size="s" type="popout" />
            </EuiLink>
          </p>
        }
        subTitleClassName="fieldsSubtitle"
        actions={[
          <EuiButton
            href={`${PLUGIN_NAME}#/detectors/${this.props.detectorId}/features`}
          >
            Edit
          </EuiButton>,
        ]}
        panelStyles={{
          left: '10px',
          width: '1120px',
        }}
      >
        <EuiBasicTable
          items={items}
          rowHeader="name"
          columns={columns}
          tableLayout="fixed"
          cellProps={getCellProps}
        />
      </ContentPanel>
    );
  }
}
