"use client";
import React, { useState } from "react";
import { useTeacherGetDataQuery } from "@/services/admin/teacher";
import { Presentation, Users, CheckCircle, Clock, MoreHorizontal } from "lucide-react";
import { useTeacherSubjectGetDataQuery } from "@/services/admin/TeacherSubject";
import Model from "@/components/Model";
import { useStudentEnrollmentGetDataQuery } from "@/services/admin/studentEnrollment";
import { useBehaviorsGetDataQuery } from "@/services/admin/Behaviors";
import { useBehaviorSectionGetDataQuery } from "@/services/admin/BehaviorSection";
import { useBehaviorTypeGetDataQuery } from "@/services/admin/BehaviorType";
import { IBehaviorReport, IBehaviorEvaluationItem } from "@/services/admin/Behaviors";
import { getTranslation } from "@/ni18n/i18n";
import { useSettingGetDataQuery } from "@/services/Setting";
import { BASE_URL } from "@/services/api";

const SectionStatusIndicator = ({ ts, behaviorSections, onStatusUpdate }: { ts: any; behaviorSections: any; onStatusUpdate?: (status: string) => void }) => {
  const { data: students, isLoading: isLoadingStudents } = useStudentEnrollmentGetDataQuery(
    {
      stageId: ts.StageSubject?.stageId,
      classId: ts.StageSubject?.classId,
      sectionId: ts.Section?.id,
      take: 1000,
    } as any,
    { skip: !ts },
  );

  const { data: behaviorRecords, isLoading: isLoadingRecords } = useBehaviorsGetDataQuery(
    {
      teacherSubjectId: ts.id,
      take: 1000,
    },
    { skip: !ts },
  );

  const isLoading = isLoadingStudents || isLoadingRecords;

  const calculateStatus = () => {
    if (isLoading) return "LOADING";
    if (!students?.data || !behaviorRecords?.data || !behaviorSections?.data) return "ERROR";
    if (students.data.length === 0) return "EMPTY";

    const requiredSectionIds = behaviorSections.data.map((s: any) => s.id);
    const allReady = students.data.every((enrollment: any) => {
      const studentRecords = behaviorRecords.data.filter((r: any) => r.studentEnrollmentId === enrollment.id);
      if (studentRecords.length === 0) return false;

      const coveredSectionIds = new Set();
      studentRecords.forEach((record: any) => {
        record.evaluationItems?.forEach((item: any) => {
          coveredSectionIds.add(item.behaviorSectionId);
        });
      });

      return requiredSectionIds.every((id: string) => coveredSectionIds.has(id));
    });

    return allReady ? "READY" : "INCOMPLETE";
  };

  const status = calculateStatus();

  React.useEffect(() => {
    if (onStatusUpdate) onStatusUpdate(status);
  }, [status, onStatusUpdate]);

  if (status === "LOADING") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-1.5 text-xs font-extrabold text-slate-400">
        <Clock size={14} className="animate-spin" /> جاري التحقق...
      </span>
    );
  }

  if (status === "EMPTY") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-extrabold text-slate-500">
        <Users size={14} /> لا يوجد طلاب
      </span>
    );
  }

  return status === "READY" ? (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-extrabold text-emerald-600">
      <CheckCircle size={14} /> مكتمل
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-extrabold text-amber-600">
      <Clock size={14} /> قيد المراجعة
    </span>
  );
};

