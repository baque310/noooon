"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getTranslation } from "@/ni18n/i18n";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { ButtonForm } from "@/components/Form/ButtonForm";
import { SelectForm } from "@/components/Form/SelectForm";
import { InputForm } from "@/components/Form/inputForm";
import { LoadingForm } from "@/components/Form/loadingForm";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { useExamsGetDataQuery } from "@/services/admin/Exams";
import { useStudentEnrollmentGetDataQuery } from "@/services/admin/studentEnrollment";
import { useSettingGetDataQuery } from "@/services/Setting";
import { useExamResultsCreateMutation, useExamResultsUpdateMutation, useLazyExamResultsGetDataByIdQuery } from "@/services/admin/ExamResults";
import { BackButton } from "@/components/common/BackButton";

interface StudentRow {
  studentId: string;
  fullName: string;
  score?: number | string;
  notes?: string;
}

interface FormValues {
  examSectionId: string;
  stageId?: string;
  classId?: string;
  sectionId?: string;
  students: StudentRow[];
}

const PageComponent: React.FC = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // settings / school year
  const { currentData: Setting } = useSettingGetDataQuery();
  const schoolYearId = Setting?.CurrentSchoolYear?.id ?? Setting?.currentSchoolYearId ?? undefined;

  // stages (contains Class -> Section)
  const { currentData: stages, isFetching: isFetchingStages } = useStageGetDataQuery();

  // local selection state (so we can drive queries)
  const [selectedStageId, setSelectedStageId] = useState<string | undefined>(undefined);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>(undefined);
  const [selectedExamSectionId, setSelectedExamSectionId] = useState<string | undefined>(undefined);

  // exams filtered by section — only load after a section is selected
  const { currentData: examsData, isFetching: isFetchingExams } = useExamsGetDataQuery(
    { skip: 1, take: 200, ...(schoolYearId ? { schoolYearId } : {}), ...(selectedSectionId ? { sectionId: selectedSectionId } : {}) },
    { skip: !selectedSectionId }
  );

  // students in section
  const { currentData: studentEnrollmentData, isFetching: isFetchingStudents } = useStudentEnrollmentGetDataQuery(
    { skip: 1, take: 500, ...(schoolYearId ? { schoolYearId } : {}), ...(selectedSectionId ? { sectionId: selectedSectionId } : {}) },
    { skip: !selectedSectionId }
  );

  // load single exam result when editing
  const [loadExamResult, { currentData: examResultData, isFetching: isFetchingExamResultById }] = useLazyExamResultsGetDataByIdQuery();
  useEffect(() => {
    if (id) loadExamResult({ id: String(id) });
  }, [id]);

  const [createExamResults, { isLoading: isCreating }] = useExamResultsCreateMutation();
  const [updateExamResult, { isLoading: isUpdating }] = useExamResultsUpdateMutation();

  // Options helpers
  const stageOptions = useMemo(() => (stages || []).map((st: any) => ({ label: t(st.name as any), value: st.id })), [stages, t]);

  const examOptions = useMemo(() => {
    if (!examsData?.data) return [];
    return (examsData.data || []).flatMap((ex: any) => (ex.ExamSection || []).map((es: any) => ({ label: ex.content ?? `Exam ${es.id}`, value: es.id, raw: es })));
  }, [examsData]);

  // compute initial form values. If editing an existing exam result (id) use that; otherwise when students are loaded use enrollment
  const initialValues: FormValues = useMemo(() => {
    if (id && examResultData) {
      return {
        examSectionId: examResultData?.examSectionId ?? "",
        stageId: undefined,
        classId: undefined,
        sectionId: undefined,
        students: [
          {
            studentId: examResultData.studentId,
            fullName: examResultData.Student?.fullName ?? "",
            score: examResultData.score ?? "",
            notes: examResultData.notes ?? "",
          },
        ],
      };
    }

    if (selectedSectionId && studentEnrollmentData?.data) {
      const students = studentEnrollmentData.data.map((s: any) => ({ studentId: s.Student.id, fullName: s.Student.fullName, score: "", notes: "" }));
      return { examSectionId: selectedExamSectionId ?? "", stageId: selectedStageId, classId: selectedClassId, sectionId: selectedSectionId, students };
    }

    return { examSectionId: "", stageId: selectedStageId, classId: selectedClassId, sectionId: selectedSectionId, students: [] };
  }, [id, examResultData, selectedSectionId, studentEnrollmentData, selectedExamSectionId, selectedStageId, selectedClassId]);

  const validationSchema = Yup.object().shape({
    examSectionId: Yup.string().required(t("common.this-field-is-required" as any)),
    students: Yup.array(),
  });

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: any) => {
    try {
      if (id && examResultData) {
        const row = values.students && values.students[0];
        await updateExamResult({ id: examResultData.id, body: { score: Number(row.score ?? 0), notes: row.notes ?? "" } }).unwrap();
        toast.success(t("common.updated-successfully" as any));
        router.back();
        return;
      }

      const payload = {
        ExamResults: (values.students || [])
          .filter((s) => s && s.score !== undefined && s.score !== "" && s.score !== null)
          .map((s: any) => ({ studentId: s.studentId, score: Number(s.score ?? 0), notes: s.notes ?? "", examSectionId: values.examSectionId })),
      };

      await createExamResults(payload).unwrap();
      toast.success(t("common.added-successfully" as any));
      resetForm();
      router.back();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.message ?? error?.message ?? String(error));
      setSubmitting(false);
    }
  };

  // a simple student search state (local)
  const [studentSearch, setStudentSearch] = useState("");

  const displayedStudents = (initialValues.students || []).filter((s) => {
    if (!studentSearch.trim()) return true;
    return String(s.fullName || "")
      .toLowerCase()
      .includes(studentSearch.toLowerCase());
  });

  return (
    <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[60%] mb-20">
      <BackButton title={t("ExamResultsPage.add")} />

      <Formik initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, setFieldValue }) => (
          <Form className="px-4 flex flex-col gap-4">
            {/* Stage / Class / Section selectors */}
            <div className="Card">
              <div className="flex flex-col gap-4">
                <SelectForm
                  formikProps={{ values, setFieldValue } as any}
                  name="stageId"
                  title={t("StageSubjectPage.StageName" as any) || "Stage"}
                  placeholder={t("SectionSchedulePage.select-StageName" as any) || "Select stage"}
                  options={stageOptions}
                  props={{
                    isLoading: isFetchingStages,
                    isClearable: true,
                    onChange: (e: any) => {
                      const v = e?.value ?? undefined;
                      setSelectedStageId(v);
                      setSelectedClassId(undefined);
                      setSelectedSectionId(undefined);
                      setSelectedExamSectionId(undefined);
                      setFieldValue("stageId", v);
                      setFieldValue("classId", undefined);
                      setFieldValue("sectionId", undefined);
                      setFieldValue("examSectionId", "");
                    },
                  }}
                />

                {/* show Class select only after a Stage has been chosen (mirrors teacherLessons approach) */}
                {values?.stageId && (
                  <SelectForm
                    formikProps={{ values, setFieldValue } as any}
                    name="classId"
                    title={t("SectionSchedulePage.ClassName" as any) || "Class"}
                    placeholder={t("SectionSchedulePage.select-ClassName" as any) || "Select class"}
                    options={
                      stages ? stages.find((item: any) => item.id === values?.stageId)?.Class?.map((item: any) => ({ label: t(item.name as any), value: item.id })) || [] : []
                    }
                    props={{
                      isLoading: isFetchingStages,
                      isClearable: true,
                      onChange: (e: any) => {
                        const v = e?.value ?? undefined;
                        setSelectedClassId(v);
                        setSelectedSectionId(undefined);
                        setSelectedExamSectionId(undefined);
                        setFieldValue("classId", v);
                        setFieldValue("sectionId", undefined);
                        setFieldValue("examSectionId", "");
                      },
                    }}
                  />
                )}

                {/* show Section select only after a Class has been chosen */}
                {values?.classId && values?.stageId && (
                  <SelectForm
                    formikProps={{ values, setFieldValue } as any}
                    name="sectionId"
                    title={t("SectionSchedulePage.SectionName" as any) || "Section"}
                    placeholder={t("SectionSchedulePage.select-SectionName" as any) || "Select section"}
                    options={
                      stages
                        ? stages
                            .find((item: any) => item.id === values?.stageId)
                            ?.Class?.find((c: any) => c.id === values?.classId)
                            ?.Section?.map((sec: any) => ({ label: t(sec.name as any), value: sec.id })) || []
                        : []
                    }
                    props={{
                      isLoading: isFetchingStages,
                      isClearable: true,
                      onChange: (e: any) => {
                        const v = e?.value ?? undefined;
                        setSelectedSectionId(v);
                        setSelectedExamSectionId(undefined);
                        setFieldValue("sectionId", v);
                        setFieldValue("examSectionId", "");
                      },
                    }}
                  />
                )}

                {/* show Exam select only after a Section has been chosen */}
                {values?.sectionId && (
                  <SelectForm
                    formikProps={{ values, setFieldValue } as any}
                    name="examSectionId"
                    title={t("ExamResultsPage.select-exam-section" as any) || "Exam"}
                    placeholder={t("ExamResultsPage.select-exam-section" as any) || "Select exam"}
                    options={examOptions}
                    props={{
                      isLoading: isFetchingExams,
                      isClearable: true,
                      onChange: (e: any) => {
                        const v = e?.value ?? "";
                        setSelectedExamSectionId(v || undefined);
                        setFieldValue("examSectionId", v || "");
                      },
                    }}
                  />
                )}
              </div>
            </div>

            {/* If section and exam are selected, show students */}
            {selectedSectionId && selectedExamSectionId ? (
              <>
                <div className="Card flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder={t("ExamResultsPage.search-student" as any) || "Search student"}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="text-base font-semibold">{t("ExamResultsPage.StudentsList" as any) || "Students"}</div>
                  <FieldArray name="students">
                    {() => (
                      <div className="flex flex-col gap-3">
                        {displayedStudents && displayedStudents.length > 0 ? (
                          displayedStudents.map((row: any, idx: number) => (
                            <div key={row.studentId + idx} className="Card p-3 flex flex-col gap-2">
                              <div className="font-semibold">{row.fullName}</div>
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                <div>
                                  <label className="font-normal">{t("ExamResultsPage.score" as any)}</label>
                                  <InputForm
                                    formikProps={{ values, setFieldValue } as any}
                                    name={`students.${idx}.score`}
                                    title={""}
                                    placeholder={String(t("ExamResultsPage.enter-score" as any) || "Enter score")}
                                    props={{ type: "number", min: 0 }}
                                  />
                                </div>
                                <div>
                                  <label className="font-normal">{t("ExamResultsPage.notes" as any)}</label>
                                  <InputForm
                                    formikProps={{ values, setFieldValue } as any}
                                    name={`students.${idx}.notes`}
                                    title={""}
                                    placeholder={String(t("ExamResultsPage.enter-notes" as any) || "Notes")}
                                    props={{ as: "textarea", rows: 3 } as any}
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">{t("ExamResultsPage.no-students-found" as any) || "No students found for selected section"}</div>
                        )}
                      </div>
                    )}
                  </FieldArray>
                </div>
              </>
            ) : (
              <div className="Card p-4 text-center text-gray-500">
                {t("ExamResultsPage.select-section-to-load-students" as any) || "Please select Stage, Class, and Section and an Exam to load students"}
              </div>
            )}

            <div className="flex flex-row-reverse gap-2">
              <ButtonForm title={t(id ? "common.update" : ("common.save" as any))} isLoading={isCreating || isUpdating} props={{ type: "submit", className: "w-full" }} />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PageComponent;
