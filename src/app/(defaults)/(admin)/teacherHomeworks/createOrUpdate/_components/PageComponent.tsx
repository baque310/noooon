"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Formik, Form, FormikHelpers, FormikProps } from "formik";
import * as Yup from "yup";

// UI Components
import { BackButton } from "@/components/common/BackButton";
import { LoadingForm } from "@/components/Form/loadingForm";
import { InputForm } from "@/components/Form/inputForm";
import { DateTimeForm } from "@/components/Form/DateTimeForm";
import { UploadFileForm } from "@/components/Form/uploadFileForm";
import { SelectForm } from "@/components/Form/SelectForm";
import { ButtonForm } from "@/components/Form/ButtonForm";
import {
  CheckBoxForm,
  CheckBoxFormWithCustom,
} from "@/components/Form/CheckBoxForm";

// API Services
import {
  AddTeacherHomeworksPayload,
  useLazyTeacherHomeworksGetDataByIdQuery,
  useTeacherHomeworksCreateMutation,
  useTeacherHomeworksUpdateMutation,
} from "@/services/admin/teacherHomeworks";
import { useTeacherSubjectGetDataQuery } from "@/services/admin/TeacherSubject";
import { useStudentListQuery } from "@/services/admin/studentEnrollment";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import { useSettingGetDataQuery } from "@/services/Setting";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { getTranslation } from "@/ni18n/i18n";
import { Attachments } from "./Attachments";

