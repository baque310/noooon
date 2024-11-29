"use client"


import React from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';
import * as Yup from 'yup';
import { getTranslation } from "@/ni18n/i18n";
import { useLazySchoolGetDataByIdQuery, useSchoolCreateMutation, useSchoolUpdateMutation } from "@/services/Manager/School";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
 
import {   Form, Formik, FormikProps } from 'formik';
import { InputForm } from '@/components/Form/inputForm'; 
import { ButtonForm } from '@/components/Form/ButtonForm';
import { CheckBoxForm } from '@/components/Form/CheckBoxForm'; 
import RowStages from './RowStages';
export interface FormValues {
  username?: string
  password?: string
  name: string
  address: string
  email: string
  phone1: string
  phone2: string
  hasBanner: string // TODO:
  isActive: string // TODO:
  StageData?: {
      id: number
      name: string
      ClassData: {
          id: number
          name: string
          SectionA: boolean
          SectionB: boolean
          SectionC: boolean
          SectionD: boolean
          SectionE: boolean
          SectionF: boolean
      }[]
  }[]
}
const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [SchoolGetDataById, { currentData: DataSchoolGetDataById, isFetching }] = useLazySchoolGetDataByIdQuery()
  useEffect(() => {
      if (id) {
          SchoolGetDataById({ id: String(id) })
              .then((data) => {
                  if (!data.data) {
                      router.back();
                  }
              });
      }
  }, [id])
  const [SchoolCreate, { isLoading: isLoadingSchoolCreate }] = useSchoolCreateMutation();
  const [SchoolUpdate, { isLoading: isLoadingSchoolUpdate }] = useSchoolUpdateMutation();

  const handleSubmit = async (
      values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
      try {

          const Stage = values?.StageData?.map((stage) => {
              return {
                  name: stage.name,
                  Class: stage.ClassData.map((classData) => {
                      return {
                          name: classData.name,
                          Section: [
                              ...classData.SectionA ? [{ name: "A" }] : [],
                              ...classData.SectionB ? [{ name: "B" }] : [],
                              ...classData.SectionC ? [{ name: "C" }] : [],
                              ...classData.SectionD ? [{ name: "D" }] : [],
                              ...classData.SectionE ? [{ name: "E" }] : [],
                              ...classData.SectionF ? [{ name: "F" }] : [],
                          ]
                      }
                  })
              }
          }
          )

          if (id) {
              await SchoolUpdate({
                  body: {
                      name: values.name,
                      address: values.address,
                      email: values.email,
                      phone1: values.phone1,
                      phone2: values.phone2,
                      hasBanner: values.hasBanner,
                      isActive: values.isActive,
                  },
                  id: String(id),
              }
              ).unwrap()

          } else {
              await SchoolCreate({
                  username: values?.username ?? "",
                  password: values?.password ?? "",
                  School: {
                      name: values.name,
                      address: values.address,
                      email: values.email,
                      phone1: values.phone1,
                      phone2: values.phone2,
                      hasBanner: values.hasBanner,
                      Stage: Stage as any,
                  },
              }).unwrap()
          }
          toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000, });
          resetForm();
          if (id) {
              router.back();
          }
      } catch (error: any) {
          console.error("Failed to operation :", error);
          if (error) {
              if (error.message == `Resource already exists. More details: {"modelName":"Admin","target":"schools_email_key"}`) {
                  return toast.error(t('SchoolPage.email-already-exists'), { autoClose: 30000 });

              }
              if (error.message == `username already exist`) {
                  return toast.error(t('SchoolPage.username-already-exists'), { autoClose: 30000 });

              }
              return toast.error(JSON.stringify(error), { autoClose: 30000 });
          }
          toast.error(error, { autoClose: 30000 });
      }
  };
  const schoolSchema = Yup.object().shape({
      ...!id && {
          username: Yup.string()
              .matches(
                  /^(?=.{5,20}$)(?![.])(?!.*[.]{2})[a-zA-Z0-9.\u0600-\u06FF]+(?<![.])$/,
                  t("common.username-must-be-5-20-characters")
              )
              .required(t("common.this-field-is-required")),

          password: Yup.string()
              // .nullable() //
              .test(
                  "is-strong-password",
                  t("common.password-must-contain-letters-numbers-and-special-characters"),
                  (value) => {
                      if (!value) return true;
                      return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
                          value
                      );
                  }
              )
              .min(8, t("common.password-must-be-at-least-8-characters-long"))
              .required(t("common.this-field-is-required")),
          StageData: Yup.array().of(
              Yup.object().shape({
                  name: Yup.string().required(t("common.this-field-is-required")),
                  // ClassData: Yup.array().of(
                  //     Yup.object().shape({
                  //         name: Yup.string().required(t("common.this-field-is-required")),
                  //         SectionA: Yup.boolean(),
                  //         SectionB: Yup.boolean(),
                  //         SectionC: Yup.boolean(),
                  //         SectionD: Yup.boolean(),
                  //         SectionE: Yup.boolean(),
                  //         SectionF: Yup.boolean(),
                  //     })
                  // )
              })
          )
      },

      name: Yup.string().required(t("common.this-field-is-required")),
      email: Yup.string().email(t("common.email-must-be-a-valid-email")).required(t("common.this-field-is-required")),
      phone1: Yup.string().required(t("common.this-field-is-required")),
      phone2: Yup.string().required(t("common.this-field-is-required")),
      address: Yup.string().required(t("common.this-field-is-required")),
      hasBanner: Yup.string().required(t("common.this-field-is-required")),
      ...id && {
          isActive: Yup.string().required(t("common.this-field-is-required")),
      }


  })


 
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

