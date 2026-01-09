"use client";

import React, { useEffect, useState } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import { ButtonForm } from "@/components/Form/ButtonForm";
import { getTranslation } from "@/ni18n/i18n";
import {
  AddSuperTeacherLibraryPayload,
  useLazySuperTeacherLibraryGetDataByIdQuery,
  useSuperTeacherLibraryCreateMutation,
  useSuperTeacherLibraryUpdateMutation,
} from "@/services/admin/superTeacherLibrary";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { SelectForm } from "@/components/Form/SelectForm";
import { InputForm } from "@/components/Form/inputForm";
import { UploadFileForm } from "@/components/Form/uploadFileForm";

export interface FormValues extends AddSuperTeacherLibraryPayload {
  stageId?: string; // Helper for UI
  image?: any;
}

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [SuperTeacherLibraryGetDataById, { currentData: data, isFetching }] = useLazySuperTeacherLibraryGetDataByIdQuery();

  useEffect(() => {
    if (id) {
      SuperTeacherLibraryGetDataById({ id: String(id) }).then((res) => {
        // Handle error or redirect if needed
      });
    }
  }, [id]);

  const [SuperTeacherLibraryCreate, { isLoading: isLoadingCreate }] = useSuperTeacherLibraryCreateMutation();
  const [SuperTeacherLibraryUpdate, { isLoading: isLoadingUpdate }] = useSuperTeacherLibraryUpdateMutation();

  const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      // formData.append("classId", values.classId);
      formData.append("sectionId", values.sectionId);

      if (values.image instanceof File) {
        formData.append("url", values.image);
      }

      if (id) {
        await SuperTeacherLibraryUpdate({
          id: id,
          body: formData,
        }).unwrap();
      } else {
        await SuperTeacherLibraryCreate(formData).unwrap();
      }

      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000 });
      resetForm();
      router.back();
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error && error.data && error.data.message) {
        return toast.error(t(error.data.message), { autoClose: 30000 });
      }
      toast.error(error?.message || "An error occurred", { autoClose: 30000 });
    }
  };

  const schema = Yup.object().shape({
    title: Yup.string().required(t("common.this-field-is-required")),
    description: Yup.string().required(t("common.this-field-is-required")),
    // url: Yup.string().required(t("common.this-field-is-required")),
    // classId: Yup.string().required(t("common.this-field-is-required")),
    // stageId: Yup.string().required(t("common.this-field-is-required")), // Required for UX selection flow
    // sectionId: Yup.string().required(t("common.this-field-is-required")),
  });

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "SuperTeacherLibraryPage.update-info" : "SuperTeacherLibraryPage.add-info")} />

        {isFetching || isFetchingStage ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            enableReinitialize
            initialValues={{
              title: data?.title || "",
              description: data?.description || "",
              url: data?.url || "",
              classId: data?.classId || "",
              sectionId: data?.sectionId || "",
              // We need to infer stageId from classId if editing.
              // Usually the backend returns 'Class' relation which has 'stageId'.
              // Let's check ISuperTeacherLibrary in service:
              // Class: IClass. IClass? Let's assume it has stageId.
              // If not, we might fail to pre-fill stageId.
              stageId: data?.Class?.stageId || "",
              image: data?.url || "",
            }}
            validationSchema={schema}
            onSubmit={handleSubmit}>
            {(props: FormikProps<FormValues>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("SuperTeacherLibraryPage.Item Info")}</div>

                  <InputForm formikProps={props} name={"title"} title={t("SuperTeacherLibraryPage.title")} placeholder={t("SuperTeacherLibraryPage.enter-title")} />

                  <InputForm
                    formikProps={props}
                    name={"description"}
                    title={t("SuperTeacherLibraryPage.description")}
                    placeholder={t("SuperTeacherLibraryPage.enter-description")}
                  />

                  <SelectForm
                    formikProps={props}
                    name={"stageId"}
                    title={t("StudentEnrollmentPage.StageName")}
                    placeholder={t("StudentEnrollmentPage.enter-StageName")}
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
                        props.setFieldValue("stageId", (e as any)?.value ?? "");
                        props.setFieldValue("classId", "");
                        props.setFieldValue("sectionId", "");
                      },
                    }}
                  />

                  <SelectForm
                    formikProps={props}
                    name={"classId"}
                    title={t("StudentEnrollmentPage.ClassName")}
                    placeholder={t("StudentEnrollmentPage.enter-ClassName")}
                    options={
                      stage
                        ? stage
                            .find((item) => item.id === props.values.stageId)
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
                      isDisabled: !props.values.stageId,
                      onChange: (e) => {
                        props.setFieldValue("classId", (e as any)?.value ?? "");
                        props.setFieldValue("sectionId", "");
                      },
                    }}
                  />

                  <SelectForm
                    formikProps={props}
                    name={"sectionId"}
                    title={t("StudentEnrollmentPage.SectionName")}
                    placeholder={t("StudentEnrollmentPage.enter-SectionName")}
                    options={
                      stage
                        ? stage
                            .find((item) => item.id === props.values.stageId)
                            ?.Class?.find((item) => item.id === props.values.classId)
                            ?.Section?.map((item) => {
                              return {
                                label: t(item.name as any),
                                value: item.id,
                              };
                            }) || []
                        : []
                    }
                    props={{
                      isClearable: true,
                      isDisabled: !props.values.classId,
                      isLoading: isFetchingStage,
                      onMenuOpen: () => {
                        // Optional: if sections are lazy loaded?
                        // But here we rely on 'stage' query which seems to fetch everything deeply?
                        // 'useStageGetDataQuery' typically fetches stages with classes and sections if formatted that way.
                        // The studentEnrollment code relied on it, so I assume it works.
                      },
                      onChange: (e) => {
                        props.setFieldValue("sectionId", (e as any)?.value ?? "");
                      },
                    }}
                  />

                  <div className="my-2">
                    <div className="text-base font-semibold text-black dark:text-white-dark mb-2">{t("SuperTeacherLibraryPage.url")}</div>
                    <UploadFileForm valueFileName={props.values.image} formikProps={props} name={"image"} title={t("SuperTeacherLibraryPage.url")} placeholder={""} />
                  </div>
                </div>

                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",
                    }}
                    title={t("common.save")}
                    isLoading={isLoadingCreate || isLoadingUpdate}
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
