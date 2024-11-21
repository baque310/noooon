"use client"


import React from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';
import * as Yup from 'yup';

import _logic, { FormValues } from './_logic';
import { FieldArray, Form, Formik, FormikProps } from 'formik';
import { InputForm } from '@/components/Form/inputForm';
import { OptionType, SelectForm } from '@/components/Form/SelectForm';
import { RolePageAndActionBasedComponent } from '@/components/Provider/RolePageAndActionBasedComponent';
import { ButtonForm } from '@/components/Form/ButtonForm';
import { CheckBoxForm } from '@/components/Form/CheckBoxForm';
import { ListClasses, ListStages } from '@/utils/Data';
import RowSections from './RowSections';
import RowStages from './RowStages';

const PageComponent = () => {
  const { t,
    router,
    data: DataSchoolGetDataById,
    isFetching: isFetching,
    id,
    schoolSchema,
    handleSubmit,
    isLoadingSchoolUpdate, } = _logic();

  type SchoolSchema = Yup.InferType<typeof schoolSchema>;

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "SchoolPage.update-info" : "SchoolPage.add")} />
        {isFetching ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              username: "",
              password: "",
              name: DataSchoolGetDataById?.name ?? "",
              address: DataSchoolGetDataById?.address ?? "",
              email: DataSchoolGetDataById?.email ?? "",
              phone1: DataSchoolGetDataById?.phone1 ?? "",
              phone2: DataSchoolGetDataById?.phone2 ?? "",
              hasBanner: DataSchoolGetDataById?.hasBanner ?? "FALSE",
              StageData: [
                {
                  "id": 1,
                  "name": "",
                  "ClassData": [
                    {
                      "id": 1,
                      "name": "",
                      SectionA: false,
                      SectionB: false,
                      SectionC: false,
                      SectionD: false,
                      SectionE: false,
                      SectionF: false,
                    }
                  ]
                }
              ],
              isActive: DataSchoolGetDataById?.isActive ?? "TRUE",

            }}
            validationSchema={schoolSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                {
                  !id && <div className="Card flex flex-col gap-1">
                    <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                      {t("SchoolPage.infoUser")}
                    </div>
                    <InputForm
                      formikProps={props}
                      name={"username"}
                      title={t("signInPage.username")}
                      placeholder={t("signInPage.enter-username")}
                    />

                    <InputForm
                      formikProps={props}
                      name={"password"}
                      title={t("signInPage.password")}
                      placeholder={t("signInPage.enter-password")}
                      isPassword={true}

                    />
                  </div>
                }
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("SchoolPage.infoSchool")}
                  </div>

                  <InputForm
                    formikProps={props}
                    name={"name"}
                    title={t("SchoolPage.name")}
                    placeholder={t("SchoolPage.enter-name")}
                  />
                  <InputForm
                    formikProps={props}
                    name={"address"}
                    title={t("SchoolPage.address")}
                    placeholder={t("SchoolPage.enter-address")}
                  />
                  <InputForm
                    formikProps={props}
                    name={"email"}
                    title={t("SchoolPage.email")}
                    placeholder={t("SchoolPage.enter-email")}
                  />
                  <div className='flex gap-2 max-md:flex-col'>


                    <InputForm
                      formikProps={props}
                      name={"phone1"}
                      title={t("SchoolPage.phone1")}
                      placeholder={t("SchoolPage.enter-phone1")}
                      props={{
                        type: "tel"
                      }}
                    />
                    <InputForm
                      formikProps={props}
                      name={"phone2"}
                      title={t("SchoolPage.phone2")}
                      placeholder={t("SchoolPage.enter-phone2")}
                      props={{
                        type: "tel"
                      }}
                    />
                  </div>
                  <div className='flex gap-2 max-md:flex-col mt-2'>
                    <CheckBoxForm
                      formikProps={props}
                      name={"hasBanner"}
                      title={t("SchoolPage.hasBanner")}
                      props={{
                        value: props.values.hasBanner,
                        checked: props.values.hasBanner == "TRUE",
                        onChange: (e) => {
                          props.setFieldValue("hasBanner", e.target.checked ? "TRUE" : "FALSE");
                        }
                      }}
                    />
                    {id && <CheckBoxForm
                      formikProps={props}
                      name={"isActive"}
                      title={t("SchoolPage.isActive")}
                      props={{
                        value: props.values.isActive,
                        checked: props.values.isActive == "TRUE",
                        onChange: (e) => {
                          props.setFieldValue("isActive", e.target.checked ? "TRUE" : "FALSE");
                        }
                      }}
                    />}

                  </div>
                </div>

                {
                  !id && <RowStages
                    props={props}
                    t={t}
                  />
                }
                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",

                    }}
                    title={t("common.save")}
                    isLoading={isLoadingSchoolUpdate}
                  />
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </>
  );
};

export default PageComponent

