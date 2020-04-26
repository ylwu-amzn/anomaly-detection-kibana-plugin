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

import React, { Fragment } from 'react';
import {
  EuiFormRow,
  EuiSelect,
  EuiAccordion,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiText,
  EuiTextColor,
  EuiButton,
  EuiFieldText,
  EuiCheckbox,
} from '@elastic/eui';
import { validateFeatureName } from '../../../../utils/utils';
import { Field, FieldProps } from 'formik';
import { required, isInvalid, getError } from '../../../../utils/utils';
import { get } from 'lodash';
import { FEATURE_TYPE_OPTIONS } from '../../containers/utils/constants';
import { FEATURE_TYPE } from '../../../../models/interfaces';
import { formikToSimpleAggregation } from '../../containers/utils/formikToFeatures';
import { AggregationSelector } from '../AggregationSelector';
import { CustomAggregation } from '../CustomAggregation';

interface FeatureAccordionProps {
  onDelete(): void;
  index: number;
  feature: any;
  // displayError: boolean;
  handleChange(event: React.ChangeEvent<HTMLSelectElement>): void;
  // ref: any;
}

export const FeatureAccordion = (props: FeatureAccordionProps) => {
  const simpleAggDescription = (feature: any) => (
    <Fragment>
      <span className="content-panel-subTitle" style={{ paddingRight: '20px' }}>
        Field: {get(feature, 'aggregationOf.0.label')}
      </span>
      <span className="content-panel-subTitle" style={{ paddingRight: '20px' }}>
        Aggregation method: {feature.aggregationBy}
      </span>
      <span className="content-panel-subTitle">
        State: {feature.featureEnabled ? 'Enabled' : 'Disabled'}
      </span>
    </Fragment>
  );

  const customAggDescription = (feature: any) => (
    <Fragment>
      <span className="content-panel-subTitle" style={{ paddingRight: '20px' }}>
        Custom expression
      </span>
      <span className="content-panel-subTitle">
        State: {feature.featureEnabled ? 'Enabled' : 'Disabled'}{' '}
      </span>
    </Fragment>
  );

  const featureButtonContent = (feature: any, index: number) => {
    return (
      <div id={`featureAccordionHeaders.${index}`}>
        <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
          <EuiFlexItem>
            <EuiTitle size="xs" className="euiAccordionForm__title">
              <h5>
                {feature.featureName ? feature.featureName : 'Add feature'}
              </h5>
            </EuiTitle>
          </EuiFlexItem>
        </EuiFlexGroup>
        {feature && feature.featureType === FEATURE_TYPE.SIMPLE
          ? simpleAggDescription(feature)
          : customAggDescription(feature)}
      </div>
    );
  };

  const extraAction = (onClick: any) => (
    <EuiButton size="s" color="danger" onClick={onClick}>
      Delete
    </EuiButton>
  );

  return (
    <EuiAccordion
      // ref={props.ref}
      id={`featureList.${props.index}`}
      key={props.index}
      buttonContent={featureButtonContent(props.feature, props.index)}
      //@ts-ignore
      buttonClassName="euiAccordionForm__button"
      className="euiAccordionForm"
      paddingSize="l"
      initialIsOpen={!!get(props.feature, 'newFeature')}
      extraAction={extraAction(props.onDelete)}
    >
      <Field
        id={`featureList.${props.index}.featureName`}
        name={`featureList.${props.index}.featureName`}
        validate={validateFeatureName}
      >
        {({ field, form }: FieldProps) => (
          <EuiFormRow
            label="Feature name"
            helpText="Enter a descriptive name. The name must be unique within this detector."
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiFieldText
              name={`featureList.${props.index}.featureName`}
              // id={`featureList.${props.index}.featureName`}
              placeholder="Enter feature name"
              value={field.value ? field.value : props.feature.featureName}
              {...field}
            />
          </EuiFormRow>
        )}
      </Field>

      <Field
        id={`featureList.${props.index}.featureEnabled`}
        name={`featureList.${props.index}.featureEnabled`}
      >
        {({ field, form }: FieldProps) => (
          <EuiFormRow
            label="Feature state"
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiCheckbox
              id={`featureList.${props.index}.featureEnabled`}
              label="Enable feature"
              checked={field.value ? field.value : props.feature.featureEnabled}
              {...field}
            />
          </EuiFormRow>
        )}
      </Field>

      <Field
        id={`featureList.${props.index}.featureType`}
        name={`featureList.${props.index}.featureType`}
        validate={required}
      >
        {({ field, form }: FieldProps) => (
          <Fragment>
            <EuiFormRow
              label="Find anomalies based on"
              isInvalid={isInvalid(field.name, form)}
              error={getError(field.name, form)}
            >
              <EuiSelect
                {...field}
                options={FEATURE_TYPE_OPTIONS}
                value={
                  props.feature.featureType === FEATURE_TYPE.SIMPLE
                    ? FEATURE_TYPE.SIMPLE
                    : FEATURE_TYPE.CUSTOM
                }
                onChange={e => {
                  props.handleChange(e);
                  if (
                    e.currentTarget.value === FEATURE_TYPE.CUSTOM &&
                    !get(form.errors, `featureList.${props.index}`)
                  ) {
                    const aggregationQuery = formikToSimpleAggregation(
                      props.feature
                    );
                    form.setFieldValue(
                      `featureList.${props.index}.aggregationQuery`,
                      JSON.stringify(aggregationQuery, null, 4)
                    );
                  }
                }}
              />
            </EuiFormRow>
            {field.value === FEATURE_TYPE.SIMPLE ? (
              <AggregationSelector index={props.index} />
            ) : (
              <CustomAggregation index={props.index} />
            )}
          </Fragment>
        )}
      </Field>
    </EuiAccordion>
  );
};