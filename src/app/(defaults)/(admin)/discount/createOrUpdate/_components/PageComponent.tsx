"use client";

import React from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";

import { getTranslation } from "@/ni18n/i18n";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
export interface FormValues extends AddAdminDiscountPayload {}
import { ButtonForm } from "@/components/Form/ButtonForm";
import { Form, Formik, FormikProps } from "formik";
import { InputForm } from "@/components/Form/inputForm";
import {
  AddAdminDiscountPayload,
  useAdminDiscountCreateMutation,
  useAdminDiscountUpdateMutation,
  useLazyAdminDiscountGetDataByIdQuery,
} from "@/services/admin/discount";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [DiscountGetDataById, { currentData: data, isFetching }] =
    useLazyAdminDiscountGetDataByIdQuery();
  useEffect(() => {
    if (id) {
      DiscountGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);
  const [DiscountCreate, { isLoading: isLoadingDiscountCreate }] =
    useAdminDiscountCreateMutation();
  const [DiscountUpdate, { isLoading: isLoadingDiscountUpdate }] =
    useAdminDiscountUpdateMutation();

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    try {
      if (id) {
        await DiscountUpdate({
          body: values,
          id: String(id),
        }).unwrap();
      } else {
        await DiscountCreate(values).unwrap();
      }
      toast.success(
        t(id ? "common.updated-successfully" : "common.added-successfully"),
        { autoClose: 30000 }
      );
      resetForm();
      if (id) {
        router.back();
      }
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message) {
          return toast.error(t(error.message), { autoClose: 30000 });
        }
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const discountSchema = Yup.object().shape({
    title: Yup.string().required(t("common.this-field-is-required")),
    percentage: Yup.number()
      .min(0, t("common.must-min-is-one"))
      .max(100, t("common.must-min-is-one"))
      .required(t("common.this-field-is-required")),
  });

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton
          title={t(id ? "DiscountPage.update-info" : "DiscountPage.add")}
        />

        {isFetching ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              title: data?.title ?? "",
              percentage: data?.percentage ?? 0,
            }}
            validationSchema={discountSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("DiscountPage.DiscountInformation")}
                  </div>
                  <InputForm
                    formikProps={props}
                    name={"title"}
                    title={t("DiscountPage.title")}
                    placeholder={t("DiscountPage.enter-title")}
                  />
                  <InputForm
                    formikProps={props}
                    name={"percentage"}
                    title={t("DiscountPage.percentage")}
                    placeholder={t("DiscountPage.enter-percentage")}
                    props={{
                      type: "number",
                      min: 0,
                      max: 100,
                    }}
                  />
                </div>

                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",
                    }}
                    title={t("common.save")}
                    isLoading={
                      isLoadingDiscountUpdate || isLoadingDiscountCreate
                    }
                  />
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </>
  );
};

export default PageComponent;
