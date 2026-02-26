"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getTranslation } from "@/ni18n/i18n";
import { useStudentGetDataHasNoEnrollmentQuery } from "@/services/admin/student";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { useSettingGetDataQuery } from "@/services/Setting";
import { useStudentEnrollmentCreateMutation } from "@/services/admin/studentEnrollment";
import { BASE_URL } from "@/services/api";
import { GraduationCap, Layers, LayoutGrid, UserCheck, Search, ListChecks } from "lucide-react";

const EnrollmentRegistrationView = () => {
  const { t } = getTranslation();

  // ─── State ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [stageId, setStageId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  const [schoolYearId, setSchoolYearId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Queries ──────────────────────────────────────────────────────────────
  const { currentData: Setting } = useSettingGetDataQuery();
  const { currentData: StageData, isFetching: isFetchingStage } = useStageGetDataQuery();

  const { currentData: studentData, isFetching: isFetchingStudents } = useStudentGetDataHasNoEnrollmentQuery({
    search: debouncedSearch,
    skip: 1,
    take: 200,
    schoolYearId: schoolYearId || undefined,
  });

  const [StudentEnrollmentCreate] = useStudentEnrollmentCreateMutation();

  // ─── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (Setting?.currentSchoolYearId) {
      setSchoolYearId(Setting.currentSchoolYearId);
    }
  }, [Setting]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ─── Computed ─────────────────────────────────────────────────────────────
  const availableClasses = useMemo(() => {
    if (!stageId || !StageData) return [];
    return StageData.find((s) => s.id === stageId)?.Class ?? [];
  }, [stageId, StageData]);

  const availableSections = useMemo(() => {
    if (!classId || !availableClasses.length) return [];
    return availableClasses.find((c) => c.id === classId)?.Section ?? [];
  }, [classId, availableClasses]);

  const students = studentData?.data ?? [];

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const toggleStudent = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectStage = (value: any) => {
    setStageId(value || "");
    setClassId("");
    setSectionId("");
  };

  const handleSelectClass = (value: any) => {
    setClassId(value || "");
    setSectionId("");
  };

  const handleSelectSection = (value: any) => {
    setSectionId(value || "");
  };

  const handleConfirm = async () => {
    if (!stageId || !classId || !sectionId) {
      toast.error(t("common.this-field-is-required"), { autoClose: 5000 });
      return;
    }
    if (selectedIds.length === 0) {
      toast.error(t("common.this-field-is-required"), { autoClose: 5000 });
      return;
    }
    setIsSubmitting(true);
    try {
      await StudentEnrollmentCreate({
        students: selectedIds.map((id) => ({ studentId: id })),
        stageId,
        classId,
        sectionId,
        schoolYearId,
      }).unwrap();
      toast.success(t("common.added-successfully"), { autoClose: 5000 });
      setSelectedIds([]);
    } catch (error: any) {
      console.error("Enrollment failed:", error);
      if (error?.message?.includes("already exists")) {
        toast.error(t("StudentEnrollmentPage.schoolYear-already-exists"), { autoClose: 8000 });
      } else {
        toast.error(JSON.stringify(error), { autoClose: 8000 });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-4 flex flex-col gap-4">
      {/* ── Page Title ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">المركز الذكي لتوزيع الطلاب</h2>
          <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 mt-1">قم باختيار الصف المستهدف ثم انقل الطلاب إليه بضغطة واحدة.</p>
        </div>
      </div>

      {/* ── Main Card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col gap-6">
        {/* Assignment Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-dashed border-gray-200 dark:border-gray-700">
          {/* Stage */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-extrabold text-gray-700 dark:text-gray-300">
              <Layers className="w-3.5 h-3.5 text-primary" />
              {t("StudentEnrollmentPage.enter-StageName")}
            </label>
            <select
              value={stageId}
              onChange={(e) => handleSelectStage(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
            >
              <option value="">{t("StudentEnrollmentPage.enter-StageName")}</option>
              {StageData?.map((stage: any) => (
                <option key={stage.id} value={stage.id}>
                  {t(stage.name)}
                </option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-extrabold text-gray-700 dark:text-gray-300">
              <LayoutGrid className="w-3.5 h-3.5 text-primary" />
              {t("StudentEnrollmentPage.enter-ClassName")}
            </label>
            <select
              value={classId}
              onChange={(e) => handleSelectClass(e.target.value)}
              disabled={!stageId}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{t("StudentEnrollmentPage.enter-ClassName")}</option>
              {availableClasses.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {t(cls.name)}
                </option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-extrabold text-gray-700 dark:text-gray-300">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
              {t("StudentEnrollmentPage.enter-SectionName")}
            </label>
            <select
              value={sectionId}
              onChange={(e) => handleSelectSection(e.target.value)}
              disabled={!classId}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{t("StudentEnrollmentPage.enter-SectionName")}</option>
              {availableSections.map((sec: any) => (
                <option key={sec.id} value={sec.id}>
                  {t(sec.name)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Assignment Panel (Student List) ── */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Panel Header with Search */}
          <div className="flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 font-extrabold text-primary text-sm">
              <ListChecks className="w-4 h-4" />
              اختر الطلاب المتاحين للتسكين
            </div>
            {/* Mini Search */}
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث عن اسم..."
                className="form-input ps-8 pe-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 w-44 focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          {/* Student Mini Cards */}
          <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
            {isFetchingStudents ? (
              <div className="flex justify-center items-center py-16">
                <div className="loader !bg-primary !w-8 !h-8" />
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400 dark:text-gray-500">
                <UserCheck className="w-10 h-10 opacity-30" />
                <p className="font-bold text-sm">{debouncedSearch ? t("common.no-data") : "جميع الطلاب موزعين حالياً"}</p>
              </div>
            ) : (
              <div className="p-3 flex flex-col gap-2">
                {students.map((student: any) => {
                  const isSelected = selectedIds.includes(student.id);
                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStudent(student.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-150 ${isSelected
                          ? "border-primary/40 bg-primary/5 dark:bg-primary/10"
                          : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-gray-700/40"
                        }`}>
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? "bg-primary border-primary" : "border-gray-300 dark:border-gray-600"
                          }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Small Avatar */}
                      <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        {student.photo ? (
                          <img
                            src={`${BASE_URL}uploads/${student.photo}`}
                            alt={student.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-extrabold text-xs">
                            {student.fullName?.charAt(0) || "?"}
                          </div>
                        )}
                      </div>

                      {/* Name + Code */}
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-gray-800 dark:text-gray-200 text-sm truncate">{student.fullName}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 font-bold mt-0.5">{student.User?.username || "—"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Floating Action Bar ── */}
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-6 py-4 border border-gray-100 dark:border-gray-700 mt-2">
          <div className="font-extrabold text-gray-500 dark:text-gray-400 text-sm">
            تم تحديد <span className="text-primary text-base">{selectedIds.length}</span> طلاب
          </div>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || selectedIds.length === 0 || !stageId || !classId || !sectionId}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-extrabold px-8 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-sm">
            {isSubmitting ? <div className="loader !bg-white !w-4 !h-4" /> : <UserCheck className="w-4 h-4" />}
            تثبيت الطلبة المحددين
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentRegistrationView;
