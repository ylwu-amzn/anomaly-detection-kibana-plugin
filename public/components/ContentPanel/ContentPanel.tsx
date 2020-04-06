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

import React, { ReactElement } from 'react';
//@ts-ignore
import {
  EuiTitleSize,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiTitle,
  EuiFormRow,
  EuiText,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
} from '@elastic/eui';

type ContentPanelProps = {
  title: string;
  subTitle?: ReactElement;
  description?: any;
  customTitle?: any;
  titleSize?: EuiTitleSize;
  bodyStyles?: React.CSSProperties;
  panelStyles?: React.CSSProperties;
  horizontalRuleClassName?: string;
  titleClassName?: string;
  subTitleClassName?: string;
  titleContainerStyles?: React.CSSProperties;
  actions?: React.ReactNode | React.ReactNode[];
  children: React.ReactNode | React.ReactNode[];
  className?: string;
};

const ContentPanel = (props: ContentPanelProps) => (
  <EuiPanel
    style={{ paddingLeft: '0px', paddingRight: '0px', ...props.panelStyles }}
    className={props.className ? props.className : undefined}
  >
    <EuiFlexGroup
      style={{ padding: '0px 10px', ...props.titleContainerStyles }}
      justifyContent="spaceBetween"
      alignItems="center"
    >
      <EuiFlexItem style={{ maxWidth: '70%' }}>
        <EuiTitle
          size={props.titleSize || 'l'}
          className={props.titleClassName || ''}
        >
          {props.customTitle ? props.customTitle : <h3>{props.title}</h3>}
        </EuiTitle>
        {props.description}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          {Array.isArray(props.actions) ? (
            props.actions.map((action: React.ReactNode, idx: number) => (
              <EuiFlexItem key={idx} grow={false}>
                {action}
              </EuiFlexItem>
            ))
          ) : (
            <EuiFlexItem>{props.actions}</EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiText
      style={{ padding: '0px 10px', ...props.titleContainerStyles }}
      className={props.subTitleClassName}
    >
      {props.subTitle}
    </EuiText>
    {props.title != '' && (
      <EuiHorizontalRule
        margin="xs"
        className={props.horizontalRuleClassName}
      />
    )}
    <div style={{ padding: '0px 10px', ...props.bodyStyles }}>
      {props.children}
    </div>
  </EuiPanel>
);

export default ContentPanel;
