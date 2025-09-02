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

import { InputForm } from "@/components/Form/inputForm";
import {
  IInstallmentPayments,
  InstallmentPaymentPayload,
  PaymentMethod,
  useInstallmentPaymentUpdateMutation,
} from "@/services/admin/installmentPayment";
import { SelectForm } from "@/components/Form/SelectForm";
import { CheckBoxForm } from "@/components/Form/CheckBoxForm";
export interface FormValues extends InstallmentPaymentPayload {}
const UpdateInstallmentComponent = ({
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
  ] = useInstallmentPaymentUpdateMutation();

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>,
    setOpen: any
  ) => {
    try {
      console.log("values", values);

      await InstallmentPaymentUpdate({
        id: data.id,
        body: values,
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
  const schema = Yup.object().shape({});

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
            isPaid: data?.isPaid ?? false,
            notes: data?.notes ?? "",
            paidDate: data?.dueDate ?? "",
            paymentMethod: data?.paymentMethod ?? "Cash",
          }}
          validationSchema={schema}
          onSubmit={(values, formikHelpers) => {
            handleSubmit(values, formikHelpers, setOpen);
          }}
        >
          {(props: FormikProps<any>) => (
            <Form className={"flex flex-col gap-4"}>
              {
                <CheckBoxForm
                  formikProps={props}
                  name={"isPaid"}
                  title={t("InstallmentPage.paid")}
                  props={{
                    checked: props.values.isPaid,
                    value: props.values.isPaid,
                    onChange: (e) => {
                      props.setFieldValue("isPaid", e.target.checked);
                    },
                  }}
                />
              }
              {/* {!!props.values.isPaid && (
                <DateTimeForm
                  formikProps={props}
                  name={"paidDate"}
                  title={t("InstallmentPage.paidDate")}
                  placeholder={t("InstallmentPage.enter-paidDate")}
                />
              )} */}
              <SelectForm
                formikProps={props}
                name={"paymentMethod"}
                title={t("InstallmentPage.paymentMethod")}
                placeholder={t("InstallmentPage.enter-paymentMethod")}
                options={Object.values(PaymentMethod).map((method) => ({
                  label: method,
                  value: method,
                }))}
                props={{
                  isClearable: true,
                  onChange: (e: any) => {
                    props.setFieldValue("paymentMethod", e.value ?? "");
                  },
                }}
              />
              <InputForm
                formikProps={props}
                name={"notes"}
                title={t("InstallmentPage.notes")}
                placeholder={t("InstallmentPage.enter-notes")}
                props={{
                  ...({ as: "textarea", rows: 4 } as any),
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

export default UpdateInstallmentComponent;
