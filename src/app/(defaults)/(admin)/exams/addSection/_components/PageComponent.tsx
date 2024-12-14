"use client"

import React, { FC } from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';

import { getTranslation } from "@/ni18n/i18n";
import { useLazyExamsGetDataByIdQuery, useExamsCreateMutation, useExamsUpdateMutation, AddExamsPayload, UpdateExamsPayload, AddExamsCreateSection, useExamsCreateSectionsMutation } from "@/services/admin/Exams";
import { FieldArray, FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
export interface FormValues extends AddExamsCreateSection {
  stageId: string
  classId: string
}


import { ButtonForm } from '@/components/Form/ButtonForm';
import { Form, Formik, FormikProps } from 'formik';
import IconCaretsDown from '@/components/common/icons/sidebar/icon-carets-down';
import AnimateHeight from 'react-animate-height';
import { SelectForm } from '@/components/Form/SelectForm';
import { useStageGetDataQuery } from '@/services/admin/stage';
import { isArray } from 'lodash';
import { InputForm } from '@/components/Form/inputForm';
import { useExamTypeGetDataQuery } from '@/services/admin/ExamType';
import { useLazyStageSubjectGetDataQuery } from '@/services/admin/StageSubject';
import { DateTimeForm } from '@/components/Form/DateTimeForm';

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [ExamsGetDataById, { currentData: data, isFetching }] = useLazyExamsGetDataByIdQuery()
  const [getStageSubject, { currentData: StageSubject, isFetching: isFetchingStageSubject }] = useLazyStageSubjectGetDataQuery();
  const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();
  const { currentData: ExamType, isFetching: isFetchingExamType } = useExamTypeGetDataQuery({

  });

  useEffect(() => {
    if (id) {
      ExamsGetDataById({ id: String(id) })
        .then((data) => {
          if (!data.data) {
            router.back();
          }
        });
    }
  }, [id])



  const [CreateSections, { isLoading: isLoadingCreateSections }] = useExamsCreateSectionsMutation()

  const handleSubmit = async (
    values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {

      if (id) {
        await CreateSections({
          body: {
            examDate: values.examDate,
            sectionId: values.sectionId
          },
          id: String(id),
        }
        ).unwrap()

      } else {


      }
      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000, });
      resetForm();
      if (id) {
        router.back();
      }
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message == "Resource already exists. More details: {\"modelName\":\"Exam\",\"target\":\"exam_sections_examId_sectionId_key\"}") {
          return toast.error(t("ExamsPage.Resource-already-exists"), { autoClose: 30000 });
        }
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const sectionScheduleSchema = Yup.object().shape({
    examDate: Yup.string().required(t('common.this-field-is-required')),
    sectionId: Yup.string().required(t('common.this-field-is-required')),
  })


  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t("ExamsPage.addSection")} />

        {isFetching ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              sectionId: "",
              examDate: "",
              stageId: data?.StageSubject.Stage.id ?? "",
              classId: data?.StageSubject.Class.id ?? "",
            }}
            validationSchema={sectionScheduleSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>


                <div className="Card flex flex-col gap-1">

                  <DateTimeForm
                    formikProps={props}
                    name={`examDate`}
                    title={t("ExamsPage.examDate")}
                    placeholder={t("ExamsPage.enter-examDate")}

                  />

                  <SelectForm
                    formikProps={props}
                    name={`sectionId`}
                    title={t("SectionSchedulePage.SectionName")}
                    placeholder={t("SectionSchedulePage.select-SectionName")}
                    options={stage ? stage
                      .find((item) => item.id === props?.values?.stageId)?.Class
                      ?.find((item) => item.id === props?.values?.classId)?.Section?.map((item) => {
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
                        props.setFieldValue(`sectionId`, (e as any)?.value ?? "")
                      }
                    }}
                  />


                </div>


                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",

                    }}
                    title={t("common.save")}
                    isLoading={isLoadingCreateSections}
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

