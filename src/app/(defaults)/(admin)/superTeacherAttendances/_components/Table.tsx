"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect, useMemo } from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import { AddIcons, ArrowIcons, DeleteIcons, UpdateIcons } from "@/components/common/icons/Actions";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";

import {
  useSuperTeacherAttendancesGetDataQuery,
  useSuperTeacherAttendancesUpdateMutation,
  useSuperTeacherAttendancesRemoveMutation,
} from "@/services/admin/Super-Teacher-attendances";
import { useStageGetDataQuery } from "@/services/admin/stage";
import SelectFilter from "@/components/Filter/SelectFilter";
import { useSectionScheduleGetDataQuery } from "@/services/admin/SectionSchedule";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import { useSettingGetDataQuery } from "@/services/Setting";
import { SelectWithSearch } from "@/components/Filter/SelectSearch";
import { useTeacherSubjectGetDataQuery } from "@/services/admin/TeacherSubject";
import { Days } from "@/services/types/BaseType";
import { DatePicker } from "@/components/Filter/DatePicker"; // Adjust path as needed
import { exportJsonToExcel } from "@/utils/excelParser";
import Dropdown from "@/components/dropdown";
import DeleteModel from "@/components/Model/DeleteModel";
import GroupedUpdateModal from "./GroupedUpdateModal";
import { toast } from "react-toastify";
import { FormattedDate2 } from "@/components/common/FormattedDate";

