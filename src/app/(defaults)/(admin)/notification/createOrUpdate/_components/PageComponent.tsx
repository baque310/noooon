"use client";

import React, { useEffect, useState } from "react";
import { BackButton } from "@/components/common/BackButton";

import { getTranslation } from "@/ni18n/i18n";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { ButtonForm } from "@/components/Form/ButtonForm";
import { Form, Formik, FormikProps } from "formik";
import { InputForm } from "@/components/Form/inputForm";
import { UploadFileForm } from "@/components/Form/uploadFileForm";
import { NotificationToAll, useNotificationSendForManyAllForAdminReportMutation, useNotificationSendToAllForAdminReportMutation } from "@/services/Notification";
import { CheckBoxForm, CheckBoxFormWithCustom } from "@/components/Form/CheckBoxForm";
import { useStudentListQuery } from "@/services/admin/studentEnrollment";
import { SelectForm } from "@/components/Form/SelectForm";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import { useSettingGetDataQuery } from "@/services/Setting";
import { LoadingForm } from "@/components/Form/loadingForm";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { useTeacherGetDataQuery } from "@/services/admin/teacher";
import { useParentGetDataQuery } from "@/services/admin/parent";
export interface FormValues extends NotificationToAll {
  // all?: string;
  schoolYearId?: string;
  allStudentsThisASectionsORClasses: string;
  sendTo?: string;
  image?: any;
}

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const title = searchParams.get("title") || "";
  const body = searchParams.get("body") || "";
  const { currentData: SchoolYear, isFetching: isFetchingSchoolYear } = useSchoolYearGetDataQuery();
  const { currentData: SettingGetData, isFetching: isFetchingSettingGetData } = useSettingGetDataQuery();
  const [searchTeacher, setSearchTeacher] = React.useState("");
  const { currentData: teachers, isFetching: isFetchingTeachers } = useTeacherGetDataQuery({
    skip: 1,
    take: 100,
    search: searchTeacher,
  });
  const [searchUser, setSearchUser] = useState("");
  const [schoolYearId, setSchoolYearId] = useState<string | undefined>(SettingGetData?.CurrentSchoolYear?.id ?? "");
  const [stageId, setStageId] = useState<string | undefined>(undefined);
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [sectionId, setSectionId] = useState<string | undefined>(undefined);

  const { currentData: dataUserGetData, isFetching: isFetchingUserGetDataForAdmin } = useStudentListQuery({
    // search: searchUser,
    schoolYearId: schoolYearId,
    stageId: stageId,
    classId: classId,
    sectionId: sectionId,
  });

  const [NotificationSendToAll, { isLoading: isLoadingNotificationSendToAll }] = useNotificationSendToAllForAdminReportMutation();
  const [NotificationSendForMany, { isLoading: isLoadingNotificationSendForMany }] = useNotificationSendForManyAllForAdminReportMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("body", values.body);
      formData.append("data", JSON.stringify({ type: "global", id: "" }));
      // formData.append("isAlert", "TRUE");

      if (values.image && typeof values.image !== "string") {
        formData.append("image", values.image);
      }

      if (values.sendTo == "allStudents") {
        await NotificationSendToAll(formData).unwrap();
      } else {
        const userIds = values.allStudentsThisASectionsORClasses === "TRUE" ? dataUserGetData?.map((item) => item.userId) : values.userIds;
        formData.append("userIds", JSON.stringify(userIds));

        await NotificationSendForMany(formData).unwrap();
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

  const notificationSchema = Yup.object().shape({
    title: Yup.string().required(t("common.this-field-is-required")),
    body: Yup.string().required(t("common.this-field-is-required")),
  });

  useEffect(() => {
    setSchoolYearId(SettingGetData?.CurrentSchoolYear?.id ?? "");
  }, [SettingGetData?.CurrentSchoolYear?.id]);

  const defaultSchoolYearId = SettingGetData?.CurrentSchoolYear?.id ?? "";

  const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();

  //
  const [param, setParam] = useState<
    | {
        approval_status?: string;
        search?: string;
        range?: string;
      }
    | undefined
  >();
  const params = {
    skip: 1,
    take: 30,
    ...param,
  };

  const { isFetching: isFetchingParents, currentData: parents } = useParentGetDataQuery({
    ...params,
  });
  console.log(dataUserGetData);

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "NotificationPage.update-info" : "NotificationPage.add")} />
        {isFetchingSettingGetData || isFetchingSchoolYear || isFetchingStage ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              // all: "FALSE",
              allStudentsThisASectionsORClasses: "FALSE",
              sendTo: "selectedStudents",
              userIds: [],
              title: title,
              body: body,
              schoolYearId: defaultSchoolYearId,
              image: undefined,
            }}
            validationSchema={notificationSchema}
            onSubmit={handleSubmit}>
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("NotificationPage.NotificationInformation")}</div>
                  <InputForm formikProps={props} name={"title"} title={t("NotificationPage.title")} placeholder={t("NotificationPage.enter-title")} />

                  <InputForm
                    formikProps={props}
                    name={"body"}
                    title={t("NotificationPage.body")}
                    placeholder={t("NotificationPage.enter-body")}
                    props={{
                      ...({ as: "textarea" } as any),
                    }}
                  />

                  <div className="my-2">
                    <div className="text-base font-semibold text-black dark:text-white-dark mb-2">{t("BannerPage.img-info")}</div>
                    <UploadFileForm valueFileName={props.values.image} formikProps={props} name={"image"} title={t("BannerPage.url")} placeholder={""} />
                  </div>
                </div>

                {!title && (
                  <>
                    <div className="Card">
                      <div className="text-base font-semibold text-black dark:text-white-dark mb-2">
                        <SelectForm
                          formikProps={props}
                          name={`sendTo`}
                          title={t("NotificationPage.sendTo")}
                          placeholder={t("NotificationPage.select-sendTo")}
                          options={[
                            { label: t("NotificationPage.teachers"), value: "teachers" },
                            { label: t("NotificationPage.parents"), value: "parents" },
                            { label: t("NotificationPage.selectedStudents"), value: "selectedStudents" },
                            { label: t("NotificationPage.allStudents"), value: "allStudents" },
                          ]}
                          props={{
                            isLoading: isFetchingStage,
                            isClearable: true,
                            onChange: (e) => {
                              props.setFieldValue(`sendTo`, (e as any)?.value ?? "");
                            },
                          }}
                        />
                      </div>

                      {props.values.sendTo === "selectedStudents" && (
                        // <InputForm
                        //   formikProps={props}
                        //   name={"searchUser"}
                        //   title={t("")}
                        //   placeholder={t("common.search")}
                        //   props={{
                        //     onChange: (e) => {
                        //       setSearchUser(e.target.value);
                        //       props.setFieldValue("searchUser", e.target.value);
                        //     },
                        //   }}
                        // />
                        <>
                          <SelectForm
                            formikProps={props}
                            name={`schoolYearId`}
                            title={t("StudentEnrollmentPage.SchoolYear")}
                            placeholder={t("StudentEnrollmentPage.enter-SchoolYear")}
                            options={
                              SchoolYear?.map((item) => {
                                return {
                                  label: item.from + " - " + item.to,
                                  value: item.id,
                                };
                              }) ?? []
                            }
                            props={{
                              isLoading: isFetchingSchoolYear,
                              isClearable: true,
                              onChange: (e) => {
                                props.setFieldValue(`schoolYearId`, (e as any)?.value ?? "");
                                setSchoolYearId((e as any)?.value ?? "");
                              },
                            }}
                          />

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

                          <div className="text-base font-semibold text-black dark:text-white-dark my-2">
                            <CheckBoxFormWithCustom formikProps={props} name="allStudentsThisASectionsORClasses" title={t("NotificationPage.allStudentsThisASectionsORClasses")} />
                          </div>
                        </>
                      )}
                    </div>

                    {props.values.sendTo === "parents" && (
                      <>
                        {isFetchingParents ? (
                          <div className="flex justify-center">
                            <div className="loader !bg-primary !w-8 !h-8" />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {props.values.allStudentsThisASectionsORClasses !== "TRUE" &&
                              parents?.data?.map((item, index) => (
                                <div className="Card !p-3" key={item.userId}>
                                  {/* Use item.value for key if it's unique */}
                                  <CheckBoxForm
                                    key={index}
                                    formikProps={props}
                                    name={`userIds.${index}`}
                                    title={`${item.fullName}`}
                                    props={{
                                      checked: props.values.userIds.some((it: any) => it == item.userId),
                                      value: props.values.userIds.some((it: any) => it == item.userId),
                                      onChange: (e) => {
                                        if (e.target.checked) {
                                          let newValues = props.values.userIds.concat(item.userId);
                                          props.setFieldValue(`userIds`, newValues);
                                        } else {
                                          let newValues = props.values.userIds.filter((it: any) => it != item.userId);
                                          props.setFieldValue(`userIds`, newValues);
                                        }
                                      },
                                    }}
                                  />
                                </div>
                              ))}
                          </div>
                        )}
                      </>
                    )}
                    {props.values.sendTo === "teachers" && (
                      <>
                        {isFetchingTeachers ? (
                          <div className="flex justify-center">
                            <div className="loader !bg-primary !w-8 !h-8" />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {props.values.allStudentsThisASectionsORClasses !== "TRUE" &&
                              teachers?.data?.map((item, index) => (
                                <div className="Card !p-3" key={item.userId}>
                                  {/* Use item.value for key if it's unique */}
                                  <CheckBoxForm
                                    key={index}
                                    formikProps={props}
                                    name={`userIds.${index}`}
                                    title={`${item.fullName}`}
                                    props={{
                                      checked: props.values.userIds.some((it: any) => it == item.userId),
                                      value: props.values.userIds.some((it: any) => it == item.userId),
                                      onChange: (e) => {
                                        if (e.target.checked) {
                                          let newValues = props.values.userIds.concat(item.userId);
                                          props.setFieldValue(`userIds`, newValues);
                                        } else {
                                          let newValues = props.values.userIds.filter((it: any) => it != item.userId);
                                          props.setFieldValue(`userIds`, newValues);
                                        }
                                      },
                                    }}
                                  />
                                </div>
                              ))}
                          </div>
                        )}
                      </>
                    )}
                    {props.values.sendTo === "selectedStudents" && (
                      <>
                        {isFetchingUserGetDataForAdmin ? (
                          <div className="flex justify-center">
                            <div className="loader !bg-primary !w-8 !h-8" />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {props.values.allStudentsThisASectionsORClasses !== "TRUE" &&
                              dataUserGetData?.map((item, index) => (
                                <div className="Card !p-3" key={item.userId}>
                                  {/* Use item.value for key if it's unique */}
                                  <CheckBoxForm
                                    key={index}
                                    formikProps={props}
                                    name={`userIds.${index}`}
                                    title={`${item.fullName}`}
                                    props={{
                                      checked: props.values.userIds.some((it: any) => it == item.userId),
                                      value: props.values.userIds.some((it: any) => it == item.userId),
                                      onChange: (e) => {
                                        if (e.target.checked) {
                                          let newValues = props.values.userIds.concat(item.userId);
                                          props.setFieldValue(`userIds`, newValues);
                                        } else {
                                          let newValues = props.values.userIds.filter((it: any) => it != item.userId);
                                          props.setFieldValue(`userIds`, newValues);
                                        }
                                      },
                                    }}
                                  />
                                </div>
                              ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",
                    }}
                    title={t("common.save")}
                    isLoading={isLoadingNotificationSendForMany || isLoadingNotificationSendToAll}
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
