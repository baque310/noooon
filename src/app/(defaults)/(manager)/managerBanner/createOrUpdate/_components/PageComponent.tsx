"use client"

import React from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';

import { getTranslation } from "@/ni18n/i18n";
import { AddManagerBannerPayload, useLazyManagerBannerGetDataByIdQuery, useManagerBannerCreateMutation, useManagerBannerUpdateMutation } from "@/services/Manager/Banner";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
export interface FormValues extends AddManagerBannerPayload {

}
import { ButtonForm } from '@/components/Form/ButtonForm';
import { Form, Formik, FormikProps } from 'formik';
import { InputForm } from '@/components/Form/inputForm';
import { UploadFileForm } from '@/components/Form/uploadFileForm';

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [ManagerBannerGetDataById, { currentData: data, isFetching }] = useLazyManagerBannerGetDataByIdQuery()
  useEffect(() => {
    if (id) {
      ManagerBannerGetDataById({ id: String(id) })
        .then((data) => {
          if (!data.data) {
            router.back();
          }
        });
    }
  }, [id])
  const [ManagerBannerCreate, { isLoading: isLoadingManagerBannerCreate }] = useManagerBannerCreateMutation();
  const [ManagerBannerUpdate, { isLoading: isLoadingManagerBannerUpdate }] = useManagerBannerUpdateMutation();

  const handleSubmit = async (
    values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {

      const formData = new FormData();
      if (typeof values.url === "string") {
        delete (values as any).url;
      }
      for (const key in values) {
        if ((values as any)[key]) {
          formData.append(key, (values as any)[key]);
        }
      }

      if (id) {
        await ManagerBannerUpdate({
          body: formData,
          id: String(id),
        }
        ).unwrap()

      } else {
        await ManagerBannerCreate(formData).unwrap()
      }
      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000, });
      resetForm();
      if (id) {
        router.back();
      }
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const managerBannerSchema = Yup.object().shape({
    title: Yup.string().required(t("common.this-field-is-required")),
    url: Yup.string().required(t("common.this-field-is-required")),
  })

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "ManagerBannerPage.update-info" : "ManagerBannerPage.add")} />

        {isFetching ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              title: data?.title ?? "",
              description: data?.description ?? "",
              url: data?.url ?? "",
            }}
            validationSchema={managerBannerSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("ManagerBannerPage.ManagerBannerInformation")}
                  </div>
                  <InputForm
                    formikProps={props}
                    name={"title"}
                    title={t("ManagerBannerPage.title")}
                    placeholder={t("ManagerBannerPage.enter-title")}
                  />
                  <InputForm
                    formikProps={props}
                    name={"description"}
                    title={t("ManagerBannerPage.description")}
                    placeholder={t("ManagerBannerPage.enter-description")}
                    props={{
                      ...{ as: "textarea" } as any
                    }}

                  />
                </div>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("ManagerBannerPage.img-info")}</div>
                  <UploadFileForm
                    valueFileName={props.values.url}
                    formikProps={props}
                    name={"url"}
                    title={t("ManagerBannerPage.url")}
                    placeholder={""}
                  />
                </div>
                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",

                    }}
                    title={t("common.save")}
                    isLoading={isLoadingManagerBannerUpdate || isLoadingManagerBannerCreate}
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

export default PageComponent

