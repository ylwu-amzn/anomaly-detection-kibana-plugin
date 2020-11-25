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

import React from 'react';
import { get } from 'lodash';
import moment from 'moment';
import { EuiBasicTable } from '@elastic/eui';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';

interface AdditionalSettingsProps {
  shingleSize: number;
  categoryField: string[];
  detectionDateRange: any
}

export function AdditionalSettings(props: AdditionalSettingsProps) {
  let startTime = get(props.detectionDateRange, 'startTime') ? moment(get(props.detectionDateRange, 'startTime')).format('MM/DD/YYYY hh:mm A'):'';
  let endTime = get(props.detectionDateRange, 'startTime') ? moment(get(props.detectionDateRange, 'endTime')).format('MM/DD/YYYY hh:mm A'):'';
  const tableItems = [
    {
      categoryField: get(props.categoryField, 0, '-'),
      windowSize: props.shingleSize,
      detectionDateRange: startTime + " - " + endTime
    },
  ];
  const tableColumns = [
    { name: 'Category field', field: 'categoryField' },
    { name: 'Window size', field: 'windowSize' },
    { name: 'Historical date range', field: 'detectionDateRange' },
  ];
  return (
    <ContentPanel title="Additional settings" titleSize="s">
      <EuiBasicTable
        className="header-single-value-euiBasicTable"
        items={tableItems}
        columns={tableColumns}
      />
    </ContentPanel>
  );
}
