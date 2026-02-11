"use client";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { useClassGetDataQuery } from "@/services/admin/class";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { useSectionGetDataQuery } from "@/services/admin/section";
import { useSubjectGetDataQuery } from "@/services/admin/Subject";
import { useStudentEnrollmentGetDataQuery } from "@/services/admin/studentEnrollment";
import { useBehaviorTypeGetDataQuery } from "@/services/admin/BehaviorType";
import { useBehaviorSectionGetDataQuery } from "@/services/admin/BehaviorSection";
import { useBehaviorsCreateMutation, useBehaviorsUpdateMutation, useBehaviorsGetDataQuery } from "@/services/admin/Behaviors";
import { IBehaviors, IBehaviorReport } from "@/services/admin/Behaviors";
import { useTeacherSubjectGetDataQuery } from "@/services/admin/TeacherSubject";
import SelectFilter from "@/components/Filter/SelectFilter";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import { useSettingGetDataQuery } from "@/services/Setting";
import { SelectWithSearch } from "@/components/Filter/SelectSearch";
import { DatePicker } from "@/components/Filter/DatePicker";
import { getTranslation } from "@/ni18n/i18n";
import { Layers, GraduationCap, Users, BookOpen, Star, RefreshCcw, User, UsersRound, CloudUpload } from "lucide-react";
import { BASE_URL } from "@/services/api";