export interface FormValues extends AddTeacherHomeworksPayload {
  schoolYearId?: string;
  allStudentsThisASectionsORClasses?: string;
}

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // Fetching data
  const { currentData: settings, isFetching: isFetchingSettings } =
    useSettingGetDataQuery();
  const [fetchHomeworkById, { currentData: data, isFetching }] =
    useLazyTeacherHomeworksGetDataByIdQuery();
  const [createHomework, { isLoading: isCreating }] =
    useTeacherHomeworksCreateMutation();
  const [updateHomework, { isLoading: isUpdating }] =
    useTeacherHomeworksUpdateMutation();
  const { currentData: schoolYears, isFetching: isFetchingSchoolYears } =
    useSchoolYearGetDataQuery();
  const { currentData: stages, isFetching: isFetchingStages } =
    useStageGetDataQuery();

  // States
  const [stageId, setStageId] = useState<string>();
  const [classId, setClassId] = useState<string>();
  const [sectionId, setSectionId] = useState<string>();
  const [schoolYearId, setSchoolYearId] = useState<string>();
  const [teacherId, setTeacherId] = useState<string>();

  const { currentData: teacherSubjects, isFetching: isFetchingSubjects } =
    useTeacherSubjectGetDataQuery({
      schoolYearId,
      stageId,
      classId,
    });
  const { currentData: students, isFetching: isFetchingStudents } =
    useStudentListQuery({ schoolYearId, stageId, classId, sectionId });

  useEffect(() => {
    if (id) {
      fetchHomeworkById({ id }).then((res) => {
        if (!res.data) router.back();
      });
    }
  }, [id]);

  useEffect(() => {
    if (settings?.CurrentSchoolYear?.id) {
      setSchoolYearId(settings.CurrentSchoolYear.id);
    }
  }, [settings]);

  const validationSchema = Yup.object().shape({
    title: Yup.string().required(t("common.this-field-is-required")),
    content: Yup.string().required(t("common.this-field-is-required")),
    dueDate: Yup.string().required(t("common.this-field-is-required")),
    teacherSubjectId: Yup.string().required(t("common.this-field-is-required")),
    // teacherId: Yup.string().required(t("common.this-field-is-required")),
  });

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("dueDate", values.dueDate);
      formData.append("teacherSubjectId", values.teacherSubjectId);
      values.attachments?.map((file) => {
        formData.append("attachments", file);
      });

      if (values.allStudentsThisASectionsORClasses === "TRUE") {
        formData.append(
          "studentIds",
          JSON.stringify(students?.map((item) => item.id) || [])
        );
      } else {
        formData.append("studentIds", JSON.stringify(values.studentIds));
      }

      if (id) {
        await updateHomework({
          id,
          teacherId:
            teacherSubjects?.find((item) => item.id === values.teacherSubjectId)
              ?.Teacher.id || "",
          body: {
            title: values.title,
            content: values.content,
            dueDate: values.dueDate,
            teacherSubjectId: values.teacherSubjectId,

            studentIds:
              values.allStudentsThisASectionsORClasses === "TRUE"
                ? JSON.stringify(students?.map((item) => item.id) || [])
                : JSON.stringify(values.studentIds),
          },
        }).unwrap();
        toast.success(t("common.updated-successfully"));
      } else {
        await createHomework({
          teacherId: teacherId as string,
          body: formData,
        }).unwrap();
        toast.success(t("common.added-successfully"));
        resetForm();
      }

      router.back();
    } catch (error: any) {
      console.error("Homework operation failed:", error);
      toast.error(error?.message || JSON.stringify(error));
    }
  };

  return (
    <div className="mx-auto max-w-screen-md">
      <BackButton
        title={t(
          id ? "TeacherHomeworksPage.update-info" : "TeacherHomeworksPage.add"
        )}
      />
      {isFetching || isFetchingSettings ? (
        <LoadingForm />
      ) : (
        <Formik<FormValues>
          initialValues={{
            title: data?.title ?? "",
            content: data?.content ?? "",
            dueDate: data?.dueDate ?? "",
            teacherSubjectId: data?.teacherSubjectId ?? "",
            attachments: [],
            studentIds:
              data?.StudentHomework?.map((item) => item.studentId) ?? [],
            schoolYearId: settings?.CurrentSchoolYear?.id ?? "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {(props: FormikProps<any>) => (
            <Form className={"px-4 flex flex-col gap-4"}>
              <div className="Card flex flex-col gap-1">
                <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                  {t("TeacherHomeworksPage.infoTeacherHomeworks")}
                </div>
                <InputForm
                  formikProps={props}
                  name={"title"}
                  title={t("TeacherHomeworksPage.title")}
                  placeholder={t("TeacherHomeworksPage.enter-title")}
                />
                <InputForm
                  formikProps={props}
                  name={"content"}
                  title={t("TeacherHomeworksPage.content")}
                  placeholder={t("TeacherHomeworksPage.enter-content")}
                  props={{
                    ...({ as: "textArea" } as any),
                  }}
                />
              </div>
              <div className="Card flex flex-col gap-1">
                <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                  {t("TeacherHomeworksPage.infoTeacherHomeworks")}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectForm
                    formikProps={props}
                    name={`schoolYearId`}
                    title={t("StudentEnrollmentPage.SchoolYear")}
                    placeholder={t("StudentEnrollmentPage.enter-SchoolYear")}
                    options={
                      schoolYears?.map((item) => {
                        return {
                          label: item.from + " - " + item.to,
                          value: item.id,
                        };
                      }) ?? []
                    }
                    props={{
                      isLoading: isFetchingSchoolYears,
                      isClearable: true,
                      onChange: (e) => {
                        props.setFieldValue(
                          `schoolYearId`,
                          (e as any)?.value ?? ""
                        );
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
                      stages?.map((item) => {
                        return {
                          label: t(item.name as any),
                          value: item.id,
                        };
                      }) ?? []
                    }
                    props={{
                      isLoading: isFetchingStages,
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
                        stages
                          ? stages
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
                        isLoading: isFetchingStages,
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
                        stages
                          ? stages
                              .find(
                                (item) => item.id === props?.values?.stageId
                              )
                              ?.Class?.find(
                                (item) => item.id === props?.values?.classId
                              )
                              ?.Section?.map((item) => {
                                return {
                                  label: t(item.name as any),
                                  value: item.id,
                                };
                              }) || []
                          : []
                      }
                      props={{
                        isLoading: isFetchingStages,
                        isClearable: true,
                        onChange: (e) => {
                          props.setFieldValue(
                            `sectionId`,
                            (e as any)?.value ?? ""
                          );
                          setSectionId((e as any)?.value ?? "");
                        },
                      }}
                    />
                  )}

                  <SelectForm
                    formikProps={props}
                    name={`teacherSubjectId`}
                    title={t("SectionSchedulePage.teacherSubject")}
                    placeholder={t("SectionSchedulePage.select-teacherSubject")}
                    options={
                      teacherSubjects?.map((item, index) => {
                        return {
                          label: (
                            <div className="flex gap-1">
                              <div>{item.StageSubject.Subject.name}</div>
                              <div>{"( "}</div>
                              <div>{item.Teacher.fullName}</div>
                              <div>{" )"}</div>
                            </div>
                          ),
                          value: item.id,
                          teacherId: item.Teacher.id,
                        };
                      }) || []
                    }
                    props={{
                      isClearable: true,
                      isLoading: isFetchingSubjects,
                      onChange: (e) => {
                        props.setFieldValue(
                          `teacherSubjectId`,
                          (e as any)?.value ?? ""
                        );
                        setTeacherId((e as any)?.teacherId ?? "");
                      },
                    }}
                  />
                  <DateTimeForm
                    formikProps={props}
                    name={"dueDate"}
                    title={t("TeacherHomeworksPage.dueDate")}
                    placeholder={t("TeacherHomeworksPage.enter-dueDate")}
                  />
                </div>
              </div>

              <>
                <div className="Card">
                  <div className="text-base font-semibold text-black dark:text-white-dark my-2">
                    <CheckBoxFormWithCustom
                      formikProps={props}
                      name="allStudentsThisASectionsORClasses"
                      title={t(
                        "NotificationPage.allStudentsThisASectionsORClasses"
                      )}
                    />
                  </div>
                </div>

                <>
                  {isFetchingStudents ? (
                    <div className="flex justify-center">
                      <div className="loader !bg-primary !w-8 !h-8" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {props.values.allStudentsThisASectionsORClasses !==
                        "TRUE" &&
                        students?.map((item, index) => (
                          <div className="Card !p-3" key={item.id}>
                            {/* Use item.value for key if it's unique */}
                            <CheckBoxForm
                              key={index}
                              formikProps={props}
                              name={`studentIds.${index}`}
                              title={`${item.fullName}`}
                              props={{
                                checked: props.values.studentIds.some(
                                  (it: any) => it == item.id
                                ),
                                value: props.values.studentIds.some(
                                  (it: any) => it == item.id
                                ),
                                onChange: (e) => {
                                  if (e.target.checked) {
                                    let newValues =
                                      props.values.studentIds.concat(item.id);
                                    props.setFieldValue(
                                      `studentIds`,
                                      newValues
                                    );
                                  } else {
                                    let newValues =
                                      props.values.studentIds.filter(
                                        (it: any) => it != item.id
                                      );
                                    props.setFieldValue(
                                      `studentIds`,
                                      newValues
                                    );
                                  }
                                },
                              }}
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </>
              </>

              {!id && <Attachments {...props} />}

              <div className="flex flex-row-reverse gap-2">
                <ButtonForm
                  props={{
                    type: "submit",
                  }}
                  title={t("common.save")}
                  isLoading={isCreating || isUpdating}
                />
              </div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default PageComponent;
