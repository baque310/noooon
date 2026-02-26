"use client";

import React, { useState } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";

import { getTranslation } from "@/ni18n/i18n";
import { AddGalleryPayload, useLazyGalleryGetDataByIdQuery, useGalleryCreateMutation, useGalleryUpdateMutation } from "@/services/admin/Gallery";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
export interface FormValues extends AddGalleryPayload {
  attachments: File[];
  sendToAll: boolean;
}
import { ButtonForm } from "@/components/Form/ButtonForm";
import { Form, Formik, FormikProps } from "formik";
import { InputForm } from "@/components/Form/inputForm";
import { UploadFileForm } from "@/components/Form/uploadFileForm";
import { Attachments } from "./Attachments";
import { SelectForm } from "@/components/Form/SelectForm";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { CheckBoxForm } from "@/components/Form/CheckBoxForm";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { currentData: schoolYears, isFetching: isFetchingSchoolYears } = useSchoolYearGetDataQuery();
  const [GalleryGetDataById, { currentData: data, isFetching }] = useLazyGalleryGetDataByIdQuery();
  const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();

  const [stageId, setStageId] = useState<string>();
  const [classId, setClassId] = useState<string>();
  const [sectionId, setSectionId] = useState<string>();
  // console.log(stageId, classId, sectionId);
  useEffect(() => {
    if (id) {
      GalleryGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);
  const [GalleryCreate, { isLoading: isLoadingGalleryCreate }] = useGalleryCreateMutation();
  const [GalleryUpdate, { isLoading: isLoadingGalleryUpdate }] = useGalleryUpdateMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {
      const formData = new FormData();
      values.attachments.forEach((file) => {
        formData.append("attachments", file);
      });
      formData.append("title", values.title);
      formData.append("description", values.description);
      classId && formData.append("classId", classId || "");
      sectionId && formData.append("sectionId", sectionId || "");

      if (id) {
        await GalleryUpdate({
          body: formData,
          id: String(id),
        }).unwrap();
      } else {
        await GalleryCreate(formData).unwrap();
      }
      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000 });
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
        <BackButton title={t(id ? "GalleryPage.update-info" : "GalleryPage.add")} />

        {isFetching ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              title: data?.title ?? "",
              description: data?.description ?? "",
              classId: data?.classId ?? "",
              sectionId: data?.sectionId ?? "",
              attachments: [],
              sendToAll: data?.classId === null && data?.sectionId === null ? true : false, // auto detect
            }}
            validationSchema={gallerySchema}
            onSubmit={handleSubmit}>
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("GalleryPage.GalleryInformation")}</div>
                  <InputForm formikProps={props} name={"title"} title={t("GalleryPage.title")} placeholder={t("GalleryPage.enter-title")} />
                  <InputForm formikProps={props} name={"description"} title={t("GalleryPage.description")} placeholder={t("GalleryPage.enter-description")} />
                  <br />
                  <CheckBoxForm
                    formikProps={props}
                    name={`sendToAll` as any}
                    title={`${t("GalleryPage.sendToAll")}`}
                    props={{
                      className: "rtl",
                      checked: props.values.sendToAll,
                      value: "true",
                      onChange: (e) => {
                        if (e.target.checked) {
                          props.setFieldValue(`sendToAll`, true);
                          props.setFieldValue(`stageId`, null);
                          props.setFieldValue(`classId`, null);
                          props.setFieldValue(`sectionId`, null);
                          setClassId(undefined);
                          setSectionId(undefined);
                        } else {
                          props.setFieldValue(`sendToAll`, false);
                        }
                      },
                    }}
                  />

                  {!props.values?.sendToAll && (
                    <SelectForm
                      formikProps={props}
                      name={`stageId`}
                      title={t("StageSubjectPage.StageName")}
                      placeholder={t("SectionSchedulePage.select-StageName")}
                      options={
                        stage?.map((item) => {
                          return {
                            label: t(item.name as any),
                            value: item.id,
                          };
                        }) ?? []
                      }
                      props={{
                        isLoading: isFetchingStage,
                        isClearable: true,
                        onChange: (e) => {
                          props.setFieldValue(`stageId`, (e as any)?.value ?? "");
                          props.setFieldValue(`classId`, undefined);
                          setStageId((e as any)?.value ?? "");
                          setClassId(undefined);
                          setSectionId(undefined);
                        },
                      }}
                    />
                  )}
                  {props.values?.stageId && (
                    <SelectForm
                      formikProps={props}
                      name={`classId`}
                      title={t("SectionSchedulePage.ClassName")}
                      placeholder={t("SectionSchedulePage.select-ClassName")}
                      options={
                        stage
                          ? stage
                              .find((item) => item.id === props.values?.stageId)
                              ?.Class?.map((item) => {
                                return {
                                  label: t(item.name as any),
                                  value: item.id,
                                };
                              }) || []
                          : []
                      }
                      props={{
                        isLoading: isFetchingStage,
                        isClearable: true,
                        onChange: (e) => {
                          const value = (e as any)?.value ?? "";
                          props.setFieldValue(`classId`, value);
                          props.setFieldValue(`sectionId`, undefined);
                          setClassId(value);
                          setSectionId(undefined);
                        },
                      }}
                    />
                  )}
                  {props?.values?.classId && (
                    <SelectForm
                      formikProps={props}
                      name={`sectionId`}
                      title={t("SectionSchedulePage.SectionName")}
                      placeholder={t("SectionSchedulePage.select-SectionName")}
                      options={
                        stage
                          ? stage
                              .find((item) => item.id === props?.values?.stageId)
                              ?.Class?.find((item) => item.id === props?.values?.classId)
                              ?.Section?.map((item) => {
                                return {
                                  label: t(item.name as any),
                                  value: item.id,
                                };
                              }) || []
                          : []
                      }
                      props={{
                        isLoading: isFetchingStage,
                        isClearable: true,
                        onChange: (e) => {
                          props.setFieldValue(`sectionId`, (e as any)?.value ?? "");
                          setSectionId((e as any)?.value ?? "");
                        },
                      }}
                    />
                  )}
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
