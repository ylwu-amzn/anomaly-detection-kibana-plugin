/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

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
  EuiPageHeader,
  EuiTextColor,
  EuiCheckbox,
  EuiPageHeaderSection,
  EuiFieldText,
  EuiAccordion,
  EuiFlexItem,
  EuiFlexGroup,
  EuiText,
  EuiLink,
  EuiPage,
  EuiFormRow,
  EuiButton,
  EuiSelect,
  EuiTitle,
  EuiPanel,
  EuiButtonEmpty,
  EuiButtonIcon,
} from '@elastic/eui';
import {
  Field,
  FieldArray,
  FieldProps,
  FieldArrayRenderProps,
  Form,
  Formik,
} from 'formik';
import { get, set, remove, isEmpty, cloneDeep } from 'lodash';
import React, { Fragment, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
import {
  Detector,
  FeatureAttributes,
  FEATURE_TYPE,
} from '../../../models/interfaces';
import { updateDetector } from '../../../redux/reducers/ad';
import {
  getError,
  getErrorMessage,
  isInvalid,
  required,
} from '../../../utils/utils';
import { AggregationSelector } from '../components/AggregationSelector';
import { CustomAggregation } from '../components/CustomAggregation';
import {
  FEATURE_TYPE_OPTIONS,
  MAX_FEATURE_NUM,
  INITIAL_VALUES,
} from './utils/constants';
import {
  FeaturesFormikValues,
  prepareDetector,
} from './utils/formikToFeatures';
import { useFetchDetectorInfo } from '../../createDetector/hooks/useFetchDetectorInfo';
import { SampleAnomalies } from './SampleAnomalies';
import { v4 as uuidv4 } from 'uuid';

interface FeaturesRouterProps {
  detectorId?: string;
}

interface CreateFeatureProps extends RouteComponentProps<FeaturesRouterProps> {}

const MAX_NAME_SIZE = 256;

// let firstLoad = true;
export function CreateFeature(props: CreateFeatureProps) {
  const dispatch = useDispatch();
  const detectorId = get(props, 'match.params.detectorId', '');
  const { detector, hasError } = useFetchDetectorInfo(detectorId);

  useEffect(() => {
    console.log('detector', detector);
  }, [detector]);

  useEffect(() => {
    if (hasError) {
      props.history.push('/detectors');
    }
  }, [hasError]);

  const validateFeatureName = (featureName: string): string | undefined => {
    if (isEmpty(featureName)) {
      return 'Required';
    }
    if (featureName.length > MAX_NAME_SIZE) {
      return `Name is too big maximum limit is ${MAX_NAME_SIZE}`;
    }
    // const featureList = get(values, 'featureList', []);
    // const foundFeatures = featureList.filter(
    //   (attribute: FeatureAttributes) =>
    //     attribute.featureName.toLowerCase() === featureName.toLowerCase()
    // );
    // if (foundFeatures.length > 1) {
    //   return 'Duplicate feature name';
    // }
  };

  const featureDescription = () => (
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

  const featureButtonContent = (feature: any) => {
    return (
      <div>
        <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
          <EuiFlexItem>
            <EuiTitle size="s" className="euiAccordionForm__title">
              <h3>
                {feature.featureName ? feature.featureName : 'Add feature'}
              </h3>
            </EuiTitle>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiText size="s">
          <p>
            {feature && feature.featureType === 'simple_aggs' ? (
              <EuiTextColor color="subdued">
                Field: {get(feature, 'aggregationOf.0.label')} Aggregation
                method: {feature.aggregationBy} State:{' '}
                {feature.featureEnabled ? 'Enabled' : 'Disabled'}
              </EuiTextColor>
            ) : (
              <EuiTextColor color="subdued">
                Custom expression State:{' '}
                {feature.featureEnabled ? 'Enabled' : 'Disabled'}
                {'  --   '} {feature.newFeature ? 'new' : 'old'}
              </EuiTextColor>
            )}
          </p>
        </EuiText>
      </div>
    );
  };

  const extraAction = (onClick: any) => (
    <EuiButtonIcon
      iconType="cross"
      color="danger"
      className="euiAccordionForm__extraAction"
      aria-label="Delete"
      onClick={onClick}
    />
  );

  const featureAccordion = (onDelete: any, index: number, feature: any) => (
    <EuiAccordion
      id={feature.featuerId}
      key={index}
      buttonContent={featureButtonContent(feature)}
      buttonClassName="euiAccordionForm__button"
      className="euiAccordionForm"
      paddingSize="l"
      initialIsOpen={get(feature, 'newFeature')}
      extraAction={extraAction(onDelete)}
    >
      <Field
        name={`featureList.${index}.featureName`}
        validate={validateFeatureName}
      >
        {({ field, form }: FieldProps) => (
          <EuiFormRow
            label="Feature name"
            helpText="Enter a descriptive name. The name must be unique within this detector"
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiFieldText
              name={`featureList.${index}.featureName`}
              // id="featureName"
              placeholder="Enter feature name"
              value={field.value ? field.value : feature.featureName}
              {...field}
            />
          </EuiFormRow>
        )}
      </Field>

      <Field name={`featureList.${index}.featureEnabled`}>
        {({ field, form }: FieldProps) => (
          <EuiFormRow
            label="Feature state"
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiCheckbox
              id={`featureList.${index}.featureEnabled`}
              label="Enable feature"
              checked={field.value ? field.value : feature.featureEnabled}
              {...field}
            />
          </EuiFormRow>
        )}
      </Field>

      <Field name={`featureList.${index}.featureType`} validate={required}>
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
                isInvalid={isInvalid(field.name, form)}
                data-test-subj="featureType"
              />
            </EuiFormRow>
            {field.value === FEATURE_TYPE.SIMPLE ? (
              <AggregationSelector index={index} />
            ) : (
              <CustomAggregation index={index} />
            )}
          </Fragment>
        )}
      </Field>
    </EuiAccordion>
  );

  const renderFeatures = values => {
    return (
      <FieldArray name="featureList" validateOnChange={true}>
        {({
          push,
          remove,
          form: { values },
        }: FieldArrayRenderProps) => (
          <Fragment>
            {values.featureList.map((feature: any, index: number) =>
              featureAccordion(
                () => {
                  remove(index);
                },
                index,
                feature
              )
            )}

            <EuiFlexGroup alignItems="center" style={{ padding: '12px 24px' }}>
              <EuiFlexItem grow={false}>
                <EuiButton
                  data-test-subj="addFeature"
                  isDisabled={values.featureList.length >= MAX_FEATURE_NUM}
                  onClick={() =>
                    push({
                      featureId: uuidv4(),
                      featureType: 'simple_aggs',
                      featureEnabled: true,
                      importance: 1,
                      aggregationQuery: JSON.stringify(
                        { aggregation_name: { sum: { field: 'field_name' } } },
                        null,
                        4
                      ),
                      newFeature: true,
                    })
                  }
                >
                  Add another feature
                </EuiButton>
                <EuiText size="s">
                  You can add{' '}
                  {Math.max(MAX_FEATURE_NUM - values.featureList.length, 0)}{' '}
                  more features
                </EuiText>
                {/* <EuiText size="s">You can add {9} more features</EuiText> */}
              </EuiFlexItem>
            </EuiFlexGroup>
          </Fragment>
        )}
      </FieldArray>
    );
  };

  const generateInitialValue = (detector: Detector):FeaturesFormikValues => {
    debugger;
    const u = uuidv4();
    console.log(u);
    const featureUiMetaData = get(detector, 'uiMetadata.features', []);
    // return features.map(feature => {
    //   {...(featureUiMetaData[feature.featureName]), ...feature}
    // });
    const features = get(detector, 'featureAttributes', []);
    return features.map((feature: FeatureAttributes) => {
      return {
        ...featureUiMetaData[feature.featureName],
        ...feature,
        aggregationQuery: JSON.stringify(feature['aggregationQuery'], null, 4),
        aggregationOf: get(
          featureUiMetaData[feature.featureName],
          'aggregationOf'
        )
          ? [
              {
                label: get(
                  featureUiMetaData[feature.featureName],
                  'aggregationOf'
                ),
              },
            ]
          : [],
      };
    });
    // console.log('343434', a);
    // return a;
  };

  const handleSubmit = async (values: FeaturesFormikValues, setSubmitting: any) => {
    debugger
    // alert('Submit..');

    const requestBody = prepareDetector(
      get(values, 'featureList', []),
      detector
    );
    // console.log('submit detector', requestBody);
    try {
      await dispatch(updateDetector(detector.id, requestBody));
      toastNotifications.addSuccess(`Feature updated: ${values.featureName}`);
      setSubmitting(false);
    } catch (err) {
      toastNotifications.addDanger(
        getErrorMessage(
          err,
          `There was a problem updating feature ${values.featureName}`
        )
      );
      setSubmitting(false);
    }
  };

  console.log('-------');
  return (
    <Fragment>
      <Formik
        enableReinitialize
        initialValues={{ featureList: generateInitialValue(detector) }}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, dirty, setSubmitting}) => (
          <Form>
            <EuiPage>
              <EuiPageBody>
                <EuiPageHeader>
                  <EuiPageHeaderSection>
                    <EuiTitle size="l">
                      <h1>Edit features </h1>
                    </EuiTitle>
                  </EuiPageHeaderSection>
                </EuiPageHeader>
                <ContentPanel
                  title="Features"
                  titleSize="m"
                  description={featureDescription()}
                >
                  <pre>{JSON.stringify(values, null, 2)}</pre>

                  {renderFeatures(values)}
                </ContentPanel>
              </EuiPageBody>
            </EuiPage>

            <SampleAnomalies />
            
            <EuiPage>
              <EuiPageBody>
                <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      onClick={() => window.alert('Cancel button clicked')}
                    >
                      Cancel
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButton
                      fill
                      type="submit"
                      // isLoading={isSubmitting}
                      data-test-subj="updateAdjustModel"
                      disabled={isSubmitting}
                      onClick={() => handleSubmit(values, setSubmitting)}
                      // onClick={() => handleSubmit}
                    >
                      Save
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiPageBody>
            </EuiPage>
          </Form>
        )}
      </Formik>
    </Fragment>
  );
}
