"use client";

import Model from "@/components/Model";
import React from "react";
import { getTranslation } from "../../../../../ni18n/i18n";
import { ButtonForm } from "../../../../../components/Form/ButtonForm";
import { Formik, Form, Field, FormikHelpers } from "formik";
import * as Yup from "yup";
import { SelectForm } from "@/components/Form/SelectForm";

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
  onSubmit: (values: { Status: "Absent" | "Present" | "Vacation" }, formikHelpers: FormikHelpers<any>) => void;
  isLoading: boolean;
  description: string;
  initialValues: { Status: "Absent" | "Present" | "Vacation" };
}) => {
  const { t } = getTranslation();

  const schema = Yup.object().shape({
    // status: Yup.mixed()
    //   .nullable()
    //   .required(t("common.this-field-is-required" as any)),
  });

  return (
    <Model title={title} open={open} setOpen={setOpen}>
      <div>
        <Formik initialValues={initialValues} validationSchema={schema} enableReinitialize onSubmit={(values, formikHelpers) => onSubmit(values, formikHelpers)}>
          {(props) => (
            <Form className="flex flex-col gap-3 min-h-[200px]">
              <SelectForm
                formikProps={props}
                name={"Status"}
                title={t("ChatPage.target-user-type")}
                placeholder={t("ChatPage.select-target-user-type")}
                options={[
                  { label: t("SuperTeacherAttendancesPage.Present"), value: "Present" },
                  { label: t("SuperTeacherAttendancesPage.Absent"), value: "Absent" },
                  { label: t("SuperTeacherAttendancesPage.Vacation"), value: "Vacation" },
                ]}
              />

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
