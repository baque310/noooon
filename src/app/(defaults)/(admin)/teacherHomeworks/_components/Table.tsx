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
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | undefined>();
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
    // router.push(`/teacherHomeworks/${item.record.id}`);
    setSelectedHomeworkId(item.record.id);
    setIsModalOpen(true);
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
                onClick={() => {
                  setSelectedHomeworkId(undefined);
                  setIsModalOpen(true);
                }}>
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

      {/* List Header - Matching index.html grid style */}
      <div className="hidden md:grid grid-cols-[1.5fr_1fr_2fr_1fr_1.5fr_1fr] gap-4 px-6 py-4 bg-primary/5 dark:bg-primary/10 rounded-xl mb-4 text-primary font-extrabold text-sm text-center">
        <div>{t("HomeworksPage.teacherFullName")}</div>
        <div>{t("HomeworksPage.SubjectName")}</div>
        <div>{t("HomeworksPage.title")}</div>
        <div>{t("HomeworksPage.StageName")}</div>
        <div>{t("HomeworksPage.ClassName")}</div>
        <div>{t("common.allDates")}</div>
      </div>

      {/* Cards List */}
      <div className="flex flex-col gap-3">
        {isFetching ? (
          <div className="flex justify-center items-center py-16">
            <div className="loader !bg-primary !w-8 !h-8" />
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400 dark:text-gray-500">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <p className="font-bold text-sm">{t("common.no-data")}</p>
          </div>
        ) : (
          data?.data?.map((record: any) => {
            const isMarkedUnseen = record.isSeen === "FALSE" && moment(record?.createdAt || "").isSameOrAfter(moment().subtract(2, "days").startOf("day"));

            return (
              <div
                key={record.id}
                onClick={() => handleRowClick({ record })}
                className={`grid grid-cols-1 md:grid-cols-[1.5fr_1fr_2fr_1fr_1.5fr_1fr] gap-4 items-center px-6 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${isMarkedUnseen ? "!bg-gradient-to-r !from-blue-50/50 !to-blue-100/30 dark:!from-blue-900/10 dark:!to-blue-800/5 hover:!from-blue-100/60 hover:!to-blue-200/40 border-l-4 !border-l-blue-500" : ""
                  }`}>

                {/* Teacher FullName */}
                <div className="flex items-center gap-2.5 justify-center md:justify-start">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold text-sm border border-primary/20 shadow-sm">
                    {record.teacherSubject?.Teacher?.fullName?.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-800 dark:text-gray-200 font-bold text-center md:text-start">{record.teacherSubject?.Teacher?.fullName}</span>
                </div>

                {/* Subject Name */}
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {record.teacherSubject?.StageSubject?.Subject?.name && t(record.teacherSubject.StageSubject.Subject.name)}
                  </span>
                </div>

                {/* Title */}
                <div className="flex items-start gap-3 py-1 justify-center md:justify-start">
                  {isMarkedUnseen && (
                    <span className="flex-shrink-0 w-2.5 h-2.5 mt-1.5 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-700 dark:text-white mb-1 line-clamp-2 leading-snug text-center md:text-start">{record.title}</div>
                  </div>
                </div>

                {/* Stage */}
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {record.teacherSubject?.StageSubject?.Stage?.name && t(record.teacherSubject.StageSubject.Stage.name)}
                  </span>
                </div>

                {/* Class & Section */}
                <div className="text-center">
                  {(() => {
                    const className = record.teacherSubject?.StageSubject?.Class?.name ? t(record.teacherSubject.StageSubject.Class.name) : "";
                    const list = Array.isArray(record.StudentHomework) ? record.StudentHomework : [];
                    const sections = Array.from(new Set(list.map((item: any) => item?.Student?.StudentEnrollment?.[0]?.Section?.name).filter(Boolean)));

                    if (className && sections.length > 0) {
                      return <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{className} / {sections.join(" , ")}</span>;
                    } else if (className) {
                      return <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{className}</span>;
                    }
                    return <span className="text-gray-400 text-sm">-</span>;
                  })()}
                </div>

                {/* Dates */}
                <div className="flex flex-col items-center justify-center space-y-2 text-sm">
                  <FormattedDate2 date={record.updatedAt} label={t("common.updatedAt")} />
                  <FormattedDate2 date={record.createdAt} label={t("common.createdAt")} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {(data?.totalCount ?? 0) > 30 &&
        (() => {
          const totalPages = Math.ceil((data?.totalCount ?? 0) / 30);
          const startRecord = (pageNumber - 1) * 30 + 1;
          const endRecord = Math.min(pageNumber * 30, data?.totalCount ?? 0);
          return (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
              <div className="text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl">
                عرض{" "}
                <span className="text-primary font-extrabold">{startRecord}–{endRecord}</span>{" "}
                من أصل <span className="text-gray-700 dark:text-gray-200 font-extrabold">{data?.totalCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber === 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm shadow-sm hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 transition-all duration-200">
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  السابق
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) page = i + 1;
                    else if (pageNumber <= 3) page = i + 1;
                    else if (pageNumber >= totalPages - 2) page = totalPages - 4 + i;
                    else page = pageNumber - 2 + i;

                    return (
                      <button
                        key={page}
                        onClick={() => setPageNumber(page)}
                        className={`w-10 h-10 rounded-xl font-extrabold text-sm transition-all duration-200 ${pageNumber === page ? "bg-primary text-white shadow-md shadow-primary/30 scale-110" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary"}`}>
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPageNumber((p) => p + 1)}
                  disabled={!data?.data || data.data.length < 30}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm shadow-sm hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 transition-all duration-200">
                  التالي
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })()}

      {/* Homework Modal */}
      <HomeworkModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        homeworkId={selectedHomeworkId}
        onSuccess={() => {
          setIsModalOpen(false);
          // Optionally refetch data here if needed
        }}
      />
    </div>
  );
};

export default withRole(TableComponent, "homework", ["read-any", "read-own"]);
