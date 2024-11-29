"use client"

import React from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';

import { getTranslation } from "@/ni18n/i18n";
import { AddStudentPayload, useLazyStudentGetDataByIdQuery, useStudentCreateMultiMutation, useStudentCreateMutation, useStudentUpdateMutation } from "@/services/admin/student";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
export interface FormValues extends AddStudentPayload {

}
export interface FormValuesMulti {
    studentsData: {
        id: number;
        fullName: string;
        phone1: string;
    }[]
}
import { Tab } from './Tab';
import SingleAdd from './SingleAdd';
import MuiltAdd from './MuiltAdd';

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [selected, setSelected] = useState("add")
  const [StudentGetDataById, { currentData: data, isFetching }] = useLazyStudentGetDataByIdQuery()
  useEffect(() => {
      if (id) {
          StudentGetDataById({ id: String(id) })
              .then((data) => {
                  if (!data.data) {
                      router.back();
                  }
              });
      }
  }, [id]) 
  
  const [StudentCreate, { isLoading: isLoadingStudentCreate }] = useStudentCreateMutation();
  const [StudentCreateMulti, { isLoading: isLoadingStudentCreateMulti }] = useStudentCreateMultiMutation();
  const [StudentUpdate, { isLoading: isLoadingStudentUpdate }] = useStudentUpdateMutation();

  const handleSubmit = async (
      values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
      try {

          const formData = new FormData();
          if (typeof values.photo === "string") {
              delete (values as any).url;
          }
          for (const key in values) {
              if ((values as any)[key]) {
                  formData.append(key, (values as any)[key]);
              }
          }

          if (id) {
              await StudentUpdate({
                  body: formData,
                  id: String(id),
              }
              ).unwrap()

          } else {
              await StudentCreate({
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
              if (error.message == `Resource already exists. More details: {\"modelName\":\"Student\",\"target\":\"students_email_key\"}`) {
                  return toast.error(t('StudentPage.email-already-exists'), { autoClose: 30000 });
              }
              return toast.error(JSON.stringify(error), { autoClose: 30000 });
          }
          toast.error(error, { autoClose: 30000 });
      }
  };
  const handleSubmitMulti = async (
      values: FormValuesMulti, { setSubmitting, resetForm }: FormikHelpers<FormValuesMulti>) => {
      try {

          await StudentCreateMulti({
              students: values.studentsData.map((item) => {
                  return {
                      fullName: item.fullName,
                      phone1: item.phone1
                  }
              }
              )

          }).unwrap()

          toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000, });
          resetForm();
          if (id) {
              router.back();
          }
      } catch (error: any) {
          console.error("Failed to operation :", error);
          if (error) {
              if (error.message == `Resource already exists. More details: {\"modelName\":\"Student\",\"target\":\"students_email_key\"}`) {
                  return toast.error(t('StudentPage.email-already-exists'), { autoClose: 30000 });
              }
              return toast.error(JSON.stringify(error), { autoClose: 30000 });
          }
          toast.error(error, { autoClose: 30000 });
      }
  };
  const studentSchema = Yup.object().shape({
      fullName: Yup.string().required(t("common.this-field-is-required")),
      phone1: Yup.string().required(t("common.this-field-is-required")),
  })
  const studentSchemaMulti = Yup.object().shape({
      studentsData: Yup.array().of(Yup.object().shape({
          fullName: Yup.string().required(t("common.this-field-is-required")),
          phone1: Yup.string().required(t("common.this-field-is-required")),
      }))

  })


  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "StudentPage.update-info" : "StudentPage.add")} />

        {isFetching ? (
          <LoadingForm />
        ) : (
          !id ?
            <>
              <Tab
                selected={selected}
                setSelected={setSelected}
              />
              {
                selected == "add" ?
                  <SingleAdd
                    id={id}
                    t={t}
                    data={data}
                    studentSchema={studentSchema}
                    handleSubmit={handleSubmit}
                    isLoadingStudentUpdate={isLoadingStudentCreate}
                  /> :
                  <MuiltAdd

                    t={t}
                    studentSchemaMulti={studentSchemaMulti}
                    handleSubmitMulti={handleSubmitMulti}
                    isLoadingStudentCreateMulti={isLoadingStudentCreateMulti}
                  />
              }
            </>
            :
            <>
              <SingleAdd
                id={id}
                t={t}
                data={data}
                studentSchema={studentSchema}
                handleSubmit={handleSubmit}
                isLoadingStudentUpdate={isLoadingStudentUpdate}
              />
            </>

        )}
      </div>
    </>
  );
};

export default PageComponent

