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

import { get, isEmpty } from 'lodash';
import React, { useState, useEffect, Fragment } from 'react';
//@ts-ignore
import chrome from 'ui/chrome';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
  EuiAccordion,
  EuiFormRow,
  EuiFieldText,
  EuiText,
  EuiLink,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCheckbox,
  EuiSelect,
} from '@elastic/eui';
import {
  getError,
  getErrorMessage,
  isInvalid,
  required,
} from '../../../utils/utils';
import { AggregationSelector } from '../components/AggregationSelector';
import ContentPanelYlwu from '../../../components/ContentPanel/ContentPanelYlwu';
//@ts-ignore
import { toastNotifications } from 'ui/notify';
import { RouteComponentProps } from 'react-router';
import { Field, FieldProps, Form, Formik } from 'formik';
import {
  FeaturesFormikValues,
  prepareDetector,
} from './utils/formikToFeatures';
import { FEATURE_TYPE_OPTIONS } from './utils/constants';
import {
  Detector,
  FeatureAttributes,
  FEATURE_TYPE,
} from '../../../models/interfaces';
import { CustomAggregation } from '../components/CustomAggregation';

// interface YlwuTTProps extends RouteComponentProps {
//   detectorId: string;
//   detector: Detector;
// }

type CreateFeatureProps = {
  initialValues: FeaturesFormikValues;
  topOffset: number;
  onUpdatePreview(): void;
  featureToEdit: string;
  onClose: any;
  detector: Detector;
  // featureAttributes: FeatureAttributes[];
  isSticky: boolean;
};

const featureDescription = () => {
  return (
    <EuiText size="s">
      Specify an index field that you want to find anomalies for by defining
      features. An detector can discover anomalies across up to 10 features.{' '}
      <EuiLink
        href="https://opendistro.github.io/for-elasticsearch-docs/docs/ad/"
        target="_blank"
      >
        Learn more
      </EuiLink>
    </EuiText>
  );
};

const addFeatureButtonContent = (
  <div>
    <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
      <EuiFlexItem>
        <EuiTitle size="s" className="euiAccordionForm__title">
          <h3>Add feature</h3>
        </EuiTitle>
      </EuiFlexItem>
    </EuiFlexGroup>
  </div>
);

// const isInvalid = (name: string, form: any) =>
//   !!get(form.touched, name, false) && !!get(form.errors, name, false);

export const YlwuTT = (props: CreateFeatureProps) => {
  const [featureName, setFeatureName] = useState();
  const [featureEnabled, setFeatureEnabled] = useState(false);

  const options = [
    { value: 'option_one', text: 'Option one' },
    { value: 'option_two', text: 'Option two' },
    { value: 'option_three', text: 'Option three' },
  ];

  const validateFeatureName = (featureName: string): string | undefined => {
    if (isEmpty(featureName)) {
      return 'Feature name is Required';
    }
    if (featureName.length > MAX_NAME_SIZE) {
      return `Name is too big maximum limit is ${MAX_NAME_SIZE}`;
    }
    // const findIndex = props.featureAttributes.findIndex(
    //   (attribute: FeatureAttributes) =>
    //     attribute.featureName.toLowerCase() === featureName.toLowerCase()
    // );
    // //If more than one detectors found, duplicate exists.
    // if (!isEdit && findIndex > -1) {
    //   throw 'Duplicate feature name';
    // }
    // if (findIndex > -1 && isEdit) {
    //   if (
    //     props.initialValues.featureName !==
    //     props.featureAttributes[findIndex].featureName
    //   ) {
    //     return 'Duplicate feature name';
    //   }
    // }
  };

  useEffect(() => {
    // console.log('----------', featureName);
  }, [featureName]);

  useEffect(() => {
    // console.log('----------', featureEnabled);
  }, [featureEnabled]);

  const MAX_NAME_SIZE = 256;

  return (
    <React.Fragment>
      <Formik
        enableReinitialize
        initialValues={props.initialValues}
        onSubmit={() => {}}
      >
        {({ values, isSubmitting, dirty }) => (
          <Form>
            {/*
            // @ts-ignore */}

            <EuiPage>
              <EuiPageBody>
                <EuiPageHeader>
                  <EuiPageHeaderSection>
                    <EuiTitle size="l">
                      <h1>Edit features</h1>
                    </EuiTitle>
                  </EuiPageHeaderSection>
                </EuiPageHeader>
                <ContentPanelYlwu
                  title="Features"
                  titleSize="m"
                  description={featureDescription()}
                >
                  <EuiAccordion
                    id="accordion1"
                    buttonContent={addFeatureButtonContent}
                    className="euiAccordionForm"
                    paddingSize="l"
                    initialIsOpen={true}
                  >
                    <Field name="featureName" validate={validateFeatureName}>
                      {({ field, form }: FieldProps) => (
                        <EuiFormRow
                          label="Feature name"
                          helpText="Enter a descriptive name. The name must be unique within this detector"
                          isInvalid={isInvalid(field.name, form)}
                          error={getError(field.name, form)}
                        >
                          <EuiFieldText
                            name="featureName"
                            id="featureName"
                            placeholder="Enter feature name"
                            {...field}
                          />
                        </EuiFormRow>
                      )}
                    </Field>

                    <Field name="enabled">
                      {({ field, form }: FieldProps) => (
                        <EuiFormRow
                          isInvalid={isInvalid(field.name, form)}
                          error={getError(field.name, form)}
                        >
                          <EuiCheckbox
                            id={'enabled'}
                            label="Enable feature"
                            checked={field.value}
                            {...field}
                          />
                        </EuiFormRow>
                      )}
                    </Field>

                    <Field name={`featureType`} validate={required}>
                      {({ field, form }: FieldProps) => {
                        console.log('field is ===== ', field);
                        return (
                          <Fragment>
                            <EuiFormRow
                              label="Find anomalies based on"
                              isInvalid={isInvalid(field.name, form)}
                              error={getError(field.name, form)}
                            >
                              <EuiSelect
                                {...field}
                                options={FEATURE_TYPE_OPTIONS}
                                isInvalid={isInvalid(field.name, form)}
                                data-test-subj="featureType"
                              />
                            </EuiFormRow>
                            {field.value === FEATURE_TYPE.SIMPLE ? (
                              <AggregationSelector />
                            ) : (
                              <CustomAggregation />
                            )}
                          </Fragment>
                        );
                      }}
                    </Field>
                  </EuiAccordion>
                </ContentPanelYlwu>
              </EuiPageBody>
            </EuiPage>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
};
