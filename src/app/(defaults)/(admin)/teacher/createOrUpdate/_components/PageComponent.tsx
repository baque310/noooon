"use client"

import React from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';

import { getTranslation } from "@/ni18n/i18n";
import { AddTeacherPayload, useLazyTeacherGetDataByIdQuery, useTeacherCreateMutation, useTeacherUpdateMutation } from "@/services/admin/teacher";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
export interface FormValues extends AddTeacherPayload {

}
import { ButtonForm } from '@/components/Form/ButtonForm';
import { Form, Formik, FormikProps } from 'formik';
import { InputForm } from '@/components/Form/inputForm';
import { DateTimeForm } from '@/components/Form/DateTimeForm';
import { UploadFileForm } from '@/components/Form/uploadFileForm';
import { SelectForm } from '@/components/Form/SelectForm';

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [TeacherGetDataById, { currentData: data, isFetching }] = useLazyTeacherGetDataByIdQuery()
  useEffect(() => {
    if (id) {
      TeacherGetDataById({ id: String(id) })
        .then((data) => {
          if (!data.data) {
            router.back();
          }
        });
    }
  }, [id])
  const [TeacherCreate, { isLoading: isLoadingTeacherCreate }] = useTeacherCreateMutation();
  const [TeacherUpdate, { isLoading: isLoadingTeacherUpdate }] = useTeacherUpdateMutation();

  const handleSubmit = async (
    values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {

      const formData = new FormData();
      if (typeof values.photo === "string") {
        delete (values as any).photo;
      }
      for (const key in values) {
        if ((values as any)[key]) {
          formData.append(key, (values as any)[key]);
        }
      }

      if (id) {
        await TeacherUpdate({
          body: formData,
          id: String(id),
        }
        ).unwrap()

      } else {
        Object.keys(values).forEach((key) => {
          if ((values as any)[key] === undefined || (values as any)[key] === "") {
            delete (values as any)[key];
          }
        });
        await TeacherCreate({
          ...values

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
        if (error.message == `Resource already exists. More details: {\"modelName\":\"Teacher\",\"target\":\"teachers_email_key\"}`) {
          return toast.error(t('TeacherPage.email-already-exists'), { autoClose: 30000 });
        }
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const teacherSchema = Yup.object().shape({
    fullName: Yup.string().required(t("common.this-field-is-required")),
    phone1: Yup.string().matches(/^[0-9]+$/, t("common.invalid-phone")).required(t("common.this-field-is-required")),
    phone2: Yup.string().matches(/^[0-9]+$/, t("common.invalid-phone")),
    email: Yup.string().email(t("common.invalid-email")).optional(),
    Gender: Yup.string().required(t("common.this-field-is-required")),
  })

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "TeacherPage.update-info" : "TeacherPage.add")} />

        {isFetching ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{

              fullName: data?.fullName ?? "",
              address: data?.address ?? "",
              email: data?.email ?? "",
              phone1: data?.phone1 ?? "",
              phone2: data?.phone2 ?? "",
              birth: data?.birth ?? "",
              hiringDate: data?.hiringDate ?? "",
              photo: data?.photo ?? "",
              Gender: data?.Gender ?? "Male"

            }}
            validationSchema={teacherSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("TeacherPage.infoTeacher")}
                  </div>
                  <InputForm
                    formikProps={props}
                    name={"fullName"}
                    title={t("TeacherPage.fullName")}
                    placeholder={t("TeacherPage.enter-fullName")}
                  />
                  <DateTimeForm
                    formikProps={props}
                    name={"birth"}
                    title={t("TeacherPage.birth")}
                    placeholder={t("TeacherPage.enter-birth")}

                  />
                  <DateTimeForm
                    formikProps={props}
                    name={"hiringDate"}
                    title={t("TeacherPage.hiringDate")}
                    placeholder={t("TeacherPage.enter-hiringDate")}

                  />
                </div>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("TeacherPage.infoContact")}
                  </div>

                  <InputForm
                    formikProps={props}
                    name={"address"}
                    title={t("TeacherPage.address")}
                    placeholder={t("TeacherPage.enter-address")}
                  />
                  <InputForm
                    formikProps={props}
                    name={"email"}
                    title={t("TeacherPage.email")}
                    placeholder={t("TeacherPage.enter-email")}
                  />
                  <SelectForm
                    formikProps={props}
                    name={"Gender"}
                    title={t("TeacherPage.Gender")}
                    placeholder={t("TeacherPage.select-Gender")}
                    options={[
                      {
                        label: t("TeacherPage.Male"),
                        value: "Male"
                      },
                      {
                        label: t("TeacherPage.Female"),
                        value: "Female"
                      },
                    ]
                    }
                  />

                  <div className='flex gap-2 max-md:flex-col'>
                    <InputForm
                      formikProps={props}
                      name={"phone1"}
                      title={t("TeacherPage.phone1")}
                      placeholder={t("TeacherPage.enter-phone1")}
                      props={{
                        type: "tel"
                      }}
                    />
                    <InputForm
                      formikProps={props}
                      name={"phone2"}
                      title={t("TeacherPage.phone2")}
                      placeholder={t("TeacherPage.enter-phone2")}
                      props={{
                        type: "tel"
                      }}
                    />
                  </div>
                </div>
                {id && <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("TeacherPage.img-info")}</div>
                  <UploadFileForm
                    valueFileName={props.values.photo}
                    formikProps={props}
                    name={"photo"}
                    title={t("TeacherPage.photo")}
                    placeholder={""}
                  />
                </div>}
                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",

                    }}
                    title={t("common.save")}
                    isLoading={isLoadingTeacherUpdate || isLoadingTeacherCreate}
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

