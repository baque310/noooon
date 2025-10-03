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
  PaymentMethod,
  Status,
  useInstallmentPaymentCreateMutation,
  useInstallmentPaymentUpdateStatusMutation,
} from "@/services/admin/installmentPayment";
import { SelectForm } from "@/components/Form/SelectForm";
import { InputForm } from "@/components/Form/inputForm";

// Correct form values type
export interface FormValues extends InstallmentPaymentStatusPayload {
  status: Status;
}

const ChangeStatusInstallmentComponent = ({
  open,
  setOpen,
  data,
  outstandingAmount,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IInstallmentPayments;
  outstandingAmount: number | undefined;
}) => {
  const { t } = getTranslation();

  const [InstallmentPaymentUpdate, { isLoading: isLoadingInstallmentPaymentUpdate }] = useInstallmentPaymentUpdateStatusMutation();
  const [InstallmentPaymentCreate, { isLoading: isLoadingInstallmentPaymentCreate }] = useInstallmentPaymentCreateMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {
      if (data?.isPaid === "partial") {
        await InstallmentPaymentCreate({
          id: data.installmentId,
          body: {
            paidAmount: Number(values.paidAmount),
            paymentMethod: values.paymentMethod,
            notes: values.notes,
          },
        });
      } else {
        console.log("other");
        await InstallmentPaymentUpdate({
          id: data.id,
          status: values.status,
          body: {
            paidAmount: Number(values.paidAmount),
            paymentMethod: values.paymentMethod,
            notes: values.notes,
          },
        }).unwrap();
      }

      toast.success(t("common.changeStatus-successfully"), {
        autoClose: 30000,
      });
      resetForm();
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error?.message === "name already exist") {
        return toast.error(t("ClassPage.name-already-exists"), {
          autoClose: 30000,
        });
      }
      toast.error(JSON.stringify(error), { autoClose: 30000 });
    }
  };

  // Yup schema with enum validation
  const schema = Yup.object().shape({
    status: Yup.mixed<Status>().oneOf([Status.Paid, Status.Unpaid, Status.Partial]).required(t("common.this-field-is-required")),
  });

  return (
    <Model title={t("common.changeStatus")} open={open} setOpen={setOpen}>
      {false ? (
        <LoadingForm className="!h-36" />
      ) : (
        <Formik<FormValues>
          initialValues={{
            status: data?.isPaid ?? Status.Unpaid,
            paidAmount: data?.isPaid === "partial" ? outstandingAmount : data?.amount ?? 0,
            paymentMethod: data?.paymentMethod ?? "",
            notes: data?.notes ?? "",
          }}
          validationSchema={schema}
          onSubmit={(values, formikHelpers) => {
            handleSubmit(values, formikHelpers, setOpen);
          }}>
          {(props: FormikProps<FormValues>) => (
            <Form className="flex flex-col gap-4">
              {data?.isPaid !== "partial" && (
                <SelectForm
                  formikProps={props}
                  name="status"
                  title={t("InstallmentPage.status")}
                  placeholder={t("InstallmentPage.enter-status")}
                  options={[
                    { label: t("unpaid"), value: Status.Unpaid },
                    { label: t("paid"), value: Status.Paid },
                    { label: t("partial"), value: Status.Partial },
                  ]}
                  props={{
                    isClearable: true,
                    onChange: (e: any) => {
                      props.setFieldValue("status", e?.value ?? "");
                    },
                  }}
                />
              )}
              {props.values.status === Status.Partial && (
                <InputForm formikProps={props} name={"paidAmount"} title={t("BusPage.paidAmount")} placeholder={t("BusPage.enter-paidAmount")} />
              )}
              <SelectForm
                formikProps={props}
                name="paymentMethod"
                title={t("InstallmentPage.paymentMethod")}
                placeholder={t("InstallmentPage.enter-paymentMethod")}
                options={[
                  { label: t("Cash"), value: PaymentMethod.Cash },
                  { label: t("ZainCash"), value: PaymentMethod.ZainCash },
                  { label: t("QiCard"), value: PaymentMethod.QiCard },
                ]}
                props={{
                  isClearable: true,
                  onChange: (e: any) => {
                    props.setFieldValue("status", e?.value ?? "");
                  },
                }}
              />

              {/* <InputForm formikProps={props} name={"paymentMethod"} title={t("BusPage.paymentMethod")} placeholder={t("BusPage.enter-paymentMethod")} /> */}
              <InputForm formikProps={props} name={"notes"} title={t("BusPage.notes")} placeholder={t("BusPage.enter-notes")} />

              <div className="flex flex-row-reverse gap-2">
                <ButtonForm
                  props={{
                    type: "submit",
                    className: `w-full`,
                  }}
                  title={t("common.save")}
                  isLoading={isLoadingInstallmentPaymentUpdate || isLoadingInstallmentPaymentCreate}
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
