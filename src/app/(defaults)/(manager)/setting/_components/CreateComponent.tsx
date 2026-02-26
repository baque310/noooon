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
      if (error?.data?.message) {
        return toast.error(error.data.message, { autoClose: 30000 });
      } else if (error?.message) {
        return toast.error(error.message, { autoClose: 30000 });
      } else if (typeof error === 'string') {
        return toast.error(error, { autoClose: 30000 });
      }
      toast.error(t('common.error-occurred'), { autoClose: 30000 });
    }
  };
  const schoolSchema = Yup.object().shape({
    currentSchoolYearId: Yup.string().required(t("common.this-field-is-required")),
  });


  return (
    <Model title={
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <span className="text-lg font-semibold text-gray-800 dark:text-white">
          {t("Setting.update-info")}
        </span>
      </div>
    }
      open={open}
      setOpen={setOpen}
    >
      <div className="mt-6">
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">{t('common.loading-settings')}</p>
          </div>
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
              <Form className="space-y-6">
                
                {/* Form Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-blue-100 dark:border-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                      {t('Setting.select-school-year-config')}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {t('Setting.choose-academic-year')}
                  </p>
                </div>

                {/* Form Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {t("TeacherSubjectPage.SchoolYear")}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  
                  <div className="relative">
                    <SelectForm
                      formikProps={props}
                      name={"currentSchoolYearId"}
                      title=""
                      placeholder={t("TeacherSubjectPage.enter-SchoolYear")}
                      options={SchoolYearData?.map((item) => {
                        return {
                          label: `${item.from} - ${item.to}`,
                          value: item.id,
                        };
                      }) ?? []
                      }
                      props={{
                        isLoading: isFetchingSchoolYearData,
                        isClearable: true,
                        onChange: (e) => {
                          props.setFieldValue("currentSchoolYearId", (e as any)?.value ?? "")
                        },
                        className: "!border-gray-300 dark:!border-gray-600 focus:!border-blue-500 dark:focus:!border-blue-400"
                      }}
                    />
                  </div>
                  
                  {props.errors.currentSchoolYearId && props.touched.currentSchoolYearId && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {String(props.errors.currentSchoolYearId)}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {t('common.cancel')}
                  </button>
                  
                  <ButtonForm
                    props={{
                      type: "submit",
                      className: "flex-1 !bg-gradient-to-r !from-blue-500 !to-indigo-600 hover:!from-blue-600 hover:!to-indigo-700 !border-0 py-3 px-4 rounded-lg font-medium !text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2",
                    }}
                    title={
                      <div className="flex items-center gap-2">
                        {!isLoadingSettingUpdate && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {t("common.save")}
                      </div>
                    }
                    isLoading={isLoadingSettingUpdate}
                  />
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </Model>
  );
};

export default CreateComponent

