"use client"

import React from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { ButtonForm } from '@/components/Form/ButtonForm';
import Model from '@/components/Model';
import { InputForm } from '@/components/Form/inputForm';
import { LoadingForm } from '@/components/Form/loadingForm';
import { getTranslation } from "@/ni18n/i18n";
import { useTeacherSubjectCreateMutation, useTeacherSubjectUpdateMutation, useLazyTeacherSubjectGetDataByIdQuery, AddTeacherSubjectPayload } from "@/services/admin/TeacherSubject";
import { FormikHelpers } from "formik";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
import { useStageGetDataQuery } from '@/services/admin/stage';
import { SelectForm } from '@/components/Form/SelectForm';
import { useSubjectGetDataQuery } from '@/services/admin/Subject';
import { useStageSubjectGetDataQuery } from '@/services/admin/StageSubject';
import { useTeacherGetDataQuery } from '@/services/admin/teacher';
import { useSchoolYearGetDataQuery } from '@/services/SchoolYear';
import moment from 'moment';
export interface FormValues extends AddTeacherSubjectPayload {

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
  const [searchTeacher, setSearchTeacher] = React.useState<string>("");
  const [searchSubject, setSearchSubject] = React.useState<string>("");
  const [TeacherSubjectGetDataById, { currentData: data, isFetching }] = useLazyTeacherSubjectGetDataByIdQuery()
  const { currentData: stageSubject, isFetching: isFetchingStageSubject } = useStageSubjectGetDataQuery({
    search: searchSubject
  });
  const { currentData: teacher, isFetching: isFetchingTeacher } = useTeacherGetDataQuery({
    search: searchTeacher
  });

  const { currentData: SchoolYear, isFetching: isFetchingSchoolYear } = useSchoolYearGetDataQuery();


  useEffect(() => {
    if (id) {
      TeacherSubjectGetDataById({ id: String(id) })
    }
  }, [id])


  const [TeacherSubjectCreate, { isLoading: isLoadingTeacherSubjectCreate }] = useTeacherSubjectCreateMutation();
  const [TeacherSubjectUpdate, { isLoading: isLoadingTeacherSubjectUpdate }] = useTeacherSubjectUpdateMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {
      if (id) {
        await TeacherSubjectUpdate({
          id: id as string,
          body: values

        }).unwrap()
      }
      else {
        await TeacherSubjectCreate(values).unwrap()
      }
      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000, });
      resetForm();
      setOpen(false)

    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message == "subject already exists for the specified teacher" || error.message == "TeacherSubject already exists") {
          return toast.error(t('TeacherSubjectPage.teacher-name-already-exist'), { autoClose: 30000 });
        }

        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };
  const schoolSchema = Yup.object().shape({
    teacherId: Yup.string().required(t("common.this-field-is-required")),
    stageSubjectId: Yup.string().required(t("common.this-field-is-required")),
    schoolYearId: Yup.string().required(t("common.this-field-is-required")),

  });


  return (
    <Model title={t(id ? "TeacherSubjectPage.update" : "TeacherSubjectPage.add")}
      open={open}
      setOpen={setOpen}
    >
      {isFetching ? (
        <LoadingForm className='!h-36' />
      ) : (
        <Formik<FormValues>
          initialValues={{
            teacherId: data?.teacherId || "",
            stageSubjectId: data?.stageSubjectId || "",
            schoolYearId: data?.schoolYearId ||
              SchoolYear?.find(item =>
                item.from === moment().year()
              )?.id || "",
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
                name={"stageSubjectId"}
                title={t("TeacherSubjectPage.StageSubjectName")}
                placeholder={t("TeacherSubjectPage.enter-StageSubjectName")}
                options={
                  stageSubject?.map((item) => {
                    return {
                      label: item.Subject.name + " - " + t(item.Stage.name as any) + " - " +  item.Class.name,
                      value: item.id,
                    };
                  }) ?? []
                }
                props={{
                  isClearable: true,
                  isLoading: isFetchingStageSubject,
                  onChange: (e) => {
                    props.setFieldValue("stageSubjectId", (e as any)?.value ?? "")
                  },
                  onInputChange: (e) => {
                    // setSearchSubject(e.target.value)
                  }
                }}
              />
              <SelectForm
                formikProps={props}
                name={"teacherId"}
                title={t("TeacherSubjectPage.TeacherName")}
                placeholder={t("TeacherSubjectPage.enter-TeacherName")}
                options={teacher?.data.map((item) => {
                  return {
                    label: item.fullName,
                    value: item.id,
                  };
                }) ?? []
                }
                props={{
                  isLoading: isFetchingTeacher,
                  isClearable: true,
                  onChange: (e) => {
                    props.setFieldValue("teacherId", (e as any)?.value ?? "")
                  }
                }}
              />

              <SelectForm
                formikProps={props}
                name={"schoolYearId"}
                title={t("TeacherSubjectPage.SchoolYear")}
                placeholder={t("TeacherSubjectPage.enter-SchoolYear")}
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

              <div className="flex flex-row-reverse gap-2">
                <ButtonForm
                  props={{
                    type: "submit",
                    className: `w-full`,
                  }}
                  title={t("common.save")}
                  isLoading={isLoadingTeacherSubjectUpdate || isLoadingTeacherSubjectCreate}
                />
              </div>
            </Form>
          )}
        </Formik>)}
    </Model>
  );
};

export default CreateComponent