const TableComponent = () => {
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

  const [pageNumber, setPageNumber] = useState(Number(1));
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<any>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<any[]>([]);

  const [param, setParam] = useState<
    | {
      classId?: string;
      stageId?: string;
      sectionId?: string;
      sectionScheduleId?: string;
      search?: string;
      schoolYearId?: string;
      teacherSubjectId?: string;
      date?: string;
    }
    | undefined
  >();
  const params = {
    skip: pageNumber,
    take: 100,
    sortBy: sortStatus.columnAccessor,
    sortDirection: sortStatus.direction,
    ...(search && { search: search as string }),
    sectionScheduleId: param?.sectionScheduleId,
    ...(param?.date && { date: param.date }),
  };

  const { isFetching, currentData: data } = useSuperTeacherAttendancesGetDataQuery({
    ...params,
  });
  const { isFetching: isFetchingStageData, currentData: StageData } = useStageGetDataQuery();

  const [Search, setSearch] = useState(search);
  const handleChange = (e: any) => {
    const value = e.target.value;
    setSearch(value);
    if (value == "") {
      handleSearch(value);
    }
  };
  const allParams = new URLSearchParams(searchParams);
  const handleSearch = (value?: string) => {
    if (search != Search) {
      allParams.set("search", value ?? Search);

      router.push(`/superTeacherAttendances?${allParams.toString()}`);
      setPageNumber(1);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const { isFetching: isFetchingSchoolYearData, currentData: SchoolYearData } = useSchoolYearGetDataQuery();
  const { currentData: Setting, isFetching: isFetchingSetting } = useSettingGetDataQuery();

  useEffect(() => {
    if (SchoolYearData) {
      setParam({
        ...param,
        schoolYearId: Setting?.CurrentSchoolYear.id,
      });
    }
  }, [SchoolYearData, Setting]);

  const { isFetching: isFetchingSectionSchedule, currentData: SectionScheduleData } = useSectionScheduleGetDataQuery({
    schoolYearId: param?.schoolYearId,
    sectionId: param?.sectionId,
  });

  const pushWithCurrentParams = (path = "/superTeacherAttendances", extra: Record<string, any> = {}) => {
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

  const handleSelectSectionSchedule = (value: any) => {
    // setSectionId(value ? value : undefined);
    const sectionScheduleId = value ?? undefined;
    setParam((old) => ({ ...(old ?? {}), sectionScheduleId }));
    pushWithCurrentParams("/superTeacherAttendances", { sectionScheduleId });
  };
  const handleSelectSection = (value: any) => {
    // setSectionId(value ? value : undefined);
    const sectionId = value ?? undefined;
    setParam((old) => ({ ...(old ?? {}), sectionId }));
    pushWithCurrentParams("/superTeacherAttendances", { sectionId });
  };
  const handleSelectClass = (value: any) => {
    // setClassId(value ? value : undefined);
    const classId = value ?? undefined;
    setParam((old) => ({ ...(old ?? {}), classId, sectionId: undefined }));
    pushWithCurrentParams("/superTeacherAttendances", {
      classId,
      sectionId: undefined,
    });
  };
  const handleSelectStage = (value: any) => {
    const stageId = value ?? undefined;
    // setStageId(value ? value : undefined);
    setParam((old) => ({
      ...(old ?? {}),
      stageId,
      classId: undefined,
      sectionId: undefined,
    }));
    pushWithCurrentParams("/superTeacherAttendances", {
      stageId,
      classId: undefined,
      sectionId: undefined,
    });
  };

  // --- State ---
  const [selectedDay, setSelectedDay] = useState<Days | null>(null);

  // --- Days List ---
  const days: Days[] = useMemo(() => {
    if (!SectionScheduleData?.data) return [];
    return Object.keys(SectionScheduleData.data) as Days[];
  }, [SectionScheduleData]);

  // --- Options for selected day ---
  const sectionOptions = useMemo(() => {
    if (!selectedDay || !SectionScheduleData?.data?.[selectedDay]) return [];

    return SectionScheduleData.data[selectedDay].map((item: any) => ({
      label: `${item.teacherSubject.Teacher.fullName} | ${item.teacherSubject.StageSubject.Subject.name} | ${item.section.Class.name} (${new Date(
        item.Schedule.timeFrom,
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(item.Schedule.timeTo).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`,
      value: item.id,
    }));
  }, [selectedDay, SectionScheduleData]);

  // --- Date State ---
  const [selectedDate, setSelectedDate] = useState<string>("");

  // --- Handle Date Change ---
  const handleSelectDate = (dateValue: string) => {
    setSelectedDate(dateValue);
    setParam((prev) => ({
      ...prev,
      date: dateValue || undefined,
    }));
  };

  const [StatusUpdate, { isLoading: isLoadingUpdate }] = useSuperTeacherAttendancesUpdateMutation();
  const [SuperTeacherAttendancesRemove, { isLoading: isLoadingRemove }] = useSuperTeacherAttendancesRemoveMutation();
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl" ? true : false;

  const handleUpdateGroupSubmit = async (updates: Record<string, "Absent" | "Present" | "Vacation">) => {
    try {
      const updatePromises = Object.entries(updates).map(([id, newStatus]) => {
        return StatusUpdate({
          id,
          body: { Status: newStatus },
        }).unwrap();
      });

      await Promise.all(updatePromises);

      toast.success(String(t("common.updated-successfully" as any)), { autoClose: 3000 });
      setOpenUpdateModal(false);
      setSelectedStatus(null);
    } catch (error: any) {
      console.error("Failed to update attendances:", error);
      toast.error(error?.data?.message ?? error?.message ?? JSON.stringify(error), { autoClose: 30000 });
    }
  };

  const groupedData = useMemo(() => {
    if (!data?.data) return [];
    const groups: Record<string, any[]> = {};
    data.data.forEach((record: any) => {
      const key = `${record.sectionScheduleId}_${moment(record.date).format("YYYY-MM-DD")}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(record);
    });
    return Object.values(groups);
  }, [data?.data]);

  const handleUpdateClick = (groupRecords: any[]) => {
    setSelectedStatus(groupRecords);
    setOpenUpdateModal(true);
  };

  const handleRemoveIds = async (ids: string[]) => {
    try {
      await SuperTeacherAttendancesRemove({
        body: { attendanceIds: ids },
      }).unwrap();

      toast.success(t("common.deleted-successfully"), { autoClose: 3000 });
      setOpenUpdateModal(false);
      setSelectedStatus(null);
    } catch (error: any) {
      console.error("Failed to delete specific attendances:", error);
      toast.error(error?.data?.message ?? error?.message ?? JSON.stringify(error), { autoClose: 15000 });
    }
  };

  const handleRemove = async () => {
    try {
      const ids = selectedRecords.map((record) => record.id);
      await SuperTeacherAttendancesRemove({
        body: { attendanceIds: ids },
      }).unwrap();

      toast.success(t("common.deleted-successfully"), { autoClose: 15000 });
      setOpenDelete(false);
      setSelectedRecords([]);
    } catch (error: any) {
      console.error("Failed to delete:", error);
      if (error && error.message) {
        return toast.error(t(error.message), { autoClose: 15000 });
      }
      toast.error(error?.data?.message ?? error?.message ?? JSON.stringify(error), { autoClose: 15000 });
    }
  };

  return (
    <div className={`m-4    rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("SuperTeacherAttendancesPage.superTeacherAttendances")}</div>

        <div className={"flex gap-3 max-md:flex-col max-md:items-end"}>
          <input
            value={Search ?? ""}
            placeholder={`${t("common.search")} ...`}
            onKeyDown={handleKeyPress}
            onChange={handleChange}
            id="search"
            className="form-input text-white-dark"
            name="search"
          />

          <div className="flex gap-3 max-md:flex-col max-md:items-end">
            <DatePicker value={selectedDate} onChange={handleSelectDate} placeholder={t("SuperTeacherAttendancesPage.Select_Date") || "Select Date"} className="min-w-[180px]" />
          </div>

          {/* Export to Excel Button */}
          <button
            onClick={() => {
              // Replace the exportJsonToExcel call with this corrected version:

              exportJsonToExcel({
                data:
                  (data?.data ?? []).map((item: any) => {
                    return {
                      StudentName: item.StudentEnrollment?.Student?.fullName ?? "",
                      Status: t(`SuperTeacherAttendancesPage.${item.Status}` as any) ?? item.Status ?? "",
                      SubjectName: item.SectionSchedule?.teacherSubject?.StageSubject?.Subject?.name ?? "",
                      TeacherName: item.SectionSchedule?.teacherSubject?.Teacher?.fullName ?? "",
                      StageName: item.StudentEnrollment?.Section?.Class?.Stage?.name ? t(`${item.StudentEnrollment.Section.Class.Stage.name}` as any) : "",
                      ClassName: item.StudentEnrollment?.Section?.Class?.name ?? "",
                      SectionName: item.StudentEnrollment?.Section?.name ?? "",
                      Date: item.date ? moment(item.date).format("YYYY-MM-DD hh:mm:ss A") : "",
                    };
                  }) ?? [],
                fileName: "super-teacher-attendances",
                sheetName: "Attendances",
              });
            }}
            disabled={!data?.data || data.data.length === 0 || isFetching}
            className={`relative overflow-hidden group flex items-center gap-3 mx-2 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:shadow-md transform hover:scale-105 active:scale-95 disabled:transform-none transition-all duration-200 border border-green-500/20 disabled:border-gray-400/20 min-w-fit whitespace-nowrap`}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            <svg className="h-5 w-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>

            <span className="relative z-10">{t("common.ExportExcel")}</span>
          </button>
          {
            <RolePageAndActionBasedComponent
              component={(props) => {
                return (
                  <div className="inline-flex relative">
                    <button
                      className={`${props.disabled && "hidden"
                        } flex justify-center gap-1 border-l-dark-light/35 items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2 rounded border ltr:rounded-r-none rtl:rounded-l-none`}
                      onClick={() => {
                        router.push("/superTeacherAttendances/createOrUpdate");
                      }}>
                      {t("common.add")}
                    </button>
                    <div className="relative w-0 h-0">
                      <span
                        className={`${selectedRecords.length > 0 ? "bg-danger" : "bg-transparent text-transparent"
                          } badge absolute top-[-15px] z-10 left-[-70px] p-0.5 px-1.5 rounded-full`}>
                        {selectedRecords.length > 0 ? selectedRecords.length : ""}
                      </span>
                    </div>
                    <div className="dropdown">
                      <Dropdown
                        placement={`${isRtl ? "bottom-start" : "bottom-end"}`}
                        btnClassName="dropdown-toggle h-full transition-all"
                        button={
                          <button
                            className={`relative h-full ltr:rounded-l-none rtl:rounded-r-none flex justify-center gap-1 items-center border-primary/70 text-primary hover:scale-[1.01] transition-transform py-1 px-2 rounded border`}>
                            {t("common.options")}
                            <ArrowIcons className="h-4 w-4 rotate-90" />
                          </button>
                        }>
                        <ul className="!min-w-[170px]">
                          <li className={`${selectedRecords.length > 0 ? "text-danger hover:bg-danger/20 hover:!text-danger" : ""}`}>
                            <button
                              disabled={selectedRecords.length == 0}
                              onClick={() => {
                                setOpenDelete(true);
                              }}
                              type="button"
                              className={`${selectedRecords.length > 0 ? "!text-danger" : " !cursor-not-allowed hover:!bg-gray-500/20 !text-gray-500 "} flex justify-between`}>
                              {t("common.delete")}
                              <DeleteIcons className="h-4 w-4" />
                            </button>
                          </li>
                        </ul>
                      </Dropdown>
                    </div>
                  </div>
                );
              }}
              resource={"admin"}
              permission={["create-any", "create-own"]}
            />
          }
        </div>
      </div>
      <div className={"flex justify-between max-md:flex-col gap-2 "}></div>

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t("SuperTeacherAttendancesPage.Select_Day")}
                </label>
                <SelectWithSearch
                  placeholder={t("common.all") || "الكل"}
                  props={{
                    onChange: (option: any) => {
                      setSelectedDay(option?.value as Days);
                      setParam({ ...param, sectionScheduleId: undefined });
                    },
                    value: selectedDay,
                  }}
                  options={days.map((day) => ({
                    label: t(day),
                    value: day,
                  }))}
                />
              </div>
            </div>

            {selectedDay && (
              <div className="min-w-[160px] flex-1 max-w-[240px]">
                <div className="flex flex-col gap-2">
                  <label className="text-[0.85rem] font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t("SuperTeacherAttendancesPage.Select_Section_Schedule")}
                  </label>
                  <SelectWithSearch
                    placeholder={t("common.all") || "الكل"}
                    props={{
                      onChange: (option: any) => handleSelectSectionSchedule(option?.value),
                      value: param?.sectionScheduleId,
                      isDisabled: !selectedDay,
                    }}
                    options={sectionOptions}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => {
                setSelectedDay(null);
                setParam((prev) => ({
                  ...prev,
                  stageId: undefined,
                  classId: undefined,
                  sectionId: undefined,
                  sectionScheduleId: undefined,
                }));
                pushWithCurrentParams("/superTeacherAttendances", {
                  stageId: undefined,
                  classId: undefined,
                  sectionId: undefined,
                  sectionScheduleId: undefined,
                });
              }}
              className="flex items-center justify-center w-10 h-10 bg-[#f8fafc] dark:bg-[#1b2e4b] text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#253b5c] transition-colors border border-gray-200 dark:border-[#1b2e4b]"
              title={t("common.reset") || "إعادة تعيين"}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <>
            {/* List Header */}
            <div className="hidden md:grid grid-cols-[40px_1.5fr_1.5fr_1fr_1fr_1.5fr] gap-4 px-6 py-4 bg-primary/5 dark:bg-primary/10 rounded-xl mb-4 text-primary font-extrabold text-sm items-center text-center">
              <div className="flex items-center justify-center w-[40px]">
                <input
                  type="checkbox"
                  className="form-checkbox w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/50 cursor-pointer transition-all"
                  checked={(data?.data?.length ?? 0) > 0 && selectedRecords.length === (data?.data?.length ?? 0)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRecords(data?.data || []);
                    } else {
                      setSelectedRecords([]);
                    }
                  }}
                />
              </div>
              <div>{t("SuperTeacherAttendancesPage.teacherName")}</div>
              <div>{t("SuperTeacherAttendancesPage.subjectName")}</div>
              <div>{t("SuperTeacherAttendancesPage.stageName")}</div>
              <div>{t("SuperTeacherAttendancesPage.className")}</div>
              <div>{t("SuperTeacherAttendancesPage.date")}</div>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="font-bold text-sm">{t("common.no-data")}</p>
                </div>
              ) : (
                groupedData.map((groupRecords: any, index: number) => {
                  const firstRecord = groupRecords[0];

                  return (
                    <div
                      key={index}
                      onClick={(e) => handleUpdateClick(groupRecords)}
                      className="relative grid grid-cols-1 md:grid-cols-[40px_1.5fr_1.5fr_1fr_1fr_1.5fr] gap-4 items-center px-6 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">

                      {/* Checkbox */}
                      <div className="flex-shrink-0 absolute ltr:left-4 rtl:right-4 top-4 md:relative md:top-auto md:ltr:left-auto md:rtl:right-auto md:w-[40px] md:flex md:justify-center z-10 transition-transform duration-200">
                        <input
                          type="checkbox"
                          className="form-checkbox w-5 h-5 rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition-all duration-200 cursor-pointer"
                          checked={groupRecords.every((r: any) => selectedRecords.some((sr: any) => sr.id === r.id))}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              // add all group records to selected records (preventing duplicates)
                              const newRecords = groupRecords.filter((r: any) => !selectedRecords.some((sr: any) => sr.id === r.id));
                              setSelectedRecords([...selectedRecords, ...newRecords]);
                            } else {
                              // remove all group records from selected records
                              setSelectedRecords(selectedRecords.filter((r: any) => !groupRecords.some((gr: any) => gr.id === r.id)));
                            }
                          }}
                        />
                      </div>

                      {/* Teacher Name */}
                      <div className="flex items-center gap-2.5 justify-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20 shadow-sm hidden md:flex shrink-0">
                          {firstRecord?.SectionSchedule?.teacherSubject?.Teacher?.fullName?.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-800 dark:text-gray-200 font-bold text-center">{firstRecord?.SectionSchedule?.teacherSubject?.Teacher?.fullName}</span>
                      </div>

                      {/* Subject Name */}
                      <div className="text-center">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t(firstRecord?.SectionSchedule?.teacherSubject?.StageSubject?.Subject?.name)}
                        </span>
                      </div>

                      {/* Stage Name */}
                      <div className="flex justify-center flex-col gap-1 items-center">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {firstRecord?.StudentEnrollment?.Section?.Class?.Stage?.name && t(firstRecord.StudentEnrollment.Section.Class.Stage.name)}
                        </span>
                      </div>

                      {/* Class and Section */}
                      <div className="flex justify-center flex-col gap-1 items-center">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {firstRecord?.StudentEnrollment?.Section?.Class?.name} / {firstRecord?.StudentEnrollment?.Section?.name}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="flex justify-center">
                        <FormattedDate2 date={firstRecord?.date} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {(data?.totalCount ?? 0) > 100 &&
              (() => {
                const totalPages = Math.ceil((data?.totalCount ?? 0) / 100);
                const startRecord = (pageNumber - 1) * 100 + 1;
                const endRecord = Math.min(pageNumber * 100, data?.totalCount ?? 0);
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
                        disabled={!data?.data || data.data.length < 100}
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
          </>
        )}
      </div>

      {/* Export Button - Floating */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => {
            exportJsonToExcel({
              data:
                data?.data?.map((item: any) => {
                  return {
                    "اسم المدرس": item.sectionSchedule?.TeacherSubject?.Teacher?.fullName,
                    "المادة": item.sectionSchedule?.TeacherSubject?.StageSubject?.Subject?.name,
                    "المرحلة": item.sectionSchedule?.TeacherSubject?.StageSubject?.Stage?.name,
                    "الصف": item.sectionSchedule?.TeacherSubject?.StageSubject?.Class?.name,
                    "اسم الطالب": item.student?.fullName,
                    "الحالة": t(item.status),
                    "التاريخ": moment(item.date).format("YYYY-MM-DD"),
                  };
                }) ?? [],
              fileName: "attendances",
              sheetName: "Attendances",
            });
          }}
          disabled={!data?.data || data.data.length === 0 || isFetching}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl disabled:cursor-not-allowed transition-all duration-200">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          تصدير Excel
        </button>
      </div>

      {openUpdateModal && selectedStatus && (
        <GroupedUpdateModal
          open={openUpdateModal}
          setOpen={setOpenUpdateModal}
          title={t("SuperTeacherAttendancesPage.update-attendance" as any) || "تحديث الحضور والغياب"}
          records={selectedStatus}
          onSubmit={handleUpdateGroupSubmit}
          isLoading={isLoadingUpdate}
          onDelete={handleRemoveIds}
          isDeleting={isLoadingRemove}
        />
      )}
      <DeleteModel
        description={t("SuperTeacherAttendancesPage.Are-you-sure-you-want-to-delete-this-attendance")}
        title={t("SuperTeacherAttendancesPage.DeleteAttendance")}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={handleRemove}
        isLoading={isLoadingRemove}
        name={`${selectedRecords.length}`}
      />
    </div>
  );
};

export default withRole(TableComponent, "attendance", ["read-any", "read-own"]);
