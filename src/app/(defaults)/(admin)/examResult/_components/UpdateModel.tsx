"use client";

import Model from "@/components/Model";
import React from "react";
import { getTranslation } from "../../../../../ni18n/i18n";
import { ButtonForm } from "../../../../../components/Form/ButtonForm";
import { Formik, Form, Field, FormikHelpers } from "formik";
import * as Yup from "yup";

const UpdateModel = ({
  setOpen,
  open,
  name,
  title,
  onSubmit,
  isLoading,
  description,
  initialValues,
}: {
  setOpen: any;
  open: boolean;
  name: string;
  title: string;
  onSubmit: (values: { score: number | string; notes: string }, formikHelpers: FormikHelpers<any>) => void;
  isLoading: boolean;
  description: string;
  initialValues: { score: number | string; notes: string };
}) => {
  const { t } = getTranslation();

  const schema = Yup.object().shape({
    score: Yup.number()
      .typeError("Must be a number")
      .nullable()
      .required(t("common.this-field-is-required" as any)),
    notes: Yup.string().nullable(),
  });

  return (
    <Model title={title} open={open} setOpen={setOpen}>
      <div>
        <h3 className="font-bold my-3  ">
          {description} <span className=" font-bold text-red-700 px-1">{name}</span>
        </h3>

        <Formik initialValues={initialValues} validationSchema={schema} enableReinitialize onSubmit={(values, formikHelpers) => onSubmit(values, formikHelpers)}>
          {(props) => (
            <Form className="flex flex-col gap-3">
              <div>
                <label className="font-normal">{t("ExamResultsPage.score" as any)}</label>
                <Field name="score" type="number" placeholder={String(t("ExamResultsPage.enter-score" as any))} className="form-input" />
                {props.submitCount && props.errors.score && props.touched.score ? <div className="mt-[2px] w-full p-1 text-sm text-danger">{props.errors.score}</div> : null}
              </div>

              <div>
                <label className="font-normal">{t("ExamResultsPage.notes" as any)}</label>
                <Field as="textarea" name="notes" placeholder={String(t("ExamResultsPage.enter-notes" as any))} className="form-input h-24" />
                {props.submitCount && props.errors.notes && props.touched.notes ? <div className="mt-[2px] w-full p-1 text-sm text-danger">{props.errors.notes}</div> : null}
              </div>

              <div>
                <ButtonForm
                  title={t("common.update")}
                  isLoading={isLoading}
                  props={{
                    type: "submit",
                    className: "w-full !bg-primary text-white",
                  }}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Model>
  );
};

export default UpdateModel;
