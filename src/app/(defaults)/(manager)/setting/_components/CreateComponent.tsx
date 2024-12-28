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
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
import { useLazySettingGetDataQuery, useSettingUpdateMutation } from '@/services/Setting';
import { useSchoolYearGetDataQuery } from '@/services/SchoolYear';
export interface FormValues {
  currentSchoolYearId: string
  id: string
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
  const [SettingGetDataById, { currentData: data, isFetching }] = useLazySettingGetDataQuery()
  useEffect(() => {
    if (open) {
      SettingGetDataById()
    }
  }, [open])

  const [SettingUpdate, { isLoading: isLoadingSettingUpdate }] = useSettingUpdateMutation();
  const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();
  const { isFetching: isFetchingSchoolYearData, currentData: SchoolYearData } = useSchoolYearGetDataQuery();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {

      await SettingUpdate({
        id: values.id as string,
        currentSchoolYearId: values.currentSchoolYearId

      }).unwrap()

      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000, });
      resetForm();
      setOpen(false)

    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {


        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };
  const schoolSchema = Yup.object().shape({
    currentSchoolYearId: Yup.string().required(t("common.this-field-is-required")),
  });


  return (
    <Model title={t("Setting.update-info")}
      open={open}
      setOpen={setOpen}
    >
      {isFetching ? (
        <LoadingForm className='!h-36' />
      ) : (
        <Formik<FormValues>
          initialValues={{
            id: data?.id ?? "",
            currentSchoolYearId: data?.currentSchoolYearId ?? ""

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
                name={"currentSchoolYearId"}
                title={t("TeacherSubjectPage.SchoolYear")}
                placeholder={t("TeacherSubjectPage.enter-SchoolYear")}
                options={SchoolYearData?.map((item) => {
                  return {
                    label: item.from + " - " + item.to,
                    value: item.id,
                  };
                }) ?? []
                }
                props={{
                  isLoading: isFetchingSchoolYearData,
                  isClearable: true,
                  onChange: (e) => {
                    props.setFieldValue("currentSchoolYearId", (e as any)?.value ?? "")
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
                  isLoading={isLoadingSettingUpdate}
                />
              </div>
            </Form>
          )}
        </Formik>)}
    </Model>
  );
};

export default CreateComponent