export default function AdminView() {
  const router = useRouter();
  const { t } = getTranslation();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State for filters
  const [stageId, setStageId] = useState<string | undefined>();
  const [classId, setClassId] = useState<string | undefined>();
  const [sectionId, setSectionId] = useState<string | undefined>();
  const [subjectId, setSubjectId] = useState<string | undefined>();
  const [behaviorTypeId, setBehaviorTypeId] = useState<string | undefined>();
  const [behaviorSectionId, setBehaviorSectionId] = useState<string | undefined>();
  const [schoolYearId, setSchoolYearId] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>("");

  // To store selected ratings: studentId -> behaviorSectionId
  const [ratings, setRatings] = useState<Record<string, string>>({});
  // studentId -> reportId (to track existing records for update)
  const [existingReportIdentifiers, setExistingReportIdentifiers] = useState<Record<string, string>>({});
  const [showStudents, setShowStudents] = useState(false);

  // Params object similar to homework page
  const [param, setParam] = useState<{
    stageId?: string;
    classId?: string;
    sectionId?: string;
    subjectId?: string;
    behaviorTypeId?: string;
    behaviorSectionId?: string;
    schoolYearId?: string;
    date?: string;
  }>({});

  // Queries
  const { currentData: Setting, isFetching: isFetchingSetting } = useSettingGetDataQuery();
  const { currentData: StageData } = useStageGetDataQuery();
  const { data: sections } = useSectionGetDataQuery({});
  // Pass filters to Subject Query
  const { data: subjects } = useSubjectGetDataQuery({
    stageId: param.stageId,
    classId: param.classId,
    sectionId: param.sectionId,
  } as any);
  const { data: behaviorTypes } = useBehaviorTypeGetDataQuery({});
  const { data: behaviorSections } = useBehaviorSectionGetDataQuery({});
  const { currentData: SchoolYearData } = useSchoolYearGetDataQuery();

  // Fetch TeacherSubject based on selected filters to get teacherSubjectId
  const { data: teacherSubjects } = useTeacherSubjectGetDataQuery(
    {
      stageId: param.stageId,
      classId: param.classId,
      sectionId: param.sectionId,
      schoolYearId: param.schoolYearId,
    } as any,
    { skip: !param.stageId || !param.classId || !param.sectionId || !param.schoolYearId },
  );

  // Get the selected teacher's information
  const selectedTeacher = teacherSubjects?.find((ts) => ts.StageSubject.subjectId === param.subjectId);

  // Fetch existing behavior records for today/selected date to pre-fill
  const { data: existingBehaviors, isFetching: isFetchingExisting } = useBehaviorsGetDataQuery(
    {
      teacherSubjectId: selectedTeacher?.id,
      // We need to filter by date too if we just want today's records
      // Assuming behaviorRecords endpoint supports date filtering or we filter client-side
      take: 1000,
    },
    { skip: !showStudents || !selectedTeacher?.id },
  );

  // School Year Default
  useEffect(() => {
    if (SchoolYearData && Setting) {
      setParam((prev) => ({
        ...prev,
        schoolYearId: Setting?.currentSchoolYearId,
      }));
      setSchoolYearId(Setting?.currentSchoolYearId);
    }
  }, [SchoolYearData, Setting]);

  // Restore scroll position
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedScrollPosition = sessionStorage.getItem("adminBehavior_scrollPosition");
      if (savedScrollPosition && scrollContainerRef.current) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScrollPosition, 10));
        }, 100);
        sessionStorage.removeItem("adminBehavior_scrollPosition");
      }
    }
  }, []);

  // Fetch students based on params
  const { data: students, isFetching: isFetchingStudents } = useStudentEnrollmentGetDataQuery(
    {
      skip: 1,
      take: 1000,
      stageId: param.stageId,
      classId: param.classId,
      sectionId: param.sectionId,
      ...(param?.date && { date: param.date }),
    } as any,
    { skip: !param.stageId || !param.classId || !param.sectionId },
  );

  // Pre-fill ratings from existing evaluations
  useEffect(() => {
    if (existingBehaviors?.data && param.behaviorSectionId && showStudents) {
      const newRatings: Record<string, string> = {};
      const newReportIdentifiers: Record<string, string> = {};

      existingBehaviors.data.forEach((report: IBehaviorReport) => {
        // Filter by date if selected
        const reportDate = report.fromDate ? new Date(report.fromDate).toISOString().split("T")[0] : null;
        const selectedDateOnly = param.date ? new Date(param.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

        if (param.date && reportDate !== selectedDateOnly) return;

        // Find if this report has an item for the current selected behaviorSectionId
        const matchingItem = report.evaluationItems?.find((item) => item.behaviorSectionId === param.behaviorSectionId);
        if (matchingItem) {
          newRatings[report.studentEnrollmentId] = matchingItem.behaviorTypeId;
        }
        // Always track the reportId for this student/date to know we should UPDATE instead of CREATE
        newReportIdentifiers[report.studentEnrollmentId] = report.id;
      });

      setRatings(newRatings);
      setExistingReportIdentifiers(newReportIdentifiers);
    } else if (!showStudents) {
      setRatings({});
      setExistingReportIdentifiers({});
    }
  }, [existingBehaviors, param.behaviorSectionId, showStudents]);

  const [createBehaviors, { isLoading: isCreating }] = useBehaviorsCreateMutation();
  const [updateBehavior, { isLoading: isUpdating }] = useBehaviorsUpdateMutation();

  const isSaving = isCreating || isUpdating;

  // URL state management helper function
  const pushWithCurrentParams = (path = "/behaviors", extra: Record<string, any> = {}) => {
    const allParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      allParams.set(key, value);
    });

    Object.entries(extra).forEach(([k, v]) => {
      if (v === undefined || v === null) {
        allParams.delete(k);
      } else {
        allParams.set(k, String(v));
      }
    });

    const query = allParams.toString();
    const newUrl = `${path}${query ? `?${query}` : ""}`;

    if (typeof window !== "undefined" && window.history && window.history.replaceState) {
      window.history.replaceState(null, "", newUrl);
    } else {
      router.push(newUrl);
    }
  };

  const handleSelectStage = (value: any) => {
    const stageId = value || undefined;
    setStageId(stageId);
    setClassId(undefined);
    setSectionId(undefined);
    setParam((prev) => ({
      ...prev,
      stageId,
      classId: undefined,
      sectionId: undefined,
    }));
    setShowStudents(false);
    pushWithCurrentParams("/behaviors", {
      stageId,
      classId: undefined,
      sectionId: undefined,
    });
  };

  const handleLoadStudents = () => {
    if (!param.stageId || !param.classId || !param.sectionId || !param.subjectId || !param.behaviorSectionId) {
      toast.warn("يرجى اختيار جميع الحقول المطلوبة بما في ذلك معيار التقييم");
      return;
    }
    setShowStudents(true);
  };

  const handleRatingChange = (studentId: string, typeId: string): void => {
    setRatings((prev) => ({ ...prev, [studentId]: typeId }));
  };

  const handleSave = async () => {
    if (Object.keys(ratings).length === 0) {
      toast.warn("لم يتم تقييم أي طالب");
      return;
    }

    // Find the matching teacherSubject based on selected subject
    const matchingTeacherSubject = teacherSubjects?.find((ts) => ts.StageSubject.subjectId === param.subjectId);

    if (!matchingTeacherSubject) {
      toast.error("لم يتم العثور على معلم مرتبط بالمادة المحددة");
      return;
    }

    try {
      const createPayloadStudents: IBehaviors[] = [];
      const updates: Array<{ id: string; body: any }> = [];

      Object.entries(ratings).forEach(([studentId, typeId]) => {
        const existingReportId = existingReportIdentifiers[studentId];

        // If we have an existing report, we should merge the new item with existing items
        // to avoid wiping out evaluations for other sections (criteria).
        const existingReport = existingBehaviors?.data?.find((r) => r.id === existingReportId);

        const newItem = {
          behaviorSectionId: param.behaviorSectionId!,
          behaviorTypeId: typeId,
        };

        if (existingReportId && existingReport) {
          // Merge items: keep existing items for other sections, replace/add for current section
          const otherItems =
            existingReport.evaluationItems
              ?.filter((item) => item.behaviorSectionId !== param.behaviorSectionId)
              .map((item) => ({
                behaviorSectionId: item.behaviorSectionId,
                behaviorTypeId: item.behaviorTypeId,
              })) || [];

          const mergedItems = [...otherItems, newItem];

          // Prepare update payload according to new UpdateBehaviorsPayload type
          updates.push({
            id: existingReportId,
            body: {
              notes: existingReport.notes || "",
              fromDate: param.date || new Date().toISOString(),
              toDate: param.date || new Date().toISOString(),
              items: mergedItems,
            },
          });
        } else {
          // Prepare create payload
          createPayloadStudents.push({
            studentEnrollmentId: studentId,
            items: [newItem],
          } as any);
        }
      });

      const promises = [];

      if (createPayloadStudents.length > 0) {
        promises.push(
          createBehaviors({
            teacherSubjectId: matchingTeacherSubject.id,
            fromDate: param.date || new Date().toISOString(),
            toDate: param.date || new Date().toISOString(),
            students: createPayloadStudents,
          }).unwrap(),
        );
      }

      if (updates.length > 0) {
        updates.forEach((update) => {
          promises.push(updateBehavior(update).unwrap());
        });
      }

      await Promise.all(promises);

      toast.success("تم تشغيل التقييمات وحفظها بنجاح");
      // Don't reset everything so user can see what was saved,
      // but maybe refresh the data?
      // setShowStudents(false);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء الحفظ. تأكد من البيانات.");
    }
  };

  const handleSelectClass = (value: any) => {
    const classId = value || undefined;
    setClassId(classId);
    setSectionId(undefined);
    setParam((prev) => ({
      ...prev,
      classId,
      sectionId: undefined,
    }));
    setShowStudents(false);
    pushWithCurrentParams("/behaviors", {
      classId,
      sectionId: undefined,
    });
  };

  const handleSelectSection = (value: any) => {
    const sectionId = value || undefined;
    setSectionId(sectionId);
    setParam((prev) => ({ ...prev, sectionId }));
    setShowStudents(false);
    pushWithCurrentParams("/behaviors", { sectionId });
  };

  const handleSelectSubject = (value: any) => {
    const subjectId = value || undefined;
    setSubjectId(subjectId);
    setParam((prev) => ({ ...prev, subjectId }));
    setShowStudents(false);
    pushWithCurrentParams("/behaviors", { subjectId });
  };

  const handleSelectBehaviorType = (value: any) => {
    const behaviorTypeId = value || undefined;
    setBehaviorTypeId(behaviorTypeId);
    setParam((prev) => ({ ...prev, behaviorTypeId }));
    setShowStudents(false);
    pushWithCurrentParams("/behaviors", { behaviorTypeId });
  };

  const handleSelectBehaviorSection = (value: any) => {
    const behaviorSectionId = value || undefined;
    setBehaviorSectionId(behaviorSectionId);
    setParam((prev) => ({ ...prev, behaviorSectionId }));
    setShowStudents(false);
    pushWithCurrentParams("/behaviors", { behaviorSectionId });
  };

  const handleReset = () => {
    setStageId(undefined);
    setClassId(undefined);
    setSectionId(undefined);
    setSubjectId(undefined);
    setBehaviorTypeId(undefined);
    setSelectedDate("");
    setParam((prev) => ({
      ...prev,
      stageId: undefined,
      classId: undefined,
      sectionId: undefined,
      subjectId: undefined,
      behaviorTypeId: undefined,
      date: undefined,
    }));
    setRatings({});
    setShowStudents(false);
    pushWithCurrentParams("/behaviors", {
      stageId: undefined,
      classId: undefined,
      sectionId: undefined,
      subjectId: undefined,
      behaviorTypeId: undefined,
      date: undefined,
    });
  };

  return (
    <div ref={scrollContainerRef} className="p-6 space-y-6">
      {/* Header Section */}
      {/* <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">تسجيل السلوك اليومي</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">إدارة ومتابعة سلوك الطلاب اليومي</p>
        </div>

        <div className="flex gap-3">
          <SelectWithSearch
            placeholder="السنة الدراسية"
            isLoading={!SchoolYearData || isFetchingSetting}
            props={{
              onChange: handleSelectSchoolYear,
              value: param.schoolYearId,
            }}
            options={SchoolYearData?.map((item) => ({
              value: item.id,
              label: `${item.from}-${item.to}`,
            }))}
          />

          <DatePicker value={selectedDate} onChange={handleSelectDate} placeholder="اختر التاريخ" className="min-w-[180px]" />
        </div>
      </div> */}

      {/* Filters Section */}
      <div className="bg-white dark:bg-[#0e1726] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#f1f5f9] dark:border-[#1b2e4b] mb-6">
        <div className="flex justify-between items-end gap-5 flex-wrap">
          <div className="flex gap-5 flex-wrap flex-1">
            <SelectFilter
              value={param?.stageId}
              placement="bottom-end"
              title="المرحلة الدراسية"
              handleChange={handleSelectStage}
              icon={<Layers className="w-3.5 h-3.5" />}
              options={
                StageData?.map((item) => {
                  return {
                    value: item.id,
                    label: t(item.name as any),
                  };
                }) ?? []
              }
            />

            <SelectFilter
              value={param?.classId}
              title="الصف الدراسي"
              placement="bottom-end"
              handleChange={handleSelectClass}
              disabled={!param?.stageId}
              icon={<GraduationCap className="w-3.5 h-3.5" />}
              options={
                StageData?.find((it) => it.id === param?.stageId)?.Class?.map((item) => {
                  return {
                    value: item.id,
                    label: item.name,
                  };
                }) ?? []
              }
            />

            <SelectFilter
              value={param?.sectionId}
              title="الشعبـة"
              placement="bottom-end"
              handleChange={handleSelectSection}
              disabled={!param?.classId}
              icon={<Users className="w-3.5 h-3.5" />}
              options={
                StageData?.find((it) => it.id === param?.stageId)
                  ?.Class?.find((it) => it.id === param?.classId)
                  ?.Section?.map((item) => {
                    return {
                      value: item.id,
                      label: item.name,
                    };
                  }) ?? []
              }
            />

            <SelectFilter
              value={param?.subjectId}
              title="المادة"
              handleChange={handleSelectSubject}
              icon={<BookOpen className="w-3.5 h-3.5" />}
              options={
                // Filter subjects to only show those with teacher assignments
                teacherSubjects
                  ?.map((ts) => ({
                    value: ts.StageSubject.Subject.id,
                    label: ts.StageSubject.Subject.name,
                  }))
                  // Remove duplicates if a subject is taught by multiple teachers
                  .filter((subject, index, self) => index === self.findIndex((s) => s.value === subject.value)) ?? []
              }
            />

            <SelectFilter
              value={param?.behaviorSectionId}
              title="معيار التقييم"
              handleChange={handleSelectBehaviorSection}
              icon={<Star className="w-3.5 h-3.5" />}
              options={
                behaviorSections?.data?.map((item) => {
                  return {
                    value: item.id,
                    label: item.name,
                  };
                }) ?? []
              }
            />
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={handleReset}
              className="flex items-center justify-center w-10 h-10 bg-[#f8fafc] dark:bg-[#1b2e4b] text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#253b5c] transition-colors border border-gray-200 dark:border-[#1b2e4b]"
              title="إعادة تعيين">
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Teacher Info Display - Added below filters */}
        {selectedTeacher && param.subjectId && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#1b2e4b]">
            <div className="flex items-center gap-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-3">
              <div className="flex items-center justify-center w-10 h-10 bg-violet-500 rounded-lg shadow-sm">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">المعلم المسؤول</p>
                <p className="text-sm font-bold text-violet-600 dark:text-violet-400">{selectedTeacher.Teacher?.fullName || "غير محدد"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Load Students Button */}
      <div className="mb-6">
        <button
          onClick={handleLoadStudents}
          className="w-full flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-1 hover:shadow-violet-500/30">
          <UsersRound className="w-4 h-4" />
          عرض الطلاب
        </button>
      </div>

      {/* Students Table */}
      {showStudents && (
        <div className="animate-fadeIn">
          {isFetchingStudents ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#0e1726] rounded-xl shadow-sm border border-gray-100 dark:border-[#1b2e4b]">
              <div className="loader !bg-primary mb-4"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">جاري تحميل الطلاب والبيانات السابقة...</p>
            </div>
          ) : isFetchingExisting ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#0e1726] rounded-xl shadow-sm border border-gray-100 dark:border-[#1b2e4b]">
              <div className="loader !bg-primary mb-4"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">جاري مزامنة البيانات السابقة...</p>
            </div>
          ) : students?.data && students.data.length > 0 ? (
            <>
              <div className="bg-white dark:bg-[#0e1726] rounded-xl shadow-sm border border-gray-100 dark:border-[#1b2e4b] overflow-hidden">
                <table className="w-full border-collapse text-right">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#1b2e4b] text-sm font-extrabold text-violet-600 dark:text-violet-400">
                      <th className="p-4 text-center">صورة</th>
                      <th className="p-4">اسم الطالب</th>
                      <th className="p-4 text-center">تقييم السلوك ({behaviorSections?.data?.find((b: any) => b.id === param.behaviorSectionId)?.name})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.data.map((studentEntry: any) => {
                      const student = studentEntry.Student;
                      return (
                        <tr
                          key={studentEntry.id}
                          className="border-b border-slate-50 dark:border-gray-800/50 hover:bg-slate-50/50 dark:hover:bg-[#1b2e4b]/30 transition-all duration-200">
                          <td className="p-4 text-center">
                            <div className="mx-auto h-10 w-10 overflow-hidden rounded-full border-2 border-white dark:border-gray-700 bg-slate-100 dark:bg-gray-800 shadow-sm">
                              <img
                                src={student.photo ? `${BASE_URL}uploads/${student.photo}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.User.username}`}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="p-4 font-bold text-slate-700 dark:text-gray-200">{student.fullName}</td>
                          <td className="p-4">
                            <div className="flex justify-center gap-3">
                              {behaviorTypes?.data?.map((type: any) => (
                                <label
                                  key={type.id}
                                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-200 hover:bg-slate-50 dark:hover:bg-[#1b2e4b]/50 ${
                                    ratings[studentEntry.id] === type.id
                                      ? "border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500/20"
                                      : "border-transparent text-slate-500 dark:text-gray-400"
                                  }`}>
                                  <input
                                    type="radio"
                                    name={`student_${studentEntry.id}`}
                                    value={type.id}
                                    checked={ratings[studentEntry.id] === type.id}
                                    onChange={() => handleRatingChange(studentEntry.id, type.id)}
                                    className="accent-violet-600"
                                  />
                                  {type.name}
                                </label>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end rounded-2xl bg-slate-50 dark:bg-[#1b2e4b] p-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-1 hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                  <CloudUpload className="w-4 h-4" />
                  {isSaving ? "جاري الحفظ..." : "حفظ جميع التقييمات"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#0e1726] rounded-xl shadow-sm border border-gray-100 dark:border-[#1b2e4b]">
              <div className="w-20 h-20 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">لا يوجد طلاب</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">تأكد من اختيار الصف والشعبة الصحيحة</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
