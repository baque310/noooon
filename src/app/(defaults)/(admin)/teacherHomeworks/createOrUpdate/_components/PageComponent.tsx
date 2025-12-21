"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Formik, Form, FormikHelpers, FormikProps } from "formik";
import * as Yup from "yup";
import { BookOpen, User, Rows3, SquareStack, GraduationCap, X, Users } from "lucide-react";

// UI Components
import { BackButton } from "@/components/common/BackButton";
import { InputForm } from "@/components/Form/inputForm";
import { DateTimeForm } from "@/components/Form/DateTimeForm";
import { SelectForm } from "@/components/Form/SelectForm";
import { ButtonForm } from "@/components/Form/ButtonForm";
import { CheckBoxForm, CheckBoxFormWithCustom } from "@/components/Form/CheckBoxForm";

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

interface FilterSelection {
  stageId: string;
  classId?: string;
  sectionId?: string;
  stageName: string;
  className?: string;
  sectionName?: string;
}

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // Fetching data
  const { currentData: settings, isFetching: isFetchingSettings } = useSettingGetDataQuery();
  const [fetchHomeworkById, { currentData: data, isFetching }] = useLazyTeacherHomeworksGetDataByIdQuery();
  const [createHomework, { isLoading: isCreating }] = useTeacherHomeworksCreateMutation();
  const [updateHomework, { isLoading: isUpdating }] = useTeacherHomeworksUpdateMutation();
  const { currentData: schoolYears, isFetching: isFetchingSchoolYears } = useSchoolYearGetDataQuery();
  const { currentData: stages, isFetching: isFetchingStages } = useStageGetDataQuery();

  // States
  const [stageId, setStageId] = useState<string>();
  const [classId, setClassId] = useState<string>();
  const [sectionId, setSectionId] = useState<string>();
  const [schoolYearId, setSchoolYearId] = useState<string>();
  const [teacherId, setTeacherId] = useState<string>();
  const [studentSearch, setStudentSearch] = useState("");

  // Track selected filters and accumulated students
  const [selectedFilters, setSelectedFilters] = useState<FilterSelection[]>([]);
  const [accumulatedStudentIds, setAccumulatedStudentIds] = useState<Set<string>>(new Set());
  const [accumulatedStudents, setAccumulatedStudents] = useState<any[]>([]);
  const [filterStudentMap, setFilterStudentMap] = useState<Map<number, string[]>>(new Map());

  const { currentData: teacherSubjects, isFetching: isFetchingSubjects } = useTeacherSubjectGetDataQuery({
    schoolYearId,
    stageId,
    classId,
    sectionId,
  });
  const { currentData: students, isFetching: isFetchingStudents } = useStudentListQuery({
    schoolYearId,
    stageId,
    classId,
    sectionId,
  });

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

  // Enhanced filtered students with search - includes current filter + accumulated
  const filteredStudents = useMemo(() => {
    // Combine current students with accumulated students
    const allStudents = [...accumulatedStudents];

    // Add current filter students if they're not already in accumulated
    if (students) {
      const existingIds = new Set(allStudents.map((s) => s.id));
      const newStudents = students.filter((s) => !existingIds.has(s.id));
      allStudents.push(...newStudents);
    }

    if (!studentSearch.trim()) return allStudents;

    return allStudents.filter((student) => student.fullName.toLowerCase().includes(studentSearch.toLowerCase()));
  }, [students, accumulatedStudents, studentSearch]);

  // Add current filter selection
  const addFilterSelection = () => {
    if (!stageId) {
      toast.error(t("Please select at least a stage"));
      return;
    }

    const stage = stages?.find((s) => s.id === stageId);
    const classItem = stage?.Class?.find((c) => c.id === classId);
    const section = classItem?.Section?.find((s) => s.id === sectionId);

    const newFilter: FilterSelection = {
      stageId,
      classId,
      sectionId,
      stageName: t(stage?.name as any) || "",
      className: classItem ? t(classItem.name as any) : undefined,
      sectionName: section ? t(section.name as any) : undefined,
    };

    const exists = selectedFilters.some((f) => f.stageId === stageId && f.classId === classId && f.sectionId === sectionId);

    if (exists) {
      toast.info(t("This selection is already added"));
      return;
    }

    const newFilterIndex = selectedFilters.length;
    setSelectedFilters((prev) => [...prev, newFilter]);

    if (students) {
      // Track which students belong to this filter
      const studentIdsForThisFilter = students.map((s) => s.id);
      setFilterStudentMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(newFilterIndex, studentIdsForThisFilter);
        return newMap;
      });

      // Add to accumulated
      setAccumulatedStudentIds((prev) => {
        const newSet = new Set(prev);
        students.forEach((student) => newSet.add(student.id));
        return newSet;
      });

      setAccumulatedStudents((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const newStudents = students.filter((s) => !existingIds.has(s.id));
        return [...prev, ...newStudents];
      });
    }

    toast.success(t("Selection added successfully"));
  };

  // Remove a filter selection
  // const removeFilterSelection = (index: number, props: FormikProps<any>) => {
  //   const removedFilter = selectedFilters[index];
  //   setSelectedFilters((prev) => prev.filter((_, i) => i !== index));

  //   // Recalculate accumulated students based on remaining filters
  //   // For now, we'll just show a message, but ideally you'd refetch
  //   toast.info(t("Selection removed. Students from all remaining filters are still selected."));
  // };
  const removeFilterSelection = (index: number, props: FormikProps<any>) => {
    const newFilters = selectedFilters.filter((_, i) => i !== index);
    setSelectedFilters(newFilters);

    // Get students from removed filter
    const removedStudentIds = filterStudentMap.get(index) || [];

    // Update the map (shift indices)
    const newMap = new Map<number, string[]>();
    filterStudentMap.forEach((studentIds, filterIndex) => {
      if (filterIndex < index) {
        newMap.set(filterIndex, studentIds);
      } else if (filterIndex > index) {
        newMap.set(filterIndex - 1, studentIds);
      }
    });
    setFilterStudentMap(newMap);

    // Collect all student IDs that should remain (from other filters)
    const remainingStudentIds = new Set<string>();
    newMap.forEach((studentIds) => {
      studentIds.forEach((id) => remainingStudentIds.add(id));
    });

    // Update accumulated students
    const newAccumulatedStudents = accumulatedStudents.filter((student) => remainingStudentIds.has(student.id));

    setAccumulatedStudents(newAccumulatedStudents);
    setAccumulatedStudentIds(remainingStudentIds);

    // Update form values - remove students that are no longer in any filter
    const currentSelectedIds = props.values.studentIds;
    const validIds = currentSelectedIds.filter((id: string) => remainingStudentIds.has(id));
    props.setFieldValue("studentIds", validIds);

    toast.success(t("Selection removed successfully"));
  };

  // Get display list of accumulated students with search
  const displayAccumulatedStudents = useMemo(() => {
    if (!studentSearch.trim()) return accumulatedStudents;

    return accumulatedStudents.filter((student) => student.fullName.toLowerCase().includes(studentSearch.toLowerCase()));
  }, [accumulatedStudents, studentSearch]);

  // Get current filter display for preview
  const currentFilterPreview = useMemo(() => {
    if (!stageId) return null;

    const stage = stages?.find((s) => s.id === stageId);
    const classItem = stage?.Class?.find((c) => c.id === classId);
    const section = classItem?.Section?.find((s) => s.id === sectionId);

    return {
      stageName: stage ? t(stage.name as any) : "",
      className: classItem ? t(classItem.name as any) : undefined,
      sectionName: section ? t(section.name as any) : undefined,
    };
  }, [stageId, classId, sectionId, stages, t]);

  const validationSchema = Yup.object().shape({
    title: Yup.string().required(t("common.this-field-is-required")),
    content: Yup.string().required(t("common.this-field-is-required")),
    dueDate: Yup.string().required(t("common.this-field-is-required")),
    teacherSubjectId: Yup.string().required(t("common.this-field-is-required")),
  });

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("dueDate", values.dueDate);
      formData.append("teacherSubjectId", values.teacherSubjectId);
      values.attachments?.map((file) => {
        formData.append("attachments", file);
      });

      // Use accumulated student IDs
      const finalStudentIds = Array.from(accumulatedStudentIds).filter((id) => values.studentIds.includes(id));

      if (values.allStudentsThisASectionsORClasses === "TRUE") {
        formData.append("studentIds", JSON.stringify(Array.from(accumulatedStudentIds)));
      } else {
        formData.append("studentIds", JSON.stringify(finalStudentIds));
      }

      if (id) {
        await updateHomework({
          id,
          teacherId: teacherSubjects?.find((item) => item.id === values.teacherSubjectId)?.Teacher.id || "",
          body: {
            title: values.title,
            content: values.content,
            dueDate: values.dueDate,
            teacherSubjectId: values.teacherSubjectId,
            studentIds: values.allStudentsThisASectionsORClasses === "TRUE" ? JSON.stringify(Array.from(accumulatedStudentIds)) : JSON.stringify(finalStudentIds),
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
    <div className="mx-auto max-w-4xl">
      <BackButton title={t(id ? "TeacherHomeworksPage.update-info" : "TeacherHomeworksPage.add")} />

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
            dueDate: data?.dueDate ?? "",
            teacherSubjectId: data?.teacherSubjectId ?? "",
            attachments: [],
            studentIds: data?.StudentHomework?.map((item) => item.studentId) ?? [],
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
                    <h2 className="px-2 text-xl font-semibold text-gray-900 dark:text-white">{t("TeacherHomeworksPage.infoTeacherHomeworks")}</h2>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <InputForm formikProps={props} name="title" title={t("TeacherHomeworksPage.title")} placeholder={t("TeacherHomeworksPage.enter-title")} />
                  <InputForm
                    formikProps={props}
                    name="content"
                    title={t("TeacherHomeworksPage.content")}
                    placeholder={t("TeacherHomeworksPage.enter-content")}
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
                    <h2 className="px-2 text-xl font-semibold text-gray-900 dark:text-white">{t("TeacherHomeworksPage.otherInfoTeacherHomeworks")}</h2>
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
                          const value = (e as any)?.value ?? "";

                          props.setFieldValue("stageId", value);
                          props.setFieldValue("classId", "");
                          props.setFieldValue("sectionId", "");

                          setStageId(value);
                          setClassId(undefined);
                          setSectionId(undefined);
                        },
                      }}
                    />

                    {stageId && (
                      <SelectForm
                        formikProps={props}
                        name="classId"
                        title={t("SectionSchedulePage.ClassName")}
                        placeholder={t("SectionSchedulePage.select-ClassName")}
                        options={
                          stages
                            ?.find((s) => s.id === stageId)
                            ?.Class?.map((c) => ({
                              label: t(c.name as any),
                              value: c.id,
                            })) ?? []
                        }
                        props={{
                          isClearable: true,
                          onChange: (e) => {
                            const value = (e as any)?.value ?? "";

                            props.setFieldValue("classId", value);
                            props.setFieldValue("sectionId", "");

                            setClassId(value);
                            setSectionId(undefined);
                          },
                        }}
                      />
                    )}

                    {classId && (
                      <SelectForm
                        formikProps={props}
                        name="sectionId"
                        title={t("SectionSchedulePage.SectionName")}
                        placeholder={t("SectionSchedulePage.select-SectionName")}
                        options={
                          stages
                            ?.find((s) => s.id === stageId)
                            ?.Class?.find((c) => c.id === classId)
                            ?.Section?.map((sec) => ({
                              label: t(sec.name as any),
                              value: sec.id,
                            })) ?? []
                        }
                        props={{
                          isClearable: true,
                          onChange: (e) => {
                            const value = (e as any)?.value ?? "";

                            props.setFieldValue("sectionId", value);
                            setSectionId(value);
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
                              className="group relative rounded-2xl border border-gray-200 bg-white/60 p-4 shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 dark:border-gray-700 dark:bg-gray-900/60 dark:hover:bg-gray-900"
                              tabIndex={0}
                              aria-label="Teacher subject card">
                              {/* Header: Subject */}
                              <div className="flex items-start gap-2">
                                <span className="mt-0.5 rounded-lg p-1.5 bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
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
                                  className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1  text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
                                  title="Section">
                                  <Rows3 className="size-4 opacity-70" aria-hidden />
                                  {item?.Section?.name}
                                </span>

                                <span
                                  className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1  text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
                                  title="Class">
                                  <SquareStack className="size-4 opacity-70" aria-hidden />
                                  {item.StageSubject.Class.name}
                                </span>

                                <span
                                  className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1  text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
                                  title="Stage">
                                  <GraduationCap className="size-4 opacity-70" aria-hidden />
                                  {t(item.StageSubject.Stage.name as any)}
                                </span>
                              </div>

                              {/* Optional: subtle divider & right-caret affordance */}
                              <div className="pointer-events-none absolute inset-y-0 right-2 hidden items-center opacity-0 transition-all duration-200 group-hover:flex group-hover:opacity-40">
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

                    <DateTimeForm formikProps={props} name="dueDate" title={t("TeacherHomeworksPage.dueDate")} placeholder={t("TeacherHomeworksPage.enter-dueDate")} />
                  </div>
                  <div className="space-y-6 mt-6">
                    <button
                      type="button"
                      onClick={addFilterSelection}
                      disabled={!stageId}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors font-medium">
                      {t("Add Selection")}
                    </button>

                    {/* Current Filter Preview */}
                    {currentFilterPreview && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>

                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">{t("Current Selection Preview")}:</h4>

                            <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-3 py-1.5 rounded-lg text-sm">
                              <span>
                                {currentFilterPreview.stageName}
                                {currentFilterPreview.className && ` • ${currentFilterPreview.className}`}
                                {currentFilterPreview.sectionName && ` • ${currentFilterPreview.sectionName}`}
                              </span>
                            </div>

                            {students && (
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                {students.length} {t("students in this selection")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Display selected filters */}
                    {selectedFilters.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("Added Filters")}:</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedFilters.map((filter, index) => (
                            <div
                              key={index}
                              className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-2 rounded-lg text-sm border border-green-200 dark:border-green-700">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>
                                {filter.stageName}
                                {filter.className && ` • ${filter.className}`}
                                {filter.sectionName && ` • ${filter.sectionName}`}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeFilterSelection(index, props)}
                                className="hover:bg-green-200 dark:hover:bg-green-800 rounded p-1 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Filter Selection Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                {/* <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="px-2 text-xl font-semibold text-gray-900 dark:text-white">{t("Select Classes/Sections")}</h2>
                  </div>
                </div> */}
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
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("TeacherHomeworksPage.students")}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {props.values.allStudentsThisASectionsORClasses === "TRUE"
                            ? `${accumulatedStudentIds.size} ${t("TeacherHomeworksPage.studentsSelected")}`
                            : `${props.values.studentIds.length}/${accumulatedStudentIds.size} ${t("TeacherHomeworksPage.studentsSelected")}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <CheckBoxFormWithCustom formikProps={props} name="allStudentsThisASectionsORClasses" title={t("NotificationPage.allStudentsThisASectionsORClasses")} />
                  </div>

                  {props.values.allStudentsThisASectionsORClasses !== "TRUE" && (
                    <div className="space-y-4">
                      {/* Search Input */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t("Search students...")}
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      {/* Students List */}
                      {isFetchingStudents ? (
                        <div className="flex justify-center py-12">
                          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                      ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-12">
                          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                          </svg>
                          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t("No students available")}</p>
                          <p className="text-gray-500">{t("Please select filters above to load students")}</p>
                        </div>
                      ) : (
                        <div>
                          {/* Student count info */}
                          {/* <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                            {t("Showing")} {filteredStudents.length} {t("students")}
                            {accumulatedStudents.length > 0 && (
                              <span className="ml-2 text-green-600 dark:text-green-400">
                                ({accumulatedStudents.length} {t("from saved filters")}
                                {students && students.length > 0 && ` + ${students.length} ${t("from current selection")}`})
                              </span>
                            )}
                          </div> */}

                          <div className="max-h-96 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {filteredStudents.map((student) => (
                                <div
                                  key={student.id}
                                  className={`rounded-lg p-4 transition-colors border ${
                                    accumulatedStudentIds.has(student.id)
                                      ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                                      : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                  }`}>
                                  <CheckBoxForm
                                    formikProps={props}
                                    name={`studentIds.${student.id}`}
                                    title={
                                      (
                                        <div className="flex items-center gap-2">
                                          <span>{student.fullName}</span>
                                          {/* {accumulatedStudentIds.has(student.id) && !students?.some((s) => s.id === student.id) && (
                                            <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">{t("Saved")}</span>
                                          )}
                                          {students?.some((s) => s.id === student.id) && (
                                            <span className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded">{t("Current")}</span>
                                          )} */}
                                        </div>
                                      ) as unknown as string
                                    }
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
                          </div>
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
                    className: "px-8 py-3 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 font-medium",
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
