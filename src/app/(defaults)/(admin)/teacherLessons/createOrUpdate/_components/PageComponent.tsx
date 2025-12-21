"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Formik, Form, FormikHelpers, FormikProps } from "formik";
import * as Yup from "yup";
import { BookOpen, User, Rows3, SquareStack, GraduationCap } from "lucide-react";

// UI Components
import { BackButton } from "@/components/common/BackButton";
import { InputForm } from "@/components/Form/inputForm";
import { SelectForm } from "@/components/Form/SelectForm";
import { ButtonForm } from "@/components/Form/ButtonForm";
import { CheckBoxForm, CheckBoxFormWithCustom } from "@/components/Form/CheckBoxForm";

// API Services
import { AddTeacherLessonsPayload, useLazyTeacherLessonsGetDataByIdQuery, useTeacherLessonsCreateMutation, useTeacherLessonsUpdateMutation } from "@/services/admin/teacherLessons";
import { useTeacherSubjectGetDataQuery } from "@/services/admin/TeacherSubject";
import { useStudentListQuery } from "@/services/admin/studentEnrollment";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import { useSettingGetDataQuery } from "@/services/Setting";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { getTranslation } from "@/ni18n/i18n";
import { Attachments } from "./Attachments";

export interface FormValues extends AddTeacherLessonsPayload {
  schoolYearId?: string;
  allStudentsThisASectionsORClasses?: string;
}

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // Fetching data
  const { currentData: settings, isFetching: isFetchingSettings } = useSettingGetDataQuery();
  const [fetchLessonById, { currentData: data, isFetching }] = useLazyTeacherLessonsGetDataByIdQuery();
  const [createLesson, { isLoading: isCreating }] = useTeacherLessonsCreateMutation();
  const [updateLesson, { isLoading: isUpdating }] = useTeacherLessonsUpdateMutation();
  const { currentData: schoolYears, isFetching: isFetchingSchoolYears } = useSchoolYearGetDataQuery();
  const { currentData: stages, isFetching: isFetchingStages } = useStageGetDataQuery();

  // States
  const [stageId, setStageId] = useState<string>();
  const [classId, setClassId] = useState<string>();
  const [sectionId, setSectionId] = useState<string>();
  const [schoolYearId, setSchoolYearId] = useState<string>();
  const [teacherId, setTeacherId] = useState<string>();
  const [studentSearch, setStudentSearch] = useState("");

  const { currentData: teacherSubjects, isFetching: isFetchingSubjects } = useTeacherSubjectGetDataQuery({
    schoolYearId,
    stageId,
    classId,
  });
  const { currentData: students, isFetching: isFetchingStudents } = useStudentListQuery({ schoolYearId, stageId, classId, sectionId });

  useEffect(() => {
    if (id) {
      fetchLessonById({ id }).then((res) => {
        if (!res.data) router.back();
      });
    }
  }, [id]);

  useEffect(() => {
    if (settings?.CurrentSchoolYear?.id) {
      setSchoolYearId(settings.CurrentSchoolYear.id);
    }
  }, [settings]);

  // Enhanced filtered students with search
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (!studentSearch.trim()) return students;

    return students.filter((student) => student.fullName.toLowerCase().includes(studentSearch.toLowerCase()));
  }, [students, studentSearch]);

  const handleSelectAllStudents = (props: FormikProps<any>, checked: boolean) => {
    if (checked) {
      const allStudentIds = filteredStudents.map((student) => student.id);
      props.setFieldValue("studentIds", allStudentIds);
    } else {
      props.setFieldValue("studentIds", []);
    }
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required(t("common.this-field-is-required")),
    content: Yup.string().required(t("common.this-field-is-required")),
    teacherSubjectId: Yup.string().required(t("common.this-field-is-required")),
    // teacherId: Yup.string().required(t("common.this-field-is-required")),
  });

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("teacherSubjectId", values.teacherSubjectId);
      values.attachments?.map((file) => {
        formData.append("attachments", file);
      });

      if (values.allStudentsThisASectionsORClasses === "TRUE") {
        formData.append("studentIds", JSON.stringify(students?.map((item) => item.id) || []));
      } else {
        formData.append("studentIds", JSON.stringify(values.studentIds));
      }

      if (id) {
        await updateLesson({
          id,
          teacherId: teacherSubjects?.find((item) => item.id === values.teacherSubjectId)?.Teacher.id || "",
          body: {
            title: values.title,
            content: values.content,
            teacherSubjectId: values.teacherSubjectId,

            studentIds: values.allStudentsThisASectionsORClasses === "TRUE" ? JSON.stringify(students?.map((item) => item.id) || []) : JSON.stringify(values.studentIds),
          },
        }).unwrap();
        toast.success(t("common.updated-successfully"));
      } else {
        await createLesson({
          teacherId: teacherId as string,
          body: formData,
        }).unwrap();
        toast.success(t("common.added-successfully"));
        resetForm();
      }

      router.back();
    } catch (error: any) {
      console.error("Lesson operation failed:", error);
      toast.error(error?.message || JSON.stringify(error));
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <BackButton title={t(id ? "TeacherLessonsPage.update-info" : "TeacherLessonsPage.add")} />

      {isFetching || isFetchingSettings ? (
        <div className="space-y-6 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      ) : (
        <Formik<FormValues>
          initialValues={{
            title: data?.title ?? "",
            content: data?.content ?? "",
            teacherSubjectId: data?.teacherSubjectId ?? "",
            attachments: [],
            studentIds: data?.StudentLesson?.map((item) => item.studentId) ?? [],
            schoolYearId: settings?.CurrentSchoolYear?.id ?? "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize>
          {(props: FormikProps<any>) => (
            <Form className="space-y-6 p-6">
              {/* Basic Information Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h2 className="px-2 text-xl font-semibold text-gray-900 dark:text-white">{t("TeacherLessonsPage.infoTeacherLessons")}</h2>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <InputForm formikProps={props} name="title" title={t("TeacherLessonsPage.title")} placeholder={t("TeacherLessonsPage.enter-title")} />
                  <InputForm
                    formikProps={props}
                    name="content"
                    title={t("TeacherLessonsPage.content")}
                    placeholder={t("TeacherLessonsPage.enter-content")}
                    props={
                      {
                        as: "textarea",
                        rows: 4,
                        className: "min-h-[120px] resize-vertical",
                      } as any
                    }
                  />
                </div>
              </div>

              {/* Settings Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="px-2 text-xl font-semibold text-gray-900 dark:text-white">{t("TeacherLessonsPage.otherInfoTeacherLessons")}</h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SelectForm
                      formikProps={props}
                      name="schoolYearId"
                      title={t("StudentEnrollmentPage.SchoolYear")}
                      placeholder={t("StudentEnrollmentPage.enter-SchoolYear")}
                      options={
                        schoolYears?.map((item) => ({
                          label: `${item.from} - ${item.to}`,
                          value: item.id,
                        })) ?? []
                      }
                      props={{
                        isLoading: isFetchingSchoolYears,
                        isClearable: true,
                        onChange: (e) => {
                          props.setFieldValue("schoolYearId", (e as any)?.value ?? "");
                          setSchoolYearId((e as any)?.value ?? "");
                        },
                      }}
                    />

                    <SelectForm
                      formikProps={props}
                      name="stageId"
                      title={t("StageSubjectPage.StageName")}
                      placeholder={t("SectionSchedulePage.select-StageName")}
                      options={
                        stages?.map((item) => ({
                          label: t(item.name as any),
                          value: item.id,
                        })) ?? []
                      }
                      props={{
                        isLoading: isFetchingStages,
                        isClearable: true,
                        onChange: (e) => {
                          props.setFieldValue("stageId", (e as any)?.value ?? "");
                          props.setFieldValue("classId", undefined);
                          setStageId((e as any)?.value ?? "");
                          setClassId(undefined);
                          setSectionId(undefined);
                        },
                      }}
                    />

                    {/* Conditional class select */}
                    {props.values?.stageId && (
                      <SelectForm
                        formikProps={props}
                        name="classId"
                        title={t("SectionSchedulePage.ClassName")}
                        placeholder={t("SectionSchedulePage.select-ClassName")}
                        options={
                          stages
                            ? stages
                                .find((item) => item.id === props.values?.stageId)
                                ?.Class?.map((item) => ({
                                  label: t(item.name as any),
                                  value: item.id,
                                })) || []
                            : []
                        }
                        props={{
                          isLoading: isFetchingStages,
                          isClearable: true,
                          onChange: (e) => {
                            const value = (e as any)?.value ?? "";
                            props.setFieldValue("classId", value);
                            props.setFieldValue("sectionId", undefined);
                            setClassId(value);
                            setSectionId(undefined);
                          },
                        }}
                      />
                    )}

                    {/* Conditional section select */}
                    {props?.values?.classId && (
                      <SelectForm
                        formikProps={props}
                        name="sectionId"
                        title={t("SectionSchedulePage.SectionName")}
                        placeholder={t("SectionSchedulePage.select-SectionName")}
                        options={
                          stages
                            ? stages
                                .find((item) => item.id === props?.values?.stageId)
                                ?.Class?.find((item) => item.id === props?.values?.classId)
                                ?.Section?.map((item) => ({
                                  label: t(item.name as any),
                                  value: item.id,
                                })) || []
                            : []
                        }
                        props={{
                          isLoading: isFetchingStages,
                          isClearable: true,
                          onChange: (e) => {
                            props.setFieldValue("sectionId", (e as any)?.value ?? "");
                            setSectionId((e as any)?.value ?? "");
                          },
                        }}
                      />
                    )}

                    <SelectForm
                      formikProps={props}
                      name="teacherSubjectId"
                      title={t("SectionSchedulePage.teacherSubject")}
                      placeholder={t("SectionSchedulePage.select-teacherSubject")}
                      options={
                        teacherSubjects?.map((item) => ({
                          label: (
                            <div
                              className="group relative rounded-2xl border border-gray-200 bg-white/60 p-4 shadow-sm
                                      hover:shadow-md hover:bg-white transition-all duration-200 focus-within:ring-2
                                      focus-within:ring-blue-500 dark:border-gray-700 dark:bg-gray-900/60 dark:hover:bg-gray-900"
                              tabIndex={0}
                              aria-label="Teacher subject card">
                              {/* Header: Subject */}
                              <div className="flex items-start gap-2">
                                <span
                                  className="mt-0.5 rounded-lg p-1.5 bg-blue-50 text-blue-600 
                                              dark:bg-blue-400/10 dark:text-blue-300">
                                  <BookOpen className="size-4" aria-hidden />
                                </span>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{item.StageSubject.Subject.name}</h3>
                              </div>

                              {/* Teacher */}
                              <div className="mt-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <User className="size-4 opacity-80" aria-hidden />
                                <span className="font-medium">{item.Teacher.fullName}</span>
                              </div>

                              {/* Meta badges */}
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                                <span
                                  className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 
                                          text-gray-700 ring-1 ring-gray-200
                                          dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
                                  title="Section">
                                  <Rows3 className="size-4 opacity-70" aria-hidden />
                                  {item?.Section?.name}
                                </span>

                                <span
                                  className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 
                                          text-gray-700 ring-1 ring-gray-200
                                          dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
                                  title="Class">
                                  <SquareStack className="size-4 opacity-70" aria-hidden />
                                  {item.StageSubject.Class.name}
                                </span>

                                <span
                                  className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 
                                          text-gray-700 ring-1 ring-gray-200
                                          dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
                                  title="Stage">
                                  <GraduationCap className="size-4 opacity-70" aria-hidden />
                                  {t(item.StageSubject.Stage.name as any)}
                                </span>
                              </div>

                              {/* Optional: subtle divider & right-caret affordance */}
                              <div
                                className="pointer-events-none absolute inset-y-0 right-2 hidden items-center 
                                           opacity-0 transition-all duration-200 group-hover:flex group-hover:opacity-40">
                                <svg viewBox="0 0 24 24" className="size-4 fill-current">
                                  <path d="M9 18l6-6-6-6" />
                                </svg>
                              </div>
                            </div>
                          ),
                          value: item.id,
                          teacherId: item.Teacher.id,
                        })) || []
                      }
                      props={{
                        isClearable: true,
                        isLoading: isFetchingSubjects,
                        onChange: (e) => {
                          props.setFieldValue("teacherSubjectId", (e as any)?.value ?? "");
                          setTeacherId((e as any)?.teacherId ?? "");
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Students Selection Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                      </div>
                      <div className="px-2">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("TeacherLessonsPage.students")}</h2>
                        {students && (
                          <p className="text-sm text-gray-500 mt-1">
                            {props.values.allStudentsThisASectionsORClasses === "TRUE"
                              ? `${students.length} ${t("TeacherLessonsPage.studentsSelected")}`
                              : `${props.values.studentIds.length}/${students.length} ${t("TeacherLessonsPage.studentsSelected")}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Select All Students Option */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <CheckBoxFormWithCustom formikProps={props} name="allStudentsThisASectionsORClasses" title={t("NotificationPage.allStudentsThisASectionsORClasses")} />
                  </div>

                  {/* Individual Student Selection */}
                  {props.values.allStudentsThisASectionsORClasses !== "TRUE" && (
                    <div className="space-y-4">
                      {/* Students List */}
                      {isFetchingStudents ? (
                        <div className="flex justify-center py-12">
                          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto">
                          {filteredStudents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {filteredStudents.map((student, index) => (
                                <div
                                  key={student.id}
                                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600">
                                  <CheckBoxForm
                                    formikProps={props}
                                    name={`studentIds.${student.id}`}
                                    title={student.fullName}
                                    props={{
                                      checked: props.values.studentIds.includes(student.id),
                                      onChange: (e) => {
                                        const currentIds = props.values.studentIds;
                                        if (e.target.checked) {
                                          props.setFieldValue("studentIds", [...currentIds, student.id]);
                                        } else {
                                          props.setFieldValue(
                                            "studentIds",
                                            currentIds.filter((id: string) => id !== student.id)
                                          );
                                        }
                                      },
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                />
                              </svg>
                              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t("TeacherLessonsPage.no-students-found")}</p>
                              <p className="text-gray-500">
                                {studentSearch ? t("TeacherLessonsPage.try-adjusting-your-search-terms") : t("TeacherLessonsPage.no-students-available-for-the-selected-criteria")}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments Card */}
              {!id && <Attachments {...props} />}

              {/* Submit Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <ButtonForm
                  props={{
                    type: "submit",
                    className: "px-8 py-3   text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 font-medium",
                  }}
                  title={
                    <div className="flex items-center space-x-2">
                      {(isCreating || isUpdating) && (
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      <span className="px-3">{t(id ? "common.update" : "common.save")}</span>
                    </div>
                  }
                  isLoading={false}
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
