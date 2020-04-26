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

import { DETECTOR_INIT_FAILURES, DEFAULT_ACTION_ITEM } from './constants';

export const getInitFailureMessageAndActionItem = (error: string): object => {
  const failureDetails = Object.values(DETECTOR_INIT_FAILURES);
  const failureDetail = failureDetails.find(failure =>
    error.includes(failure.keyword)
  );
  if (!failureDetail) {
    return {
      cause: 'unknown error',
      actionItem: DEFAULT_ACTION_ITEM,
    };
  }
  return failureDetail;
};
