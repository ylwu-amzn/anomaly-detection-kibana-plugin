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

import { FEATURE_TYPE } from '../../../models/interfaces';

export const FEATURE_TYPES = [
  { text: 'Custom Aggregation', value: FEATURE_TYPE.CUSTOM },
  { text: 'Defined Aggregation', value: FEATURE_TYPE.SIMPLE },
];

export enum SAVE_FEATURE_OPTIONS {
  START_AD_JOB = 'start_ad_job',
  KEEP_AD_JOB_STOPPED = 'keep_ad_job_stopped',
};

export const AGGREGATION_TYPES = [
  { text: '' },
  { value: 'avg', text: 'average()' },
  { value: 'sum', text: 'sum()' },
  { value: 'min', text: 'min()' },
  { value: 'max', text: 'max()' },
];

export const FEATURE_FIELDS = [
  'featureName',
  'aggregationOf',
  'aggregationBy',
  'aggregationQuery',
];