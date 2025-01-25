"use client"

import React from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { ButtonForm } from '@/components/Form/ButtonForm';
import Model from '@/components/Model';
import { InputForm } from '@/components/Form/inputForm';
import { LoadingForm } from '@/components/Form/loadingForm';
import { getTranslation } from "@/ni18n/i18n";
import { FormikHelpers } from "formik";
import { toast } from "react-toastify";
import * as Yup from 'yup';
import { SelectForm } from '@/components/Form/SelectForm';
import { listTime } from '@/utils/time';
import { useScheduleCreateMutation } from '@/services/admin/Schedule';
import moment from 'moment';
export interface FormValues {
  timeFrom: string
  timeTo: string
}
const CreateComponent = ({
  open,
  setOpen,
  data,
}: {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  data: {
    day: string
    schoolYearId: string
  }
}
) => {
  const { t } = getTranslation();

  const [ScheduleCreate, { isLoading: isLoadingScheduleCreate }] = useScheduleCreateMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {


      await ScheduleCreate(
        {
          schedules: [
            {
              day: data.day as any,
              timeFrom: moment.utc(values.timeFrom, "hh:mm a").format("HH:mm:ss"),
              timeTo: moment.utc(values.timeTo, "hh:mm a").format("HH:mm:ss"),
              schoolYearId: data.schoolYearId
            }
          ]
        }
      ).unwrap()

      toast.success(t("common.added-successfully"), { autoClose: 30000, });
      resetForm();


    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message && error.message == "A schedule with the same details already exists.") {
          return toast.error(t('SchedulePage.A-schedule-with-the-same-details-already-exists'), { autoClose: 30000 });
        }

        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };
  const schoolSchema = Yup.object().shape({
    timeFrom: Yup.string().required(t('common.this-field-is-required')),
    timeTo: Yup.string().required(t('common.this-field-is-required')),
  });


  return (
    <Model title={t("SchedulePage.add")}
      open={open}
      setOpen={setOpen}
    >
      <Formik<FormValues>
        initialValues={{
          timeFrom: "",
          timeTo: ""

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
              name={`timeFrom`}
              title={t('SchedulePage.timeFrom')}
              placeholder={t('SchedulePage.select-timeFrom')}
              options={listTime}
              props={{
                isClearable: true,
                onChange: (e) => {
                  props.setFieldValue(`timeFrom`, (e as any)?.value ?? "")
                }
              }}
            />
            <SelectForm
              formikProps={props}
              name={`timeTo`}
              title={t('SchedulePage.timeTo')}
              placeholder={t('SchedulePage.select-timeTo')}
              options={listTime}
              props={{
                isClearable: true,
                onChange: (e) => {
                  props.setFieldValue(`timeTo`, (e as any)?.value ?? "")
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
                isLoading={isLoadingScheduleCreate}
              />
            </div>
          </Form>
        )}
      </Formik>
    </Model>
  );
};

export default CreateComponent

