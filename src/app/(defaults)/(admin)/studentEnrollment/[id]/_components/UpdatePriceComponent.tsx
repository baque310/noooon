"use client";

import React from "react";
import { Form, Formik, FormikProps } from "formik";
import { ButtonForm } from "@/components/Form/ButtonForm";
import Model from "@/components/Model";
import { SelectForm } from "@/components/Form/SelectForm";
import { LoadingForm } from "@/components/Form/loadingForm";
import { getTranslation } from "@/ni18n/i18n";
import { FormikHelpers } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { IStudentInstallment } from "@/services/admin/studentInstallment";
import { IStudentEnrollment, useStudentEnrollmentUpdatePriceMutation } from "@/services/admin/studentEnrollment";
import { InputCurrencyMaskForm } from "@/components/Form/inputForm";
export interface FormValues {
  amount: number;
}
const UpdatePriceComponent = ({
  open,
  setOpen,
  data,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IStudentEnrollment;
}) => {
  const { t } = getTranslation();

  const [
    StudentEnrollmentUpdatePrice,
    { isLoading: isLoadingStudentEnrollmentUpdatePrice },
  ] = useStudentEnrollmentUpdatePriceMutation();

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>,
    setOpen: any
  ) => {
    try {
      await StudentEnrollmentUpdatePrice({
        id: data.id,
        amount: Number(values.amount),
      }).unwrap();

      toast.success(
        t(
          data && data.id
            ? "common.updated-successfully"
            : "common.updated-successfully"
        ),
        { autoClose: 30000 }
      );
      resetForm();
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message == "name already exist") {
          return toast.error(t("ClassPage.name-already-exists"), {
            autoClose: 30000,
          });
        }

        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };
  const schoolSchema = Yup.object().shape({
    amount: Yup.number()
      .min(0, t("common.must-min-is-one"))
      .required(t("common.this-field-is-required")),
  });

  return (
    <Model
      title={t(
        data && data?.id
          ? "StudentInstallmentPage.update-info"
          : "StudentInstallmentPage.create-info"
      )}
      open={open}
      setOpen={setOpen}
    >
      {false ? (
        <LoadingForm className="!h-36" />
      ) : (
        <Formik<FormValues>
          initialValues={{
            amount: data?.amount ?? 0,
          }}
          validationSchema={schoolSchema}
          onSubmit={(values, formikHelpers) => {
            handleSubmit(values, formikHelpers, setOpen);
          }}
        >
          {(props: FormikProps<any>) => (
            <Form className={"flex flex-col gap-4"}>
              <InputCurrencyMaskForm
                formikProps={props}
                name={"amount"}
                title={t("StudentInstallmentPage.amount")}
                placeholder={t("StudentInstallmentPage.enter-amount")}
                iconRight={
                  <span className="font-bold text-teal-500 bg-teal-500/20 h-full justify-center items-center rounded-md flex text-xs px-1">
                    {t("IQD")}
                  </span>
                }
              />

              <div className="flex flex-row-reverse gap-2">
                <ButtonForm
                  props={{
                    type: "submit",
                    className: `w-full`,
                  }}
                  title={t("common.save")}
                  isLoading={isLoadingStudentEnrollmentUpdatePrice}
                />
              </div>
            </Form>
          )}
        </Formik>
      )}
    </Model>
  );
};

export default UpdatePriceComponent;
