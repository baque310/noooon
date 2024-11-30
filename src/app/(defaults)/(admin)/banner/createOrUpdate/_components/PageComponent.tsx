"use client"

import React from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';

import { getTranslation } from "@/ni18n/i18n";
import { AddBannerPayload, useLazyBannerGetDataByIdQuery, useBannerCreateMutation, useBannerUpdateMutation } from "@/services/admin/Banner";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
export interface FormValues extends AddBannerPayload {

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
  const [BannerGetDataById, { currentData: data, isFetching }] = useLazyBannerGetDataByIdQuery()
  useEffect(() => {
    if (id) {
      BannerGetDataById({ id: String(id) })
        .then((data) => {
          if (!data.data) {
            router.back();
          }
        });
    }
  }, [id])
  const [BannerCreate, { isLoading: isLoadingBannerCreate }] = useBannerCreateMutation();
  const [BannerUpdate, { isLoading: isLoadingBannerUpdate }] = useBannerUpdateMutation();

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
        await BannerUpdate({
          body: formData,
          id: String(id),
        }
        ).unwrap()

      } else {
        await BannerCreate(formData).unwrap()
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

  const bannerSchema = Yup.object().shape({
    title: Yup.string().required(t("common.this-field-is-required")),
    url: Yup.string().required(t("common.this-field-is-required")),
  })

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "BannerPage.update-info" : "BannerPage.add")} />

        {isFetching ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              title: data?.title ?? "",
              description: data?.description ?? "",
              url: data?.url ?? "",
            }}
            validationSchema={bannerSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("BannerPage.BannerInformation")}
                  </div>
                  <InputForm
                    formikProps={props}
                    name={"title"}
                    title={t("BannerPage.title")}
                    placeholder={t("BannerPage.enter-title")}
                  />
                  <InputForm
                    formikProps={props}
                    name={"description"}
                    title={t("BannerPage.description")}
                    placeholder={t("BannerPage.enter-description")}
                    props={{
                      ...{ as: "textarea" } as any
                    }}

                  />
                </div>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("BannerPage.img-info")}</div>
                  <UploadFileForm
                    valueFileName={props.values.url}
                    formikProps={props}
                    name={"url"}
                    title={t("BannerPage.url")}
                    placeholder={""}
                  />
                </div>
                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",

                    }}
                    title={t("common.save")}
                    isLoading={isLoadingBannerUpdate || isLoadingBannerCreate}
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

