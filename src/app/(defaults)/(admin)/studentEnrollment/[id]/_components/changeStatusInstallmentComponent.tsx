"use client";

import React from "react";
import { Form, Formik, FormikProps } from "formik";
import { ButtonForm } from "@/components/Form/ButtonForm";
import Model from "@/components/Model";
import { LoadingForm } from "@/components/Form/loadingForm";
import { getTranslation } from "@/ni18n/i18n";
import { FormikHelpers } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";

import {
  IInstallmentPayments,
  InstallmentPaymentStatusPayload,
  useInstallmentPaymentUpdateStatusMutation,
} from "@/services/admin/installmentPayment";
import { SelectForm } from "@/components/Form/SelectForm";
export interface FormValues extends InstallmentPaymentStatusPayload {}
const ChangeStatusInstallmentComponent = ({
  open,
  setOpen,
  data,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IInstallmentPayments;
}) => {
  const { t } = getTranslation();

  const [
    InstallmentPaymentUpdate,
    { isLoading: isLoadingInstallmentPaymentUpdate },
  ] = useInstallmentPaymentUpdateStatusMutation();

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>,
    setOpen: any
  ) => {
    try {
      await InstallmentPaymentUpdate({
        id: data.id,
        status: values.status!,
      }).unwrap();

      toast.success(t("common.changeStatus-successfully"), {
        autoClose: 30000,
      });
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
  const schema = Yup.object().shape({
    status: Yup.string()
      .oneOf(["paid", "unpaid"])
      .required(t("common.this-field-is-required")),
  });

  return (
    <Model title={t("common.changeStatus")} open={open} setOpen={setOpen}>
      {false ? (
        <LoadingForm className="!h-36" />
      ) : (
        <Formik<FormValues>
          initialValues={{
            status: data.isPaid ?? "unpaid",
          }}
          validationSchema={schema}
          onSubmit={(values, formikHelpers) => {
            handleSubmit(values, formikHelpers, setOpen);
          }}
        >
          {(props: FormikProps<any>) => (
            <Form className={"flex flex-col gap-4"}>
              <SelectForm
                formikProps={props}
                name={"status"}
                title={t("InstallmentPage.status")}
                placeholder={t("InstallmentPage.enter-status")}
                options={[
                  {
                    label: t("unpaid"),
                    value: "unpaid",
                  },
                  {
                    label: t("paid"),
                    value: "paid",
                  },
                ]}
                props={{
                  isClearable: true,
                  onChange: (e: any) => {
                    props.setFieldValue("status", e?.value ?? "");
                  },
                }}
              />

              <div className="flex flex-row-reverse gap-2">
                <ButtonForm
                  props={{
                    type: "submit",
                    className: `w-full`,
                  }}
                  title={t("common.save")}
                  isLoading={isLoadingInstallmentPaymentUpdate}
                />
              </div>
            </Form>
          )}
        </Formik>
      )}
    </Model>
  );
};

export default ChangeStatusInstallmentComponent;
