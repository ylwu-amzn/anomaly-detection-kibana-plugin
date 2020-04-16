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

import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import {
  //@ts-ignore
  EuiFlexGrid,
  EuiFlexItem,
  EuiText,
  EuiFormRow,
  EuiLink,
  EuiButton,
} from '@elastic/eui';
import { PLUGIN_NAME } from '../../../utils/constants';
import {
  Detector,
  Schedule,
  UiMetaData,
  FILTER_TYPES,
  UIFilter,
} from '../../../models/interfaces';
import React, { Component } from 'react';
import { displayText } from '../../createDetector/components/DataFilters/utils/helpers';
import { CodeModal } from '../components/CodeModal/CodeModal';
import { RouteComponentProps } from 'react-router';

interface MetaDataProps extends RouteComponentProps {
  detectorId: string;
  detector: Detector;
}

function toString(obj: { period: Schedule }): string;
function toString(utcEpochSeconds: number): string;
function toString(filter: UiMetaData): string;

function toString(obj: any): string {
  // render calls this method.  During different lifecylces, obj can be undefined
  if (typeof obj != 'undefined') {
    if (obj.hasOwnProperty('period')) {
      let period = obj.period;
      return period.interval + ' ' + period.unit;
    } else if (typeof obj == 'number') {
      // epoch
      let date = new Date(0);
      date.setUTCMilliseconds(obj);
      return date.toString();
    }
  }
  return '-';
}

interface FilterDisplayProps {
  filterInputs: Detector;
}

interface FilterDisplayState {
  showCodeModel: boolean;
}

export class FilterDisplay extends Component<
  FilterDisplayProps,
  FilterDisplayState
> {
  constructor(props: FilterDisplayProps) {
    super(props);

    this.closeModal = this.closeModal.bind(this);
    this.showModal = this.showModal.bind(this);
    this.getModalVisibilityChange = this.getModalVisibilityChange.bind(this);
    this.state = {
      showCodeModel: false,
    };
  }

  private closeModal() {
    this.setState({
      showCodeModel: false,
    });
  }

  private showModal() {
    this.setState({
      showCodeModel: true,
    });
  }

  private getModalVisibilityChange = () => {
    return this.state.showCodeModel;
  };

  public render() {
    let filter = this.props.filterInputs.uiMetadata;
    if (typeof filter == 'undefined') {
      return (
        <EuiText>
          <p className="enabled">-</p>
        </EuiText>
      );
    }
    if (filter.filterType == FILTER_TYPES.SIMPLE) {
      let filters = filter.filters;
      let n = filters.length;
      let content;

      if (n == 0) {
        content = <p className="enabled">-</p>;
      } else if (n == 1) {
        content = <p className="enabled">{displayText(filters[0])}</p>;
      } else {
        content = (
          <ol>
            {filters.map((filter: UIFilter, index: number) => {
              return <li className="enabled">{displayText(filter)}</li>;
            })}
          </ol>
        );
      }
      return <EuiText>{content}</EuiText>;
    } else {
      return (
        <div>
          <EuiText>
            <p className="enabled">
              Custom expression:{' '}
              <EuiLink onClick={this.showModal}>View code</EuiLink>
            </p>
          </EuiText>
          {!this.getModalVisibilityChange() ? null : (
            <CodeModal
              code={JSON.stringify(
                this.props.filterInputs.filterQuery || {},
                null,
                4
              )}
              title="Filter query"
              subtitle="Custom expression"
              getModalVisibilityChange={this.getModalVisibilityChange}
              closeModal={this.closeModal}
            />
          )}
        </div>
      );
    }
  }
}

export const MetaData = (props: MetaDataProps) => {
  let detector = props.detector;

  return (
    <ContentPanel
      title="Detector configuration"
      titleSize="s"
      actions={[
        <EuiButton href={`${PLUGIN_NAME}#/detectors/${props.detectorId}/edit`}>
          Edit
        </EuiButton>,
      ]}
      panelStyles={{
        left: '10px',
        width: '1120px',
      }}
    >
      <EuiFlexGrid columns={4} gutterSize="l" style={{ border: 'none' }}>
        <EuiFlexItem>
          <EuiFormRow label="Name" style={{ width: '250px' }}>
            <EuiText>
              <p className="enabled">{detector.name}</p>
            </EuiText>
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Data source index" style={{ width: '250px' }}>
            <EuiText>
              <p className="enabled">{detector.indices}</p>
            </EuiText>
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Detector interval" style={{ width: '250px' }}>
            <EuiText>
              <p className="enabled">{toString(detector.detectionInterval)}</p>
            </EuiText>
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Last Updated" style={{ width: '250px' }}>
            <EuiText>
              <p className="enabled">{toString(detector.lastUpdateTime)}</p>
            </EuiText>
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="ID" style={{ width: '250px' }}>
            <EuiText>
              <p className="enabled">{detector.id}</p>
            </EuiText>
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Window delay" style={{ width: '250px' }}>
            <EuiText>
              <p className="enabled">{toString(detector.windowDelay)}</p>
            </EuiText>
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Description" style={{ width: '250px' }}>
            <EuiText>
              <p className="enabled">{detector.description}</p>
            </EuiText>
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Data filter" style={{ width: '250px' }}>
            <FilterDisplay filterInputs={detector} />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGrid>
    </ContentPanel>
  );
};