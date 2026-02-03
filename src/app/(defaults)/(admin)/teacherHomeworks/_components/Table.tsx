"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect, useRef, useState } from "react";
import moment, { now } from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { SelectWithSearch } from "@/components/Filter/SelectSearch";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import { useSettingGetDataQuery } from "@/services/Setting";
import SelectFilter from "@/components/Filter/SelectFilter";
import { useSectionGetDataQuery } from "@/services/admin/section";
import { useTeacherSubjectGetDataQuery } from "@/services/admin/TeacherSubject";
import { useTeacherHomeworksGetDataQuery, useTeacherHomeworksIsSeenUpdateMutation } from "@/services/admin/teacherHomeworks";
import { AddIcons } from "@/components/common/icons/Actions";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { DatePicker } from "@/components/Filter/DatePicker";
import FormattedDate, { FormattedDate2 } from "@/components/common/FormattedDate";
import HomeworkModal from "./HomeworkModal";

const TableComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
  const { isMounted } = useMounted();

  const { currentData: Setting, isFetching: isFetchingSetting } = useSettingGetDataQuery();

  const [pageNumber, setPageNumber] = useState<number>(1);

  const [stageId, setStageId] = useState<string | undefined>();
  const [classId, setClassId] = useState<string | undefined>();
  const [sectionId, setSectionId] = useState<string | undefined>();
  const [schoolYearId, setSchoolYearId] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>("");

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [param, setParam] = useState<{
    search?: string;
    range?: string;
    sectionId?: string;
    schoolYearId?: string;
    teacherSubjectId?: string;
    classId?: string;
    stageId?: string;
    date?: string;
  }>({});

  const { currentData: SectionData } = useSectionGetDataQuery({});
  const { currentData: TeacherSubjectData } = useTeacherSubjectGetDataQuery({
    stageId,
    classId,
    schoolYearId: schoolYearId || Setting?.currentSchoolYearId || "",
    sectionId,
  });
  const { currentData: SchoolYearData } = useSchoolYearGetDataQuery();

  // School Year Default
  useEffect(() => {
    if (SchoolYearData && Setting) {
      setParam((prev) => ({
        ...prev,
        schoolYearId: Setting?.currentSchoolYearId,
      }));
    }
  }, [SchoolYearData, Setting]);

  // Restore scroll position
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedScrollPosition = sessionStorage.getItem("teacherHomeworks_scrollPosition");
      if (savedScrollPosition && scrollContainerRef.current) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScrollPosition, 10));
        }, 100);
        sessionStorage.removeItem("teacherHomeworks_scrollPosition");
      }
    }
  }, []);

  const params = {
    skip: pageNumber,
    take: 30,
    sortBy: sortStatus.columnAccessor,
    sortDirection: sortStatus.direction,
    ...(search && { search }),
    range: param.range,
    sectionId: param.sectionId,
    schoolYearId: param.schoolYearId,
    teacherSubjectId: param.teacherSubjectId,
    ...(param?.date && { date: param.date }),
  };

  const { isFetching, currentData: data } = useTeacherHomeworksGetDataQuery(params);
  const [updateIsSeen] = useTeacherHomeworksIsSeenUpdateMutation();

  const { currentData: StageData } = useStageGetDataQuery();

  const [Search, setSearch] = useState(search);
  const allParams = new URLSearchParams(searchParams);

  const handleChange = (e: any) => {
    const value = e.target.value;
    setSearch(value);
    if (value === "") handleSearch(value);
  };

  const handleSearch = (value?: string) => {
    if (search !== Search) {
      allParams.set("search", value ?? Search);
      router.push(`/teacherHomeworks?${allParams.toString()}`);
      setPageNumber(1);
    }
  };

  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") handleSearch();
  };

  const pushWithCurrentParams = (path = "/teacherHomeworks", extra: Record<string, any> = {}) => {
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

  const handleSelectDate = (value: string) => {
    setSelectedDate(value);
    const date = value || undefined;
    setParam((prev) => ({ ...prev, date }));
    pushWithCurrentParams("/teacherHomeworks", { date });
  };

  const handleSelectSection = (value: any) => {
    setSectionId(value || undefined);
    const sectionId = value || undefined;
    setParam((prev) => ({ ...prev, sectionId }));
    pushWithCurrentParams("/teacherHomeworks", { sectionId });
  };

  const handleSelectTeacherSubject = (value: any) => {
    const teacherSubjectId = value?.value || undefined;
    setParam((prev) => ({ ...prev, teacherSubjectId }));
    pushWithCurrentParams("/teacherHomeworks", { teacherSubjectId });
  };

  const handleSelectSchoolYear = (value: any) => {
    const schoolYearId = value?.value || undefined;
    setSchoolYearId(schoolYearId);
    setParam((prev) => ({ ...prev, schoolYearId }));
    pushWithCurrentParams("/teacherHomeworks", { schoolYearId });
  };

  const handleSelectClass = (value: any) => {
    const classId = value || undefined;
    setClassId(classId);
    setParam((prev) => ({ ...prev, classId, sectionId: undefined }));
    pushWithCurrentParams("/teacherHomeworks", { classId, sectionId: undefined });
  };

  const handleSelectStage = (value: any) => {
    const stageId = value || undefined;
    setStageId(stageId);
    setParam((prev) => ({ ...prev, stageId, classId: undefined, sectionId: undefined }));
    pushWithCurrentParams("/teacherHomeworks", { stageId, classId: undefined, sectionId: undefined });
  };

  const handleRowClick = (item: any) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("teacherHomeworks_scrollPosition", window.scrollY.toString());
    }
    updateIsSeen({ id: item.record.id as string, status: "TRUE" });
    router.push(`/teacherHomeworks/${item.record.id}`);
  };

  // Calculate statistics
  const totalHomeworks = data?.totalCount || 0;
  const newHomeworks = data?.data?.filter((hw: any) => hw.isSeen === "FALSE" && moment(hw?.updatedAt || "").isSameOrAfter(moment().subtract(2, "days").startOf("day"))).length || 0;
  const dueSoon = data?.data?.filter((hw: any) => hw.dueDate && moment(hw.dueDate).isBetween(moment(), moment().add(3, "days"))).length || 0;

  return (
    <div ref={scrollContainerRef} className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("HomeworksPage.Homeworks")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">إدارة ومتابعة الواجبات المنزلية</p>
        </div>

        <div className="flex gap-3">
          <input
            value={Search}
            placeholder={`${t("common.search")} ...`}
            onKeyDown={handleKeyPress}
            onChange={handleChange}
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1b2e4b] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />

          <SelectWithSearch
            placeholder={t("HomeworksPage.SchoolYear")}
            isLoading={!SchoolYearData || isFetchingSetting}
            props={{
              onChange: handleSelectSchoolYear,
              value: param.schoolYearId,
            }}
            options={SchoolYearData?.map((item) => ({ value: item.id, label: `${item.from}-${item.to}` }))}
          />

          <DatePicker value={selectedDate} onChange={handleSelectDate} placeholder={t("SuperTeacherAttendancesPage.Select_Date")} className="min-w-[180px]" />

          <RolePageAndActionBasedComponent
            resource={"homework"}
            permission={["create-any", "create-own"]}
            component={(props) => (
              <button
                className={`${props.disabled && "hidden"} flex w-full items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors shadow-sm`}
                onClick={() => setIsModalOpen(true)}>
                <AddIcons className="h-4 w-4" />
                {t("HomeworksPage.addNewHomework")}
              </button>
            )}
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-[#0e1726] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#f1f5f9] dark:border-[#1b2e4b] mt-4 mb-6">
        <div className="flex justify-between items-end gap-5 flex-wrap">
          <div className="flex gap-5 flex-wrap flex-1">
            <SelectFilter
              value={param?.stageId}
              placement="bottom-end"
              title={t("StudentEnrollmentPage.StageName")}
              handleChange={handleSelectStage}
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              }
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
              title={t("SectionPage.ClassName")}
              placement="bottom-end"
              handleChange={handleSelectClass}
              disabled={!param?.stageId}
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              }
              options={
                StageData?.find((it) => it.id == param?.stageId)?.Class?.map((item) => {
                  return {
                    value: item.id,
                    label: t(item.name as any),
                  };
                }) ?? []
              }
            />

            <SelectFilter
              value={param?.sectionId}
              title={t("StudentEnrollmentPage.SectionName")}
              placement="bottom-end"
              handleChange={handleSelectSection}
              disabled={!param?.classId}
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
              options={
                StageData?.find((it) => it.id == param?.stageId)
                  ?.Class.find((it) => it.id == param?.classId)
                  ?.Section?.map((item) => {
                    return {
                      value: item.id,
                      label: t(item.name as any),
                    };
                  }) ?? []
              }
            />

            <div className="min-w-[160px] flex-1 max-w-[240px]">
              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t("HomeworksPage.teacherFullName")}
                </label>
                <SelectWithSearch
                  placeholder={t("common.all") || "الكل"}
                  props={{
                    onChange: handleSelectTeacherSubject,
                    value: param.teacherSubjectId,
                  }}
                  options={
                    TeacherSubjectData?.map((item) => {
                      return {
                        label: item.StageSubject?.Subject?.name + " - " + item?.Teacher?.fullName,
                        value: item.id,
                      };
                    }) ?? []
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => {
                setStageId(undefined);
                setClassId(undefined);
                setSectionId(undefined);
                setParam((prev) => ({
                  ...prev,
                  stageId: undefined,
                  classId: undefined,
                  sectionId: undefined,
                  teacherSubjectId: undefined,
                }));
                pushWithCurrentParams("/teacherHomeworks", {
                  stageId: undefined,
                  classId: undefined,
                  sectionId: undefined,
                  teacherSubjectId: undefined,
                });
              }}
              className="flex items-center justify-center w-10 h-10 bg-[#f8fafc] dark:bg-[#1b2e4b] text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#253b5c] transition-colors border border-gray-200 dark:border-[#1b2e4b]"
              title={t("common.reset") || "إعادة تعيين"}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="datatables pagination-padding">
        {isMounted && (
          <div className="bg-white dark:bg-[#0e1726] rounded-xl shadow-sm border border-gray-100 dark:border-[#1b2e4b] overflow-hidden">
            <DataTable
              fetching={isFetching}
              className={`${isDark ? "dark" : ""} table-hover whitespace-nowrap`}
              records={data?.data as any}
              onRowClick={handleRowClick}
              minHeight={400}
              columns={[
                {
                  title: t("HomeworksPage.teacherFullName"),
                  accessor: "teacherSubject.Teacher.fullName",
                  // sortable: true,
                  width: 220,
                  render: ({ teacherSubject }: any) => (
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex items-center justify-center w-9 h-9 rounded-full 
                        bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm
                        border-2 border-primary/20 shadow-sm">
                        {teacherSubject?.Teacher?.fullName?.charAt(0)}
                      </div>
                      <span className="text-base text-gray-800 dark:text-gray-200 font-bold">{teacherSubject?.Teacher?.fullName}</span>
                    </div>
                  ),
                },
                {
                  title: t("HomeworksPage.SubjectName"),
                  accessor: "teacherSubject.StageSubject.Subject.name",
                  // width: 150,
                  render: ({ teacherSubject }: any) => (
                    <span
                      className="inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold 
                      bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 
                      dark:from-indigo-900/30 dark:to-indigo-800/20 dark:text-indigo-300
                      border border-indigo-200 dark:border-indigo-800/50 shadow-sm">
                      {teacherSubject?.StageSubject?.Subject?.name && t(teacherSubject.StageSubject.Subject.name)}
                    </span>
                  ),
                },
                {
                  title: t("HomeworksPage.title"),
                  accessor: "title",
                  sortable: true,
                  width: 280,
                  render: ({ title, isSeen, updatedAt }: any) => (
                    <div className="flex items-start gap-3 py-1">
                      {isSeen === "FALSE" && moment(updatedAt || "").isSameOrAfter(moment().subtract(2, "days").startOf("day")) && (
                        <span className="flex-shrink-0 w-2.5 h-2.5 mt-1.5 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-500 dark:text-white mb-1 line-clamp-2 leading-snug">{title}</div>
                        {/* <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <FormattedDate date={updatedAt} />
                        </div> */}
                      </div>
                    </div>
                  ),
                },
                {
                  title: t("HomeworksPage.StageName"),
                  accessor: "teacherSubject.StageSubject.Stage.name",
                  width: 120,
                  render: ({ teacherSubject }: any) => (
                    <span
                      className="inline-flex px-2.5 py-1 rounded-md text-sm font-semibold 
                      bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300
                      border border-purple-200 dark:border-purple-800/50">
                      {teacherSubject?.StageSubject?.Stage?.name && t(teacherSubject.StageSubject.Stage.name)}
                    </span>
                  ),
                },
                {
                  title: t("HomeworksPage.ClassName"),
                  accessor: "teacherSubject.StageSubject.Class.name",
                  width: 160,
                  render: ({ teacherSubject }: any) => {
                    const name = teacherSubject?.StageSubject?.Class?.name;
                    return name ? (
                      <span
                        className="inline-flex px-2.5 py-1 rounded-md text-sm font-semibold 
                        bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300
                        border border-emerald-200 dark:border-emerald-800/50">
                        {t(name)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    );
                  },
                },
                {
                  title: t("HomeworksPage.SectionName"),
                  accessor: "StudentHomework",
                  width: 180,
                  render: ({ StudentHomework }) => {
                    const list = Array.isArray(StudentHomework) ? StudentHomework : [];
                    const sections = Array.from(new Set(list.map((item: any) => item?.Student?.StudentEnrollment?.[0]?.Section?.name).filter(Boolean)));

                    return sections.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {sections.map((section, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold 
                              bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300
                              border border-orange-200 dark:border-orange-800/50">
                            {section}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    );
                  },
                },
                // {
                //   title: t("HomeworksPage.dueDate"),
                //   accessor: "dueDate",
                //   sortable: true,
                //   width: 140,
                //   render: ({ dueDate }: any) => {
                //     if (!dueDate) return <span className="text-gray-400 text-sm">-</span>;

                //     const isOverdue = moment(dueDate).isBefore(moment());
                //     const isDueSoon = moment(dueDate).isBetween(moment(), moment().add(3, "days"));

                //     return (
                //       <div
                //         className={`flex items-center gap-2 text-sm font-medium
                //         ${isOverdue ? "text-red-600 dark:text-red-400" : isDueSoon ? "text-orange-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-400"}`}>
                //         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                //           <path
                //             strokeLinecap="round"
                //             strokeLinejoin="round"
                //             strokeWidth={2}
                //             d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                //           />
                //         </svg>
                //         {moment(dueDate).format("MM/DD")}
                //         {/* {isOverdue && <span className="text-xs">(متأخر)</span>} */}
                //       </div>
                //     );
                //   },
                // },
                // {
                //   title: t("HomeworksPage.SchoolYear"),
                //   accessor: "SchoolYear.from",
                //   width: 140,
                //   render: ({ SchoolYear }: any) =>
                //     SchoolYear?.from || SchoolYear?.to ? (
                //       <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                //         {SchoolYear.from} - {SchoolYear.to}
                //       </span>
                //     ) : (
                //       <span className="text-gray-400 text-sm">-</span>
                //     ),
                // },
                {
                  title: t("common.allDates"),
                  accessor: "updatedAt",
                  sortable: true,
                  render: (row: any) => (
                    <div className="space-y-2">
                      <FormattedDate2
                        date={row.updatedAt}
                        label={t("common.updatedAt")} // "التحديث"
                      />
                      <FormattedDate2
                        date={row.createdAt}
                        label={t("common.createdAt")} // "التقديم"
                      />
                    </div>
                  ),
                },
              ]}
              customLoader={
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="loader !bg-primary mb-4"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">جاري التحميل...</p>
                </div>
              }
              noRecordsText={t("common.no-data")}
              noRecordsIcon={
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">لا توجد واجبات للعرض</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">جرب تغيير الفلاتر أو البحث</p>
                </div>
              }
              sortStatus={sortStatus}
              onSortStatusChange={setSortStatus}
              totalRecords={data?.totalCount}
              rowClassName={(record) => {
                const baseClasses = "transition-all duration-200 cursor-pointer border-b border-gray-50 dark:border-gray-800/50";
                if (record.isSeen === "FALSE" && moment(record?.createdAt || "").isSameOrAfter(moment().subtract(2, "days").startOf("day"))) {
                  return `${baseClasses} !bg-gradient-to-r !from-blue-50/50 !to-blue-100/30 
                    dark:!from-blue-900/10 dark:!to-blue-800/5 
                    hover:!from-blue-100/60 hover:!to-blue-200/40 
                    dark:hover:!from-blue-900/20 dark:hover:!to-blue-800/10
                    border-l-4 !border-l-blue-500 shadow-sm`;
                }
                return `${baseClasses} hover:bg-gray-50/50 dark:hover:bg-[#1b2e4b]/30`;
              }}
              recordsPerPage={30}
              page={pageNumber}
              onPageChange={(p) => setPageNumber(p)}
            />
          </div>
        )}
      </div>

      {/* Homework Modal */}
      <HomeworkModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        onSuccess={() => {
          setIsModalOpen(false);
          // Optionally refetch data here if needed
        }}
      />
    </div>
  );
};

export default withRole(TableComponent, "homework", ["read-any", "read-own"]);
