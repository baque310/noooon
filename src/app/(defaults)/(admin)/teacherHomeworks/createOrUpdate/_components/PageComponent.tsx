"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Formik, Form, FormikHelpers, FormikProps } from "formik";
import * as Yup from "yup";
import { BookOpen, User, Rows3, SquareStack, GraduationCap, X, Users, Save } from "lucide-react";

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

interface PageComponentProps {
  isModal?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

const PageComponent: React.FC<PageComponentProps> = ({ isModal = false, onClose, onSuccess }) => {
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
    // content: Yup.string().required(t("common.this-field-is-required")),
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

      // Handle modal mode
      if (isModal) {
        onSuccess?.();
        onClose?.();
      } else {
        router.back();
      }
    } catch (error: any) {
      console.error("Homework operation failed:", error);
      toast.error(error?.message || JSON.stringify(error));
    }
  };

  return (
    <div className={isModal ? "" : "mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6"}>
      {!isModal && (
        <div className="mb-6">
          <BackButton title={t(id ? "TeacherHomeworksPage.update-info" : "TeacherHomeworksPage.add")} />
        </div>
      )}

      {isFetching || isFetchingSettings ? (
        <div className="space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-4/5"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/5"></div>
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
            <Form className={isModal ? "" : "space-y-6"}>
              {/* Basic Information Card */}
              {isModal ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="p-6 space-y-6">
                    {/* Section 1: Basic Information */}
                    {/* <div>
                      <div className="mb-5 flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                          <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">معلومات الواجب</h2>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="mb-2.5 block text-sm font-bold text-slate-900 dark:text-white">{t("TeacherHomeworksPage.title")}</label>
                          <input
                            name="title"
                            type="text"
                            placeholder={t("TeacherHomeworksPage.enter-title")}
                            value={props.values.title}
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition-all focus:border-violet-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:focus:border-violet-400 dark:focus:bg-slate-800"
                          />
                          {props.errors.title && props.touched.title && <p className="mt-2 text-sm text-red-500">{props.errors.title as string}</p>}
                        </div>

                        <div>
                          <label className="mb-2.5 block text-sm font-bold text-slate-900 dark:text-white">{t("TeacherHomeworksPage.content")}</label>
                          <textarea
                            name="content"
                            placeholder={t("TeacherHomeworksPage.enter-content")}
                            value={props.values.content}
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            rows={3}
                            className="min-h-[100px] w-full resize-vertical rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition-all focus:border-violet-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:focus:border-violet-400 dark:focus:bg-slate-800"
                          />
                        </div>
                      </div>
                    </div> */}
                    <div>
                      <div className="mb-5 flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                          <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">معلومات الواجب</h2>
                      </div>

                      <div className="">
                        <div className="space-y-6">
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
                    </div>
                  </div>

                  {/* Section 2: Classes & Sections */}
                  <div className="p-6 space-y-6">
                    <div className="mb-5 flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                        <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">الصفوف والشعب</h2>
                    </div>

                    <div className="space-y-5">
                      {/* School Year & Stage Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2.5 block text-sm font-bold text-slate-900 dark:text-white">{t("StudentEnrollmentPage.SchoolYear")}</label>
                          <SelectForm
                            formikProps={props}
                            name="schoolYearId"
                            title=""
                            placeholder={t("StudentEnrollmentPage.enter-SchoolYear")}
                            options={schoolYears?.map((item) => ({ label: `${item.from} - ${item.to}`, value: item.id })) ?? []}
                            props={{
                              isLoading: isFetchingSchoolYears,
                              isClearable: true,
                              onChange: (e) => {
                                props.setFieldValue("schoolYearId", (e as any)?.value ?? "");
                                setSchoolYearId((e as any)?.value ?? "");
                              },
                            }}
                          />
                        </div>

                        <div>
                          <label className="mb-2.5 block text-sm font-bold text-slate-900 dark:text-white">{t("StageSubjectPage.StageName")}</label>
                          <SelectForm
                            formikProps={props}
                            name="stageId"
                            title=""
                            placeholder={t("SectionSchedulePage.select-StageName")}
                            options={stages?.map((item) => ({ label: t(item.name as any), value: item.id })) ?? []}
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
                        </div>
                      </div>

                      {/* Class & Section Row */}
                      {stageId && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="mb-2.5 block text-sm font-bold text-slate-900 dark:text-white">{t("SectionSchedulePage.ClassName")}</label>
                            <SelectForm
                              formikProps={props}
                              name="classId"
                              title=""
                              placeholder={t("SectionSchedulePage.select-ClassName")}
                              options={stages?.find((s) => s.id === stageId)?.Class?.map((c) => ({ label: t(c.name as any), value: c.id })) ?? []}
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
                          </div>

                          {classId && (
                            <div>
                              <label className="mb-2.5 block text-sm font-bold text-slate-900 dark:text-white">{t("SectionSchedulePage.SectionName")}</label>
                              <SelectForm
                                formikProps={props}
                                name="sectionId"
                                title=""
                                placeholder={t("SectionSchedulePage.select-SectionName")}
                                options={
                                  stages
                                    ?.find((s) => s.id === stageId)
                                    ?.Class?.find((c) => c.id === classId)
                                    ?.Section?.map((sec) => ({ label: t(sec.name as any), value: sec.id })) ?? []
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
                            </div>
                          )}
                        </div>
                      )}

                      {/* Teacher Subject - Full Width */}
                      <div>
                        <label className="mb-2.5 block text-sm font-bold text-slate-900 dark:text-white">{t("SectionSchedulePage.teacherSubject")}</label>
                        <SelectForm
                          formikProps={props}
                          name="teacherSubjectId"
                          title=""
                          placeholder={t("SectionSchedulePage.select-teacherSubject")}
                          options={
                            teacherSubjects?.map((item) => ({
                              label: (
                                <div className="group relative rounded-2xl border border-gray-200 bg-white/60 p-4 shadow-sm transition-all duration-200 hover:bg-white hover:shadow-md focus-within:ring-2 focus-within:ring-primary dark:border-gray-700 dark:bg-gray-900/60 dark:hover:bg-gray-900">
                                  <div className="flex items-start gap-1">
                                    <span className="mt-0.5 rounded-lg bg-blue-50 p-1.5 text-primary dark:bg-blue-400/10 dark:text-blue-300">
                                      <BookOpen className="size-4" />
                                    </span>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{item.StageSubject.Subject.name}</h3>
                                  </div>
                                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                      <User className="size-4 opacity-80" />
                                      <span className="font-medium">{item.Teacher.fullName}</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700">
                                      <Rows3 className="size-4 opacity-70" /> {item?.Section?.name}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700">
                                      <SquareStack className="size-4 opacity-70" /> {item.StageSubject.Class.name}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700">
                                      <GraduationCap className="size-4 opacity-70" /> {t(item.StageSubject.Stage.name as any)}
                                    </span>
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

                      {/* Due Date */}
                      <div>
                        <label className="mb-2.5 block text-sm font-bold text-slate-900 dark:text-white">{t("TeacherHomeworksPage.dueDate")}</label>
                        <DateTimeForm formikProps={props} name="dueDate" title="" placeholder={t("TeacherHomeworksPage.enter-dueDate")} />
                      </div>

                      {/* Add Selection Button */}
                      <div className="pt-3">
                        <button
                          type="button"
                          onClick={addFilterSelection}
                          disabled={!stageId}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-bold text-white transition-all hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-400">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          {t("Add Selection")}
                        </button>
                      </div>

                      {/* Display selected filters */}
                      {selectedFilters.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("Added Filters")}:</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedFilters.map((filter, index) => (
                              <div
                                key={index}
                                className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-100 px-3 py-2 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
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
                                  className="rounded p-0.5 transition-colors hover:bg-green-200 dark:hover:bg-green-800">
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 3: Students Selection */}
                    <div>
                      <div className="mb-5 flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                            <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                          </div>
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white">تحديد الطلبة</h2>
                        </div>
                        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                          {props.values.allStudentsThisASectionsORClasses === "TRUE"
                            ? `${accumulatedStudentIds.size} ${t("TeacherHomeworksPage.studentsSelected")}`
                            : `${props.values.studentIds.length}/${accumulatedStudentIds.size} ${t("TeacherHomeworksPage.studentsSelected")}`}
                        </span>
                      </div>

                      <div className="space-y-5">
                        {/* Radio Group Design */}
                        <div className="grid grid-cols-2 gap-3">
                          <label
                            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold transition-all ${
                              props.values.allStudentsThisASectionsORClasses === "TRUE"
                                ? "border-violet-600 bg-violet-50 text-violet-600 shadow-sm dark:border-violet-400 dark:bg-violet-900/20 dark:text-violet-300"
                                : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                            }`}>
                            <input
                              type="radio"
                              className="hidden"
                              name="allStudentsThisASectionsORClasses"
                              checked={props.values.allStudentsThisASectionsORClasses === "TRUE"}
                              onChange={() => props.setFieldValue("allStudentsThisASectionsORClasses", "TRUE")}
                            />
                            الكل
                          </label>
                          <label
                            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold transition-all ${
                              props.values.allStudentsThisASectionsORClasses !== "TRUE"
                                ? "border-violet-600 bg-violet-50 text-violet-600 shadow-sm dark:border-violet-400 dark:bg-violet-900/20 dark:text-violet-300"
                                : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                            }`}>
                            <input
                              type="radio"
                              className="hidden"
                              name="allStudentsThisASectionsORClasses"
                              checked={props.values.allStudentsThisASectionsORClasses !== "TRUE"}
                              onChange={() => props.setFieldValue("allStudentsThisASectionsORClasses", "FALSE")}
                            />
                            تحديد
                          </label>
                        </div>

                        {props.values.allStudentsThisASectionsORClasses !== "TRUE" && (
                          <div className="space-y-4">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder={t("Search students...")}
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900"
                              />
                              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>

                            {isFetchingStudents ? (
                              <div className="flex justify-center py-8">
                                <div className="h-8 w-8 animate-spin rounded-full border-3 border-violet-600 border-t-transparent"></div>
                              </div>
                            ) : (
                              <div className="custom-scrollbar max-h-[220px] overflow-y-auto pr-1">
                                <div className="grid grid-cols-2 gap-3">
                                  {filteredStudents.map((student) => (
                                    <label
                                      key={student.id}
                                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                                        props.values.studentIds.includes(student.id)
                                          ? "border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-900/10"
                                          : "border-slate-100 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                                      }`}>
                                      <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                        checked={props.values.studentIds.includes(student.id)}
                                        onChange={(e) => {
                                          const currentIds = [...props.values.studentIds];
                                          if (e.target.checked) {
                                            props.setFieldValue("studentIds", [...currentIds, student.id]);
                                          } else {
                                            props.setFieldValue(
                                              "studentIds",
                                              currentIds.filter((id) => id !== student.id),
                                            );
                                          }
                                        }}
                                      />
                                      <span
                                        className={`truncate text-sm font-semibold ${
                                          props.values.studentIds.includes(student.id) ? "text-violet-700 dark:text-violet-300" : "text-slate-700 dark:text-slate-300"
                                        }`}>
                                        {student.fullName}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-transparent p-6 dark:border-gray-700 dark:from-green-900/20">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900">
                        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("TeacherHomeworksPage.otherInfoTeacherHomeworks")}</h2>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <SelectForm
                          formikProps={props}
                          name="schoolYearId"
                          title={t("StudentEnrollmentPage.SchoolYear")}
                          placeholder={t("StudentEnrollmentPage.enter-SchoolYear")}
                          options={schoolYears?.map((item) => ({ label: `${item.from} - ${item.to}`, value: item.id })) ?? []}
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
                          options={stages?.map((item) => ({ label: t(item.name as any), value: item.id })) ?? []}
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
                            options={stages?.find((s) => s.id === stageId)?.Class?.map((c) => ({ label: t(c.name as any), value: c.id })) ?? []}
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
                                ?.Section?.map((sec) => ({ label: t(sec.name as any), value: sec.id })) ?? []
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
                                <div className="group relative rounded-2xl border border-gray-200 bg-white/60 p-4 shadow-sm transition-all duration-200 hover:bg-white hover:shadow-md focus-within:ring-2 focus-within:ring-primary dark:border-gray-700 dark:bg-gray-900/60 dark:hover:bg-gray-900">
                                  <div className="flex items-start gap-1">
                                    <span className="mt-0.5 rounded-lg bg-blue-50 p-1.5 text-primary dark:bg-blue-400/10 dark:text-blue-300">
                                      <BookOpen className="size-4" />
                                    </span>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{item.StageSubject.Subject.name}</h3>
                                  </div>
                                  <div className="mt-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <User className="size-4 opacity-80" />
                                    <span className="font-medium">{item.Teacher.fullName}</span>
                                  </div>
                                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700">
                                      <Rows3 className="size-4 opacity-70" /> {item?.Section?.name}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700">
                                      <SquareStack className="size-4 opacity-70" /> {item.StageSubject.Class.name}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700">
                                      <GraduationCap className="size-4 opacity-70" /> {t(item.StageSubject.Stage.name as any)}
                                    </span>
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

                      <div className="space-y-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                        <button
                          type="button"
                          onClick={addFilterSelection}
                          disabled={!stageId}
                          className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400">
                          {t("Add Selection")}
                        </button>

                        {currentFilterPreview && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                            <div className="flex items-start gap-3">
                              <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              <div className="min-w-0 flex-1 space-y-2">
                                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">{t("Current Selection Preview")}:</h4>
                                <div className="inline-flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-1.5 dark:bg-amber-900/40">
                                  <span className="text-sm text-amber-800 dark:text-amber-200">
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

                        {selectedFilters.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t("Added Filters")}:</h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedFilters.map((filter, index) => (
                                <div
                                  key={index}
                                  className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-100 px-3 py-2 text-sm text-green-800 dark:border-green-700 dark:bg-green-900 dark:text-green-200">
                                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
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
                                    className="rounded p-1 transition-colors hover:bg-green-200 dark:hover:bg-green-800">
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Students Selection Card - Only for regular page mode */}
              {!isModal && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-transparent p-6 dark:border-gray-700 dark:from-purple-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900">
                          <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("TeacherHomeworksPage.students")}</h2>
                          <p className="mt-1 text-sm text-gray-500">
                            {props.values.allStudentsThisASectionsORClasses === "TRUE"
                              ? `${accumulatedStudentIds.size} ${t("TeacherHomeworksPage.studentsSelected")}`
                              : `${props.values.studentIds.length}/${accumulatedStudentIds.size} ${t("TeacherHomeworksPage.studentsSelected")}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
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
                              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>

                          {/* Students List */}
                          {isFetchingStudents ? (
                            <div className="flex justify-center py-12">
                              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            </div>
                          ) : filteredStudents.length === 0 ? (
                            <div className="py-12 text-center">
                              <svg className="mx-auto mb-4 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                />
                              </svg>
                              <p className="mb-2 text-lg font-medium text-gray-900 dark:text-white">{t("No students available")}</p>
                              <p className="text-gray-500">{t("Please select filters above to load students")}</p>
                            </div>
                          ) : (
                            <div className="max-h-96 overflow-y-auto">
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {filteredStudents.map((student) => (
                                  <div
                                    key={student.id}
                                    className={`rounded-lg border p-4 transition-colors ${
                                      accumulatedStudentIds.has(student.id)
                                        ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                                        : "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                                    }`}>
                                    <CheckBoxForm
                                      formikProps={props}
                                      name={`studentIds.${student.id}`}
                                      title={
                                        (
                                          <div className="flex items-center gap-2">
                                            <span>{student.fullName}</span>
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
                                              currentIds.filter((id: string) => id !== student.id),
                                            );
                                          }
                                        },
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments Card */}
              {!id && <Attachments {...props} isModal={isModal} />}

              {/* Submit Actions */}
              {isModal ? (
                <div className="flex gap-3 border-t border-slate-200 bg-white px-6 py-5 dark:border-slate-700 dark:bg-slate-800">
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white shadow-lg shadow-violet-600/30 transition-all hover:-translate-y-0.5 hover:bg-violet-700 disabled:bg-slate-400">
                    {/* {(isCreating || isUpdating) && (
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )} */}
                    {/* <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <Save />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg> */}
                    {/* <Save /> */}
                    {id ? t("common.update") : "نشر الواجب الآن"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-transparent px-6 py-3 font-bold text-slate-600 transition-all hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                    {t("common.cancel") || "إلغاء"}
                  </button>
                </div>
              ) : (
                <div className="flex justify-end border-t border-gray-200 pt-6 dark:border-gray-700">
                  <ButtonForm
                    props={{
                      type: "submit",
                      className: "rounded-xl px-8 py-3 font-semibold text-white transition-colors disabled:opacity-50",
                    }}
                    title={
                      <div className="flex items-center gap-2">
                        {(isCreating || isUpdating) && (
                          <svg className="-ml-1 mr-2 h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        <span>{t(id ? "common.update" : "common.save")}</span>
                      </div>
                    }
                    isLoading={false}
                  />
                </div>
              )}
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default PageComponent;
