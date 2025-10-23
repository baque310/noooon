import { ButtonForm } from "@/components/Form/ButtonForm";
import { SelectForm } from "@/components/Form/SelectForm";
import Model from "@/components/Model";
import { getTranslation } from "@/ni18n/i18n";
import { Status } from "@/services/admin/installmentPayment";
import { useOtherPaymentChangeStatusMutation } from "@/services/admin/other-payment";
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import React, { useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

export interface FormValues {
  status: string;
}

export const ChangeStatusOtherPaymentsComponent = ({ data }: { data: any }) => {
  const { t } = getTranslation();
  const [open, setOpen] = useState(false);

  const [otherPaymentChangeStatus, { isLoading: isLoadingChangeStatus }] = useOtherPaymentChangeStatusMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {
      await otherPaymentChangeStatus({ id: data?.id, order_status: values.status }).unwrap();
      setOpen(false);
      toast.success(t("common.updated-successfully"), { autoClose: 30000 });
      resetForm();
    } catch (error: any) {
      console.error("Failed to change status:", error);
      if (error) {
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const bannerSchema = Yup.object().shape({
    status: Yup.string().required(t("common.this-field-is-required")),
  });

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setOpen(true);
      }}
      className="flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2">
      <div className="flex items-center gap-2">
        {data?.paymentStatus === "paid" ? (
          <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-lg font-medium">
            {t(data?.paymentStatus ?? data?.isPaid)}
          </span>
        ) : (
          <span className="text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded-lg font-medium">{t(data?.paymentStatus ?? data?.isPaid)}</span>
        )}
      </div>

      {open && (
        <Model title={t("common.changeStatus")} open={open} setOpen={setOpen}>
          <Formik<FormValues>
            initialValues={{
              status: (data?.paymentStatus as string) ?? (data?.isPaid as string) ?? "",
            }}
            validationSchema={bannerSchema}
            onSubmit={handleSubmit}>
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <SelectForm
                  formikProps={props}
                  name={"status"}
                  title={t("OtherPaymentPage.paymentStatus")}
                  placeholder={t("OtherPaymentPage.enter-status")}
                  options={[
                    { label: t("unpaid"), value: Status.Unpaid },
                    { label: t("paid"), value: Status.Paid },
                    // { label: t("partial"), value: Status.Partial },
                  ]}
                  props={{
                    isSearchable: false,
                    isClearable: false,
                    onChange: (value: any) => {
                      props.setFieldValue("status", value?.value || "");
                    },
                  }}
                />

                <ButtonForm
                  props={{
                    type: "submit",
                    className: "w-full",
                  }}
                  title={t("common.save")}
                  isLoading={isLoadingChangeStatus}
                />
              </Form>
            )}
          </Formik>
        </Model>
      )}
    </div>
  );
};
