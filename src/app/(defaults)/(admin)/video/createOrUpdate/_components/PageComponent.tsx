"use client";

import React from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";

import { getTranslation } from "@/ni18n/i18n";
import {
  AddVideoPayload,
  useLazyVideoGetDataByIdQuery,
  useVideoCreateMutation,
  useVideoUpdateMutation,
} from "@/services/admin/video";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
export interface FormValues extends AddVideoPayload {}
import { ButtonForm } from "@/components/Form/ButtonForm";
import { Form, Formik, FormikProps } from "formik";
import { InputForm } from "@/components/Form/inputForm";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [VideoGetDataById, { currentData: data, isFetching }] =
    useLazyVideoGetDataByIdQuery();
  useEffect(() => {
    if (id) {
      VideoGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);
  const [VideoCreate, { isLoading: isLoadingVideoCreate }] =
    useVideoCreateMutation();
  const [VideoUpdate, { isLoading: isLoadingVideoUpdate }] =
    useVideoUpdateMutation();

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    try {
      if (id) {
        await VideoUpdate({
          body: values,
          id: String(id),
        }).unwrap();
      } else {
        await VideoCreate(values).unwrap();
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
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const videoSchema = Yup.object().shape({
    title: Yup.string().required(t("common.this-field-is-required")),
    url: Yup.string().required(t("common.this-field-is-required")),
  });

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "VideoPage.update-info" : "VideoPage.add")} />

        {isFetching ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              title: data?.title ?? "",
              description: data?.description ?? "",
              url: data?.url ?? "", 
            }}
            validationSchema={videoSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("VideoPage.VideoInformation")}
                  </div>
                  <InputForm
                    formikProps={props}
                    name={"title"}
                    title={t("VideoPage.title")}
                    placeholder={t("VideoPage.enter-title")}
                  />

                  <InputForm
                    formikProps={props}
                    name={"description"}
                    title={t("VideoPage.description")}
                    placeholder={t("VideoPage.enter-description")}
                    props={{
                      ...({ as: "textarea" } as any),
                    }}
                  />
                  <InputForm
                    formikProps={props}
                    name={"url"}
                    title={t("VideoPage.url")}
                    placeholder={t("VideoPage.enter-url")}
                  />
                </div>

                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",
                    }}
                    title={t("common.save")}
                    isLoading={isLoadingVideoUpdate || isLoadingVideoCreate}
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
