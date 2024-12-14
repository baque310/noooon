"use client"

import React from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { ButtonForm } from '@/components/Form/ButtonForm';
import Model from '@/components/Model';
import { InputForm } from '@/components/Form/inputForm';
import { LoadingForm } from '@/components/Form/loadingForm';
import { getTranslation } from "@/ni18n/i18n";
import { useExamTypeCreateMutation, useExamTypeUpdateMutation, useLazyExamTypeGetDataByIdQuery } from "@/services/admin/ExamType";
import { FormikHelpers } from "formik";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
export interface FormValues {
  name: string
}
const CreateComponent = ({
  open,
  setOpen
}: {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}
) => {
  const { t } = getTranslation();

  const params = useParams()
  const { id } = params
  const [ExamTypeGetDataById, { currentData: data, isFetching }] = useLazyExamTypeGetDataByIdQuery()
  useEffect(() => {
    if (id) {
      ExamTypeGetDataById({ id: String(id) })
    }
  }, [id])


  const [ExamTypeCreate, { isLoading: isLoadingExamTypeCreate }] = useExamTypeCreateMutation();
  const [ExamTypeUpdate, { isLoading: isLoadingExamTypeUpdate }] = useExamTypeUpdateMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {
      if (id) {
        await ExamTypeUpdate({
          id: id as string,
          body: values

        }).unwrap()
      }
      else {
        await ExamTypeCreate(values).unwrap()
      }
      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000, });
      resetForm();
      setOpen(false)

    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message == "name already exist" || error.message == "ExamType already exists") {
          return toast.error(t('ExamTypePage.name-already-exist'), { autoClose: 30000 });
        }

        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };
  const schoolSchema = Yup.object().shape({
    name: Yup.string().required(t("common.this-field-is-required")),
  });


  return (
    <Model title={t(id ? "ExamTypePage.update" : "ExamTypePage.add")}
      open={open}
      setOpen={setOpen}
    >
      {isFetching ? (
        <LoadingForm className='!h-36' />
      ) : (
        <Formik<FormValues>
          initialValues={{
            name: data?.name ?? ""

          }}
          validationSchema={schoolSchema}
          onSubmit={(values, formikHelpers) => {
            handleSubmit(values, formikHelpers, setOpen)

          }}
        >
          {(props: FormikProps<any>) => (
            <Form className={"flex flex-col gap-4"}>
              <InputForm
                formikProps={props}
                name={"name"}
                title={t("ExamTypePage.name")}
                placeholder={t("ExamTypePage.enter-name")}

              />

              <div className="flex flex-row-reverse gap-2">
                <ButtonForm
                  props={{
                    type: "submit",
                    className: `w-full`,
                  }}
                  title={t("common.save")}
                  isLoading={isLoadingExamTypeUpdate || isLoadingExamTypeCreate}
                />
              </div>
            </Form>
          )}
        </Formik>)}
    </Model>
  );
};

export default CreateComponent

