"use client";
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";

import { OptionType, SelectForm } from "@/components/Form/SelectForm";
import { BackButton } from "@/components/common/BackButton";
import { InputForm } from "@/components/Form/inputForm";
import { LoadingForm } from "@/components/Form/loadingForm";
import { getTranslation } from "../../../../../ni18n/i18n";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { RolePageAndActionBasedComponent } from "@/components/Provider/RolePageAndActionBasedComponent";
import { ComplaintChangeStatusPayload, useComplaintChangeStatusMutation, useLazyComplaintGetDataByIdQuery } from "@/services/admin/complaint";

export interface FormValues extends ComplaintChangeStatusPayload {}

const ChangeStatusComplaintModel = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const [ComplaintGetDataById, { currentData: DataComplaintGetDataById, isFetching }] = useLazyComplaintGetDataByIdQuery();
  useEffect(() => {
    if (id) {
      ComplaintGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);

  const [status, setStatus] = useState<String>();
  const validationSchema = Yup.object().shape({
    status: Yup.string().required(t("common.this-field-is-required")),
    // ...(status == "rejected" && {
    //   reason: Yup.string().required(t("common.this-field-is-required")),
    // }),
  });
  const [ComplaintChangeStatus, { isLoading: isLoadingComplaintChangeStatus }] = useComplaintChangeStatusMutation();
  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {
      await ComplaintChangeStatus({
        id: values.id,
        status: values.status,
        reason: values.reason,
      }).unwrap();
      toast.success(t("common.changeStatus-successfully"), {
        autoClose: 30000,
      });
      resetForm();
      router.back();
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error.data && error.data.message) {
        return toast.error(error.data.message, { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
      return;
    }
  };

  return (
    <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
      <BackButton title={t("ComplaintPage.changeStatus-complaints")} />
      {isFetching ? (
        <LoadingForm />
      ) : (
        <Formik<FormValues>
          initialValues={{
            id: String(id),
            status: DataComplaintGetDataById?.approval_status ?? "",
            reason: DataComplaintGetDataById?.reason ?? "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}>
          {(props: FormikProps<any>) => (
            <Form className={"flex flex-col gap-4 p-4"}>
              <div className="Card">
                <SelectForm
                  formikProps={props}
                  name={"status"}
                  title={t("common.status")}
                  placeholder={t("common.choses-status")}
                  options={
                    ["approved", "pending", "rejected"].map((item) => {
                      return { label: t(item as any), value: item };
                    }) as []
                  }
                  props={{
                    isClearable: true,
                    onChange(val) {
                      props.setFieldValue(`status`, (val as OptionType)?.value ?? "");
                      setStatus((val as OptionType)?.value ?? "");
                    },
                  }}
                />
                {/* {status == "rejected" && ( */}
                <InputForm
                  formikProps={props}
                  name={"reason"}
                  title={t("ComplaintPage.reason")}
                  placeholder={t("ComplaintPage.enter-reason")}
                  props={{
                    ...({ as: "textarea" } as any),
                  }}
                />
                {/* )} */}
              </div>
              <div className="flex flex-row-reverse gap-2">
                {
                  <RolePageAndActionBasedComponent
                    component={(props) => {
                      return (
                        <button
                          type="submit"
                          disabled={props?.disabled}
                          className={`${
                            props?.disabled && "hidden"
                          } mt-1 flex w-fit items-center justify-center gap-1 rounded border  border-primary/70   bg-primary px-2 py-1 text-white   transition-transform hover:scale-[1.01]`}>
                          {t("common.changeStatus")}
                          {isLoadingComplaintChangeStatus && <div className="loaderDotsWhite"></div>}
                        </button>
                      );
                    }}
                    resource={"complaint"}
                    permission={["update-any", "update-own"]}
                  />
                }
              </div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default ChangeStatusComplaintModel;
