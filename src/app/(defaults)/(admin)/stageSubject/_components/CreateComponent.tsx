"use client"

import React from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { ButtonForm } from '@/components/Form/ButtonForm';
import Model from '@/components/Model';
import { InputForm } from '@/components/Form/inputForm';
import { LoadingForm } from '@/components/Form/loadingForm';
import { getTranslation } from "@/ni18n/i18n";
import { useStageSubjectCreateMutation, useStageSubjectUpdateMutation, useLazyStageSubjectGetDataByIdQuery, AddStageSubjectPayload } from "@/services/admin/StageSubject";
import { FormikHelpers } from "formik";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
import { useStageGetDataQuery } from '@/services/admin/stage';
import { SelectForm } from '@/components/Form/SelectForm';
import { useSubjectGetDataQuery } from '@/services/admin/Subject';
export interface FormValues extends AddStageSubjectPayload {

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
  const [searchSubject, setSearchSubject] = React.useState<string>("");
  const [StageSubjectGetDataById, { currentData: data, isFetching }] = useLazyStageSubjectGetDataByIdQuery()
  const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();
  const { currentData: subject, isFetching: isFetchingSubject } = useSubjectGetDataQuery({
    search:searchSubject
  });
    console.log("subject",subject);
    
  useEffect(() => {
    if (id) {
      StageSubjectGetDataById({ id: String(id) })
    }
  }, [id])


  const [StageSubjectCreate, { isLoading: isLoadingStageSubjectCreate }] = useStageSubjectCreateMutation();
  const [StageSubjectUpdate, { isLoading: isLoadingStageSubjectUpdate }] = useStageSubjectUpdateMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {
      if (id) {
        await StageSubjectUpdate({
          id: id as string,
          body: values

        }).unwrap()
      }
      else {
        await StageSubjectCreate(values).unwrap()
      }
      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000, });
      resetForm();
      setOpen(false)

    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message == "subject already exists in the specified class" || error.message == "StageSubject already exists") {
          return toast.error(t('StageSubjectPage.name-already-exist'), { autoClose: 30000 });
        }

        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };
  const schoolSchema = Yup.object().shape({
    classId: Yup.string().required(t("common.this-field-is-required")),
    subjectId: Yup.string().required(t("common.this-field-is-required")),
    stageId: Yup.string().required(t("common.this-field-is-required")),

  });


  return (
    <Model title={t(id ? "StageSubjectPage.update" : "StageSubjectPage.add")}
      open={open}
      setOpen={setOpen}
    >
      {isFetching ? (
        <LoadingForm className='!h-36' />
      ) : (
        <Formik<FormValues>
          initialValues={{
            classId: data?.classId ?? "",
            subjectId: data?.subjectId ?? "",
            stageId: data?.stageId ?? "",

          }}
          validationSchema={schoolSchema}
          onSubmit={(values, formikHelpers) => {
            handleSubmit(values, formikHelpers, setOpen)

          }}
        >
          {(props: FormikProps<any>) => (
            <Form className={"flex flex-col gap-4"}>

              <SelectForm
                formikProps={props}
                name={"subjectId"}
                title={t("StageSubjectPage.SubjectName")}
                placeholder={t("StageSubjectPage.enter-SubjectName")}
                options={
                  subject?.map((item) => {
                    return {
                      label: t(item.name as any),
                      value: item.id,
                    };
                  }) ?? []
                }
                props={{
                  isClearable: true,
                  isLoading: isFetchingSubject,
                  onChange: (e) => {
                    props.setFieldValue("subjectId", (e as any)?.value ?? "")
                  },
                  onInputChange: (e) => {
                    // setSearchSubject(e.target.value)
                  }
                }}
              />
              <SelectForm
                formikProps={props}
                name={"stageId"}
                title={t("StageSubjectPage.StageName")}
                placeholder={t("StageSubjectPage.enter-StageName")}
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
              />


              <SelectForm
                formikProps={props}
                name={"classId"}
                title={t("StudentEnrollmentPage.ClassName")}
                placeholder={t("StudentEnrollmentPage.enter-ClassName")}
                options={stage ? stage
                  .find((item) => item.id === props.values.stageId)?.Class?.map((item) => {
                    return {
                      label: t(item.name as any),
                      value: item.id,
                    };
                  }) || [] : []
                }
                props={{
                  isLoading: isFetchingStage,
                  isClearable: true,
                  onChange: (e) => {
                    props.setFieldValue("classId", (e as any)?.value ?? "") 
                  }
                }}
              />



              <div className="flex flex-row-reverse gap-2">
                <ButtonForm
                  props={{
                    type: "submit",
                    className: `w-full`,
                  }}
                  title={t("common.save")}
                  isLoading={isLoadingStageSubjectUpdate || isLoadingStageSubjectCreate}
                />
              </div>
            </Form>
          )}
        </Formik>)}
    </Model>
  );
};

export default CreateComponent