export default function ReportsView() {
  const { t } = getTranslation();
  const { data: teachers, isLoading } = useTeacherGetDataQuery({});
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [selectedTeacherName, setSelectedTeacherName] = useState<string | null>(null);
  const [selectedTS, setSelectedTS] = useState<any>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  // Fetch current setting to get schoolYearId
  const { data: setting } = useSettingGetDataQuery();

  // Data queries for the modal
  const { data: behaviorSections } = useBehaviorSectionGetDataQuery({});
  const { data: behaviorTypes } = useBehaviorTypeGetDataQuery({});

  const { data: studentEnrollments, isLoading: isLoadingStudents } = useStudentEnrollmentGetDataQuery(
    {
      stageId: selectedTS?.StageSubject?.stageId,
      classId: selectedTS?.StageSubject?.classId,
      sectionId: selectedTS?.Section?.id,
      take: 1000,
    } as any,
    { skip: !isStudentModalOpen || !selectedTS },
  );

  const {
    data: teacherSubjects,
    isLoading: isLoadingClasses,
    error: teacherSubjectsError,
    isFetching: isFetchingClasses,
  } = useTeacherSubjectGetDataQuery(
    {
      teacherId: selectedTeacherId!,
      // Only include schoolYearId if it's available
      ...(setting?.currentSchoolYearId && { schoolYearId: setting.currentSchoolYearId }),
    },
    { skip: !selectedTeacherId },
  );

  const { data: behaviorRecords, isLoading: isLoadingRecords } = useBehaviorsGetDataQuery(
    {
      teacherSubjectId: selectedTS?.id,
      studentEnrollmentId: selectedTS?.studentEnrollmentId,
      take: 1000,
    },
    { skip: !isStudentModalOpen || !selectedTS },
  );

  const handleViewDetailedReports = (teacherId: string, name: string) => {
    setSelectedTeacherId(teacherId);
    setSelectedTeacherName(name);
  };

  const openStudentModal = (ts: any) => {
    setSelectedTS(ts);
    setIsStudentModalOpen(true);
  };

  const [sectionStatuses, setSectionStatuses] = useState<Record<string, string>>({});

  // console.log("ReportsView Debug:", {
  //   teacherId: selectedTeacherId,
  //   isLoadingClasses,
  //   isFetchingClasses,
  //   teacherSubjectsError,
  //   teacherSubjects,
  //   setting,
  //   sectionStatuses,
  // });
  // Robustly handle different response formats
  // Robustly handle different response formats and provide fallback from teachers list
  const getTeacherSections = () => {
    let sections: any[] = [];

    // 1. Try data from the specific teacherSubjects query
    if (teacherSubjects) {
      if (Array.isArray(teacherSubjects)) {
        sections = teacherSubjects;
      } else if ((teacherSubjects as any).data && Array.isArray((teacherSubjects as any).data)) {
        sections = (teacherSubjects as any).data;
      }
    }

    // 2. Fallback: Try to get subjects from the selected teacher in the main teachers list
    if (sections.length === 0 && teachers?.data) {
      const selectedTeacher = teachers.data.find((t: any) => t.id === selectedTeacherId);
      if (selectedTeacher?.TeacherSubject) {
        // Map the structure slightly to match what the UI expects if needed
        // The main list's TeacherSubject has Section and StageSubject
        sections = selectedTeacher.TeacherSubject;
      }
    }

    return sections;
  };

  const getSortedSections = () => {
    const rawSections = getTeacherSections();
    return [...rawSections].sort((a, b) => {
      const statusA = sectionStatuses[a.id] || "LOADING";
      const statusB = sectionStatuses[b.id] || "LOADING";

      const priority: Record<string, number> = {
        READY: 0,
        INCOMPLETE: 1,
        EMPTY: 2,
        LOADING: 3,
        ERROR: 4,
      };

      return (priority[statusA] ?? 99) - (priority[statusB] ?? 99);
    });
  };

  const currentTeacherSections = getSortedSections();
  // console.log("ReportsView - Final Teacher Sections:", currentTeacherSections);
  // console.log(teachers);
  // console.log(
  //   teachers?.data.map((teacher: any) => {
  //     console.log(teacher.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.fullName || teacher.id}`);
  //   }),
  // );

  return (
    <div>
      <div id="behavior-teachers-section">
        <h3 className="mb-6 flex items-center gap-3 text-xl font-extrabold text-slate-800">
          <Presentation size={24} className="text-violet-600" /> مسودات وتقارير المعلمين
        </h3>

        {isLoading ? (
          <p className="text-gray-500">جاري تحميل المعلمين...</p>
        ) : (
          <div className="overflow-x-auto py-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-violet-100">
            <div className="flex w-max gap-6 px-1">
              {teachers?.data?.map((teacher: any) => (
                <div
                  key={teacher.id}
                  onClick={() => handleViewDetailedReports(teacher.id, teacher.fullName || teacher.name)}
                  className={`group relative min-w-[300px] cursor-pointer overflow-hidden rounded-[24px] border bg-white/60 p-6 shadow-[0_10px_25px_-5px_rgba(139,92,246,0.1)] backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(139,92,246,0.15)] ${
                    selectedTeacherId === teacher.id ? "border-violet-500 shadow-[0_20px_40px_rgba(139,92,246,0.15)]" : "border-slate-200/80"
                  }`}>
                  {/* Active indicator - positioned absolutely inside the card */}
                  <div
                    className={`absolute right-0 top-0 h-full w-[5px] bg-violet-500 transition-opacity duration-300 ${
                      selectedTeacherId === teacher.id ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  <div className="relative mb-5 flex items-start justify-between">
                    <div>
                      <div className="mb-2 text-[1.05rem] font-extrabold text-slate-800">{teacher.fullName || teacher.name}</div>
                      <div className="flex gap-2">
                        <span className="inline-block rounded-lg bg-violet-50 px-3 py-1 text-[0.75rem] font-extrabold text-violet-600">المعلم</span>
                        {teacher.TeacherSubject && (
                          <span className="inline-block rounded-lg bg-emerald-50 px-3 py-1 text-[0.75rem] font-extrabold text-emerald-600">
                            {teacher.TeacherSubject.length} شعبة
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-[55px] w-[55px] overflow-hidden rounded-2xl border-2 border-white bg-slate-100 shadow-md">
                      <img src={teacher.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.id}`} alt="" className="h-full w-full object-cover" />
                    </div>
                  </div>

                  <div className="relative flex items-center gap-[10px] border-t border-slate-100 pt-[18px] text-[0.85rem] font-bold text-slate-400 transition-colors group-hover:text-violet-600">
                    <Users size={16} />
                    <span>عرض كافة الصفوف والشعب</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedTeacherId && (
        <div className="mt-8 animate-[slideInUp_0.5s_ease] rounded-3xl border border-slate-200/80 bg-white/60 p-8 shadow-[0_10px_25px_-5px_rgba(139,92,246,0.1)] backdrop-blur-[10px]">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-violet-600">{selectedTeacherName}</h3>
              <p className="mt-1 text-[0.85rem] font-bold text-slate-400">كافة المواد والصفوف المسندة للمعلم</p>
            </div>
            <div className="rounded-xl bg-violet-50 px-4 py-2">
              <span className="text-sm font-extrabold text-violet-600">{currentTeacherSections.length} شعبة مسندة</span>
            </div>
          </div>

          <div className="space-y-4">
            {isLoadingClasses ? (
              <p className="py-4 text-center italic text-slate-500">جاري تحميل الصفوف...</p>
            ) : currentTeacherSections.length > 0 ? (
              currentTeacherSections.map((ts) => (
                <div
                  key={ts.id}
                  className="grid grid-cols-1 items-center gap-4 border-b border-slate-100 p-5 transition-all hover:rounded-xl hover:bg-violet-50/30 md:grid-cols-[1.5fr_1.5fr_1fr_auto]">
                  <div className="text-[1.1rem] font-extrabold text-slate-800">
                    {t(ts.StageSubject?.Stage?.name as any)} - {ts?.StageSubject?.Class?.name} - {ts.Section?.name}
                  </div>
                  <div className="text-[0.9rem] font-bold text-slate-400">{ts.StageSubject?.Subject?.name}</div>
                  <div>
                    <SectionStatusIndicator
                      ts={ts}
                      behaviorSections={behaviorSections}
                      onStatusUpdate={(status) => {
                        if (sectionStatuses[ts.id] !== status) {
                          setSectionStatuses((prev) => ({ ...prev, [ts.id]: status }));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => openStudentModal(ts)}
                      className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/40">
                      معاينة الطلبة
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center italic text-slate-500">لا توجد صفوف مرتبطة بهذا المعلم.</p>
            )}
          </div>
        </div>
      )}

      {/* Student Behavior Modal */}
      {isStudentModalOpen && selectedTS && (
        <Model
          open={isStudentModalOpen}
          setOpen={setIsStudentModalOpen}
          title={`تلاميذ ${t(selectedTS.StageSubject?.Stage?.name)} - ${selectedTS.Section?.name}`}
          variant="premium"
          size="full"
          className="z-[2000]">
          <div className="p-8 max-h-[80vh] overflow-y-auto overflow-x-auto scrollbar-thin">
            <div className="mb-4">
              <p className="text-sm font-bold text-slate-400">سجل النقاط والملاحظات التفصيلي للمادة: {selectedTS.StageSubject?.Subject?.name}</p>
            </div>

            <div className="min-w-[1200px]">
              {/* Organized Table Header */}
              <div
                className="mb-4 grid gap-4 rounded-xl bg-violet-50/50 p-4 font-extrabold text-violet-700 text-center text-[0.9rem]"
                style={{
                  gridTemplateColumns: `70px 2.5fr ${(behaviorSections?.data || []).map(() => "1fr").join(" ")} 2fr 130px`,
                }}>
                <div>الصورة</div>
                <div className="px-4 text-right">اسم التلميذ</div>
                {behaviorSections?.data?.map((sec) => (
                  <div key={sec.id} className="truncate">
                    {sec.name}
                  </div>
                ))}
                <div>الملاحظات</div>
                <div>التاريخ</div>
              </div>

              {isLoadingStudents || isLoadingRecords ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Clock size={48} className="mb-4 animate-spin opacity-20" />
                  <p className="font-bold italic text-lg">جاري جلب بيانات التلاميذ وسجلات السلوك...</p>
                </div>
              ) : studentEnrollments?.data && studentEnrollments.data.length > 0 ? (
                <div className="space-y-3">
                  {studentEnrollments.data.map((enrollment: any, index: number) => {
                    const allStudentRecords = behaviorRecords?.data?.filter((r: IBehaviorReport) => r.studentEnrollmentId === enrollment.id) || [];
                    // Sort by date to get the latest record easily for notes/date
                    const sortedRecords = [...allStudentRecords].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    const latestRecord = sortedRecords[0];

                    return (
                      <div
                        key={enrollment.id}
                        className="grid items-center gap-4 rounded-2xl border border-transparent bg-white p-4 text-center transition-all hover:border-violet-100 hover:bg-violet-50/30 hover:shadow-sm"
                        style={{
                          gridTemplateColumns: `70px 2.5fr ${(behaviorSections?.data || []).map(() => "1fr").join(" ")} 2fr 130px`,
                        }}>
                        <div>
                          <div className="mx-auto h-[55px] w-[55px] overflow-hidden rounded-2xl border-2 border-white bg-slate-100 shadow-sm transition-transform hover:scale-105">
                            <img
                              src={
                                enrollment?.Student?.photo
                                  ? BASE_URL + "uploads/" + enrollment.Student.photo
                                  : `https://api.dicebear.com/7.x/avataaars/svg?seed=${enrollment?.Student?.User?.username || index}`
                              }
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="px-4 text-right">
                          <div className="font-bold text-slate-800 text-[1rem]">{enrollment.Student?.fullName || enrollment.Student?.name}</div>
                          <div className="text-[0.75rem] font-medium text-slate-400">رقم القيد: {enrollment.id.substring(0, 8)}</div>
                        </div>
                        {behaviorSections?.data?.map((sec) => {
                          // Search for this section item across all student records
                          let item: IBehaviorEvaluationItem | undefined;
                          for (const record of sortedRecords) {
                            item = record.evaluationItems?.find((i: IBehaviorEvaluationItem) => i.behaviorSectionId === sec.id);
                            if (item) break; // Take from latest record that has this section
                          }
                          const type = item?.BehaviorType;
                          return (
                            <div key={sec.id} className="flex justify-center">
                              {type ? (
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.8rem] font-extrabold ${
                                    type.name.includes("ممتاز") || type.name.includes("جيد")
                                      ? "bg-emerald-50 text-emerald-600"
                                      : type.name.includes("ضعيف") || type.name.includes("لا")
                                        ? "bg-rose-50 text-rose-600"
                                        : "bg-amber-50 text-amber-600"
                                  }`}>
                                  {type.name.includes("ممتاز") ? "🤩" : type.name.includes("ضعيف") ? "😞" : "😐"} {type.name}
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </div>
                          );
                        })}
                        <div className="px-2">
                          <div
                            className="max-w-full truncate rounded-lg bg-slate-50 px-3 py-2 text-[0.8rem] font-medium italic text-slate-500 text-right"
                            title={latestRecord?.notes || undefined}>
                            {latestRecord?.notes || "لا توجد ملاحظات"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[0.85rem] font-extrabold text-slate-500 bg-slate-100/50 py-1.5 rounded-lg">
                            {latestRecord?.createdAt ? new Date(latestRecord.createdAt).toLocaleDateString("ar-EG") : "-"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Users size={64} className="mb-4 opacity-10" />
                  <p className="font-bold italic text-lg text-slate-400">لا يوجد طلاب مسجلين في هذا الصف حالياً.</p>
                </div>
              )}
            </div>
          </div>
        </Model>
      )}
    </div>
  );
}
