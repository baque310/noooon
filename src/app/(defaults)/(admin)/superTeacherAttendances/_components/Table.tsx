"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect, useMemo } from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";

import { AddIcons } from "@/components/common/icons/Actions";
import { useSuperTeacherAttendancesGetDataQuery } from "@/services/admin/Super-Teacher-attendances";
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
    take: 30,
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
  });

  const handleSelectClass = (value: any) => {
    if (value) {
      setParam({ ...param, classId: value });
    } else {
      setParam({ ...param, classId: undefined, sectionId: undefined });
    }
  };
  const handleSelectStage = (value: any) => {
    if (value) {
      setParam({ ...param, stageId: value });
    } else {
      setParam({ ...param, stageId: undefined, classId: undefined, sectionId: undefined });
    }
  };
  const handleSelectSection = (value: any) => {
    if (value) {
      setParam({ ...param, sectionScheduleId: value });
    } else {
      setParam({ ...param, sectionScheduleId: undefined });
    }
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
        item.Schedule.timeFrom
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
            {/* Day Selector */}
            <SelectWithSearch
              placeholder={t("SuperTeacherAttendancesPage.Select_Day")}
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

            {/* Section Schedule Selector */}
            {selectedDay && (
              <SelectWithSearch
                placeholder={t("SuperTeacherAttendancesPage.Select_Section_Schedule")}
                props={{
                  onChange: (option: any) => handleSelectSection(option?.value),
                  value: param?.sectionScheduleId,
                  isDisabled: !selectedDay,
                }}
                options={sectionOptions}
              />
            )}

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
                  <button
                    className={` ${
                      props.disabled && "hidden"
                    } flex justify-center gap-1 items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2    rounded border `}
                    onClick={() => {
                      router.push("/superTeacherAttendances/createOrUpdate");
                    }}>
                    <AddIcons className="h-4 w-4" />
                    {t("common.add")}
                  </button>
                );
              }}
              resource={"admin"}
              permission={["create-any", "create-own"]}
            />
          }
        </div>
      </div>
      <div className="flex py-3 gap-3 max-md:flex-col max-md:items-end">
        <SelectFilter
          value={param?.stageId}
          placement="bottom-end"
          title={t("StudentEnrollmentPage.StageName")}
          handleChange={handleSelectStage}
          options={
            StageData?.map((item) => {
              return {
                value: item.id,
                label: t(item.name as any),
              };
            }) ?? []
          }
        />
        {param?.stageId && (
          <SelectFilter
            value={param?.classId}
            title={t("SectionPage.ClassName")}
            placement="bottom-end"
            handleChange={handleSelectClass}
            options={
              StageData?.find((it) => it.id == param?.stageId)?.Class?.map((item) => {
                return {
                  value: item.id,
                  label: t(item.name as any),
                };
              }) ?? []
            }
          />
        )}
        {param?.classId && (
          <SelectFilter
            value={param?.sectionId}
            title={t("StudentEnrollmentPage.SectionName")}
            placement="bottom-end"
            handleChange={handleSelectSection}
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
        )}
      </div>
      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            onRowClick={async (item) => {
              // router.push(`/superTeacherAttendances/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data?.data as any}
            columns={[
              {
                title: t("SuperTeacherAttendancesPage.studentName"),
                accessor: "StudentEnrollment.Student.fullName",
                sortable: true,
              },
              {
                title: t("SuperTeacherAttendancesPage.Status"),
                accessor: "Status",
                sortable: true,
                render: ({ Status }: any) => {
                  const statusColors: Record<string, string> = {
                    Present: "bg-green-50 border-green-200",
                    Absent: "bg-red-50 border-red-200",
                    Vacation: "bg-blue-50 border-blue-200",
                  };
                  return (
                    <div className={`border ${statusColors[Status as keyof typeof statusColors] || "bg-yellow-50 border-yellow-200"} px-2 py-1 rounded-full text-xs font-semibold`}>
                      {t(`SuperTeacherAttendancesPage.${Status}` as any)}
                    </div>
                  );
                },
              },
              {
                title: t("SuperTeacherAttendancesPage.subjectName"),
                accessor: "SectionSchedule.teacherSubject.StageSubject.Subject.name",
                sortable: true,
              },
              {
                title: t("SuperTeacherAttendancesPage.teacherName"),
                accessor: "SectionSchedule.teacherSubject.Teacher.fullName",
                sortable: true,
              },
              {
                title: t("SuperTeacherAttendancesPage.stageName"),
                accessor: "StudentEnrollment.Section.Class.Stage.name",
                sortable: true,
                render: ({ StudentEnrollment }: any) => {
                  return <div>{t(`${StudentEnrollment.Section.Class.Stage.name}` as any)}</div>;
                },
              },
              {
                title: t("SuperTeacherAttendancesPage.className"),
                accessor: "StudentEnrollment.Section.Class.name",
                sortable: true,
              },
              {
                title: t("SuperTeacherAttendancesPage.sectionName"),
                accessor: "StudentEnrollment.Section.name",
                sortable: true,
              },

              {
                title: t("SuperTeacherAttendancesPage.date"),
                accessor: "date",
                sortable: true,
                render: ({ date }: any) => (date ? <div>{moment(date).format("YYYY-MM-DD hh:mm:ss A")}</div> : null),
              },
            ]}
            customLoader={<div className="loader !bg-primary"></div>}
            noRecordsText={t("common.no-data")}
            noRecordsIcon={<></>}
            {...(isFetching && { minHeight: 130 })}
            sortStatus={sortStatus}
            onSortStatusChange={(sort) => {
              setSortStatus(sort);
            }}
            totalRecords={data?.totalCount}
            recordsPerPage={30}
            page={pageNumber}
            onPageChange={(p) => {
              setPageNumber(p);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default withRole(TableComponent, "attendance", ["read-any", "read-own"]);
