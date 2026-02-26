"use client"

import React from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { ButtonForm } from '@/components/Form/ButtonForm';
import Model from '@/components/Model';
import { SelectForm } from '@/components/Form/SelectForm';
import { InputForm } from '@/components/Form/inputForm';
import { LoadingForm } from '@/components/Form/loadingForm';
import { getTranslation } from "@/ni18n/i18n";
import { useClassCreateMutation, useClassUpdateMutation, useLazyClassGetDataByIdQuery } from "@/services/admin/class";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { FormikHelpers } from "formik";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
export interface FormValues {
  name: string
  stageId: string
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
  const router = useRouter();


  const params = useParams()
  const { id } = params
  const [ClassGetDataById, { currentData: data, isFetching }] = useLazyClassGetDataByIdQuery()
  useEffect(() => {
    if (id) {
      ClassGetDataById({ id: String(id) })

    }
  }, [id])


  const [ClassCreate, { isLoading: isLoadingClassCreate }] = useClassCreateMutation();
  const [ClassUpdate, { isLoading: isLoadingClassUpdate }] = useClassUpdateMutation();
  const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {
      if (id) {
        await ClassUpdate({
          id: id as string,
          body: {
            name: values.name
          }

        }).unwrap()
      }
      else {
        await ClassCreate({
          name: values.name,
          stageId: values.stageId
        }).unwrap()
      }
      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000, });
      resetForm();
      if (id) {
        setOpen(false)
      }

    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message == "name already exist") {
          return toast.error(t('ClassPage.name-already-exists'), { autoClose: 30000 });
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
    <Model title={t(id ? "ClassPage.update" : "ClassPage.add")}
      open={open}
      setOpen={setOpen}
      panelClassName="!overflow-visible"
    >
      {isFetching ? (
        <LoadingForm className='!h-36' />
      ) : (
        <Formik<FormValues>
          initialValues={{
            name: data?.name ?? "",
            stageId: data?.stageId ?? ""

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
                title={t("ClassPage.name")}
                placeholder={t("ClassPage.enter-name")}

              />
              {!id && <SelectForm
                formikProps={props}
                name={"stageId"}
                title={t("ClassPage.StageName")}
                placeholder={t("ClassPage.enter-StageName")}
                options={stage?.map((item) => {
                  return {
                    label: t(item.name as any),
                    value: item.id,
                  };
                }) ?? []
                }
                props={{
                  isLoading: isFetchingStage,
                  isClearable: true,
                  onChange: (e) => {
                    props.setFieldValue("stageId", (e as any)?.value ?? "")
                  }
                }}
              />}
              <div className="flex flex-row-reverse gap-2">
                <ButtonForm
                  props={{
                    type: "submit",
                    className: `w-full`,
                  }}
                  title={t("common.save")}
                  isLoading={isLoadingClassUpdate || isLoadingClassCreate}
                />
              </div>
            </Form>
          )}
        </Formik>)}
    </Model>
  );
};

export default CreateComponent

