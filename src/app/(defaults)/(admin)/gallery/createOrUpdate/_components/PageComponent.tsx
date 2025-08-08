"use client";

import React from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";

import { getTranslation } from "@/ni18n/i18n";
import {
  AddGalleryPayload,
  useLazyGalleryGetDataByIdQuery,
  useGalleryCreateMutation,
  useGalleryUpdateMutation,
} from "@/services/admin/Gallery";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
export interface FormValues extends AddGalleryPayload {
  attachments: File[];
}
import { ButtonForm } from "@/components/Form/ButtonForm";
import { Form, Formik, FormikProps } from "formik";
import { InputForm } from "@/components/Form/inputForm";
import { UploadFileForm } from "@/components/Form/uploadFileForm";
import { Attachments } from "./Attachments";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [GalleryGetDataById, { currentData: data, isFetching }] =
    useLazyGalleryGetDataByIdQuery();
  useEffect(() => {
    if (id) {
      GalleryGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);
  const [GalleryCreate, { isLoading: isLoadingGalleryCreate }] =
    useGalleryCreateMutation();
  const [GalleryUpdate, { isLoading: isLoadingGalleryUpdate }] =
    useGalleryUpdateMutation();

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    try {
      const formData = new FormData();
      values.attachments.forEach((file) => {
        formData.append("attachments", file);
      });
      formData.append("title", values.title);

      if (id) {
        await GalleryUpdate({
          body: formData,
          id: String(id),
        }).unwrap();
      } else {
        await GalleryCreate(formData).unwrap();
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

  const gallerySchema = Yup.object().shape({
    title: Yup.string().required(t("common.this-field-is-required")),
  });

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton
          title={t(id ? "GalleryPage.update-info" : "GalleryPage.add")}
        />

        {isFetching ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              title: data?.title ?? "",
              attachments: [],
            }}
            validationSchema={gallerySchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("GalleryPage.GalleryInformation")}
                  </div>
                  <InputForm
                    formikProps={props}
                    name={"title"}
                    title={t("GalleryPage.title")}
                    placeholder={t("GalleryPage.enter-title")}
                  />
                </div>
                {!id && <Attachments {...props} />}
                {/* <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("GalleryPage.img-info")}</div>
                  <UploadFileForm
                    valueFileName={props.values.url}
                    formikProps={props}
                    name={"url"}
                    title={t("GalleryPage.url")}
                    placeholder={""}
                  />
                </div> */}
                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",
                    }}
                    title={t("common.save")}
                    isLoading={isLoadingGalleryUpdate || isLoadingGalleryCreate}
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
