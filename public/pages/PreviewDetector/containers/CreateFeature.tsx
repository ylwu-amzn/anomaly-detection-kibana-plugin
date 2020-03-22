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
  EuiButtonEmpty,
  EuiButtonIcon,
} from '@elastic/eui';
import { Field, FieldProps, Form, Formik } from 'formik';
import { get, set, remove, isEmpty, cloneDeep } from 'lodash';
import React, { Fragment, useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import ContentPanel from "../../../components/ContentPanel/ContentPanel";
// @ts-ignore
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
import { FEATURE_TYPE_OPTIONS, INITIAL_VALUES } from './utils/constants';
import {
  FeaturesFormikValues,
  prepareDetector,
} from './utils/formikToFeatures';
import { useFetchDetectorInfo } from '../../createDetector/hooks/useFetchDetectorInfo';
import { SampleAnomalies } from './SampleAnomalies';

// type CreateFeatureProps = {
//   initialValues: FeaturesFormikValues;
//   topOffset: number;
//   onUpdatePreview(): void;
//   featureToEdit: string;
//   onClose: any;
//   detector: Detector;
//   featureAttributes: FeatureAttributes[];
//   isSticky: boolean;
// };

interface FeaturesRouterProps {
  detectorId?: string;
}

interface CreateFeatureProps extends RouteComponentProps<FeaturesRouterProps> {}

const MAX_NAME_SIZE = 256;

// let firstLoad = true;
export function CreateFeature(props: CreateFeatureProps) {
  const detectorId = get(props, 'match.params.detectorId', '');
  const { detector, hasError } = useFetchDetectorInfo(detectorId);
  const [createFeature, setCreateFeature] = useState(false);
  const [features, setFeatures] = useState(new Array());

  useEffect(() => {
    // window.alert('detector changed');
    console.log('detector changed,', detector);
    const featureAttributes = get(detector, 'featureAttributes', []);
    setFeatures(featureAttributes);
    if (featureAttributes.length > 0) {
      setCreateFeature(false);
    } else {
      setCreateFeature(true);
    }
  }, [detector]);

  // console.log('detector === ', detector);
  useEffect(() => {
    if (hasError) {
      props.history.push("/detectors");
    }
  }, [hasError]);

  const validateFeatureName = (featureName: string): string | undefined => {
    if (isEmpty(featureName)) {
      return "Required";
    }
    if (featureName.length > MAX_NAME_SIZE) {
      return `Name is too big maximum limit is ${MAX_NAME_SIZE}`;
    }
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

  // const featureButtonContent = (feature: any, featureUiMetaData: any) => (
  //   <div>
  //     <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
  //       <EuiFlexItem>
  //         <EuiTitle size="s" className="euiAccordionForm__title">
  //           <h3>{feature.featureName}</h3>
  //         </EuiTitle>
  //       </EuiFlexItem>
  //     </EuiFlexGroup>
  //     <EuiText size="s">
  //       <p>
  //         <EuiTextColor color="subdued">Field: </EuiTextColor>
  //         {featureUiMetaData
  //           ? featureUiMetaData[feature.featureName].aggregationBy
  //           : null}
  //       </p>
  //     </EuiText>
  //   </div>
  // );

  const featureButtonContent = (feature: any, featureUiMetaData: any) => {
    console.log('00000featureUiMetaData, ', featureUiMetaData, feature, props);

    return (
      <div>
        <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
          <EuiFlexItem>
            <EuiTitle size="s" className="euiAccordionForm__title">
              <h3>{feature.featureName}</h3>
            </EuiTitle>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiText size="s">
          <p>
            {featureUiMetaData &&
            featureUiMetaData.featureType === 'simple_aggs' ?
              (<EuiTextColor color="subdued">Field: {featureUiMetaData.aggregationOf} Aggregation method: {featureUiMetaData.aggregationBy} State: {feature.featureEnabled? "Enabled":"Disabled"}</EuiTextColor>) :
              <EuiTextColor color="subdued">Custom expression State: Disabled</EuiTextColor>}
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

  const featureAccordion = (
    onDelete: any,
    feature?: any,
    featureUiMetaData?: any
  ) => (
    <EuiAccordion
      id={feature ? feature.featureId : null}
      buttonContent={
        feature
          ? featureButtonContent(feature, featureUiMetaData)
          : addFeatureButtonContent
      }
      buttonClassName="euiAccordionForm__button"
      className="euiAccordionForm"
      paddingSize="l"
      initialIsOpen={!feature}
      extraAction={extraAction(onDelete)}
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
              value={feature ? feature.featureName : null}
            />
          </EuiFormRow>
        )}
      </Field>

      <Field name="enabled">
        {({ field, form }: FieldProps) => (
          <EuiFormRow
            label="Feature state"
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiCheckbox
              id={feature ? feature.featureId : null}
              label="Enable feature"
              checked={field.value}
              {...field}
            />
          </EuiFormRow>
        )}
      </Field>

      <Field name={"featureType"} validate={required}>
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
              <AggregationSelector />
            ) : (
              <CustomAggregation />
            )}
          </Fragment>
        )}
      </Field>
    </EuiAccordion>
  );

  const renderFeatures = (detector: Detector) => {
    // const features = get(detector, 'featureAttributes', []);
    console.log("++++++++", get(detector, 'uiMetadata.features', []));
    const featureUiMetaData = get(detector, 'uiMetadata.features', []);

    return features.map((feature: any) =>
      featureAccordion(
        () => {
          window.alert("remove feature");
          remove(features, f => f.featureId === feature.featureId);
          setFeatures([...features]);
        },
        feature,
        featureUiMetaData[feature.featureName]
      )
    );
  };

  return (
    <React.Fragment>
      <Formik
        enableReinitialize
        initialValues={cloneDeep(INITIAL_VALUES)}
        onSubmit={() => {}}
      >
        {({ values, isSubmitting, dirty }) => (
          <Form>
            {JSON.stringify(values)}
            <EuiPage>
              <EuiPageBody>
                <EuiPageHeader>
                  <EuiPageHeaderSection>
                    <EuiTitle size="l">
                      <h1>Edit features</h1>
                    </EuiTitle>
                  </EuiPageHeaderSection>
                </EuiPageHeader>
                <ContentPanel
                  title="Features"
                  titleSize="m"
                  description={featureDescription()}
                >
                  {renderFeatures(detector)}

                  {/* {get(detector, 'featureAttributes', []).length
                    ? setCreateFeature(true)
                    : setCreateFeature(false)} */}

                  {createFeature
                    ? featureAccordion(() => setCreateFeature(false))
                    : null}
                  <EuiFlexGroup
                    alignItems="center"
                    style={{ padding: '12px 24px' }}
                  >
                    <EuiFlexItem grow={false}>
                      <EuiButton
                        data-test-subj="addFeature"
                        onClick={() => {
                          console.log('addFeature button clicked');
                          setCreateFeature(true);
                        }}
                      >
                        Add another feature
                      </EuiButton>
                      <EuiText size="s">You can add {9} more features</EuiText>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </ContentPanel>
              </EuiPageBody>
            </EuiPage>
          </Form>
        )}
      </Formik>
      <SampleAnomalies />
      <React.Fragment>
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
                  isLoading={false}
                  data-test-subj="updateAdjustModel"
                >
                  Save
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPageBody>
        </EuiPage>
      </React.Fragment>
    </React.Fragment>
  );
}
