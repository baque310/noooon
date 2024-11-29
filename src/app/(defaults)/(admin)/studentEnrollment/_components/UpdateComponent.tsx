"use client"

import React from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { ButtonForm } from '@/components/Form/ButtonForm';
import Model from '@/components/Model';
import { SelectForm } from '@/components/Form/SelectForm';
import { LoadingForm } from '@/components/Form/loadingForm';
import { getTranslation } from "@/ni18n/i18n";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { FormikHelpers } from "formik"; 
import { toast } from "react-toastify";
import * as Yup from 'yup';
import { useSchoolYearGetDataQuery } from '@/services/SchoolYear';
import { UpdateStudentEnrollmentPayload, useStudentEnrollmentUpdateMutation } from '@/services/admin/studentEnrollment';
export interface FormValues extends UpdateStudentEnrollmentPayload {

}
const UpdateComponent = ({
  open,
  setOpen,
  data,
}: {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  data: string[]
}
) => {
  const { t } = getTranslation();  
  const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();
  const { currentData: SchoolYear, isFetching: isFetchingSchoolYear } = useSchoolYearGetDataQuery();

  const [StudentEnrollmentUpdate, { isLoading: isLoadingStudentEnrollmentUpdate }] = useStudentEnrollmentUpdateMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {
      await StudentEnrollmentUpdate(values).unwrap()
      toast.success(t("common.updated-successfully"), { autoClose: 30000, });
      resetForm();
      setOpen(false)

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
    classId: Yup.string().required(t("common.this-field-is-required")),
    sectionId: Yup.string().required(t("common.this-field-is-required")),
    stageId: Yup.string().required(t("common.this-field-is-required")),
    schoolYearId: Yup.string().required(t("common.this-field-is-required")),
    studentEnrollmentIds: Yup.array().of(Yup.string()).required(t("common.this-field-is-required"))
  });


  return (
    <Model title={t("StudentEnrollmentPage.update-info")}
      open={open}
      setOpen={setOpen}
    >
      {false ? (
        <LoadingForm className='!h-36' />
      ) : (
        <Formik<FormValues>
          initialValues={{
            classId: "",
            sectionId: "",
            stageId: "",
            schoolYearId: "",
            studentEnrollmentIds: data

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
                name={"schoolYearId"}
                title={t("StudentEnrollmentPage.SchoolYear")}
                placeholder={t("StudentEnrollmentPage.enter-SchoolYear")}
                options={SchoolYear?.map((item) => {
                  return {
                    label: item.from + " - " + item.to,
                    value: item.id,
                  };
                }) ?? []
                }
                props={{
                  isLoading: isFetchingSchoolYear,
                  isClearable: true,
                  onChange: (e) => {
                    props.setFieldValue("schoolYearId", (e as any)?.value ?? "")
                  }
                }}
              />
              <SelectForm
                formikProps={props}
                name={"stageId"}
                title={t("StudentEnrollmentPage.StageName")}
                placeholder={t("StudentEnrollmentPage.enter-StageName")}
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
                    props.setFieldValue("classId", "")
                    props.setFieldValue("sectionId", "")
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
                    props.setFieldValue("sectionId", "")
                  }
                }}
              />

              <SelectForm
                formikProps={props}
                name={"sectionId"}
                title={t("StudentEnrollmentPage.SectionName")}
                placeholder={t("StudentEnrollmentPage.enter-SectionName")}
                options={stage ? stage
                  .find((item) => item.id === props.values.stageId)?.Class?.find(item =>
                    item.id === props.values.classId
                  )?.Section?.map((item) => {
                    return {
                      label: t(item.name as any),
                      value: item.id,
                    };
                  }) || [] : []
                }
                props={{
                  isClearable: true,
                  isLoading: isFetchingStage,
                  onChange: (e) => {
                    props.setFieldValue("sectionId", (e as any)?.value ?? "")
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
                  isLoading={isLoadingStudentEnrollmentUpdate}
                />
              </div>
            </Form>
          )}
        </Formik>)}
    </Model>
  );
};

export default UpdateComponent

