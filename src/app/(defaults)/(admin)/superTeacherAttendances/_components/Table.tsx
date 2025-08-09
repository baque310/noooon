"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect } from "react";

import moment from "moment";
import {
  RolePageAndActionBasedComponent,
  withRole,
} from "@/components/Provider/RolePageAndActionBasedComponent";
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

const TableComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const isDark =
    useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
  const { isMounted } = useMounted();

  const [pageNumber, setPageNumber] = useState(Number(1));

  const [param, setParam] = useState<
    | {
        sectionScheduleId?: string;
        search?: string;
        schoolYearId?: string;
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
  };

  const { isFetching, currentData: data } =
    useSuperTeacherAttendancesGetDataQuery({
      ...params,
    });

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

  const { isFetching: isFetchingSchoolYearData, currentData: SchoolYearData } =
    useSchoolYearGetDataQuery();
  const { currentData: Setting, isFetching: isFetchingSetting } =
    useSettingGetDataQuery();

  useEffect(() => {
    if (SchoolYearData) {
      setParam({
        ...param,
        schoolYearId: Setting?.CurrentSchoolYear.id,
      });
    }
  }, [SchoolYearData, Setting]);

  const {
    isFetching: isFetchingSectionSchedule,
    currentData: SectionScheduleData,
  } = useSectionScheduleGetDataQuery({
    schoolYearId: param?.schoolYearId,
  });

  const handleSelectSection = (value: any) => {
    if (value) {
      setParam({ ...param, sectionScheduleId: value });
    } else {
      setParam({ ...param, sectionScheduleId: undefined });
    }
  };

  return (
    <div
      className={`m-4    rtl:transition-[left] ltr:transition-[right] duration-1000`}
    >
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">
          {t("SuperTeacherAttendancesPage.superTeacherAttendances")}
        </div>
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
                    }}
                  >
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
      {/* <div className={"flex justify-start max-md:flex-col gap-3 mt-2   "}>
        <SelectFilter
          value={param?.sectionScheduleId}
          title={t("StudentEnrollmentPage.SectionName")}
          placement="bottom-end"
          handleChange={handleSelectSection}
          options={
            SectionScheduleData?.data["SUNDAY"]?.map((item) => {
              return {
                value: item.id,
                label: t(item.teacherSubject.StageSubject.Subject.name as any),
              };
            }) ?? []
          }
        />
      </div> */}
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
                    <div
                      className={`border ${
                        statusColors[Status as keyof typeof statusColors] ||
                        "bg-yellow-50 border-yellow-200"
                      } px-2 py-1 rounded-full text-xs font-semibold`}
                    >
                      {t(`SuperTeacherAttendancesPage.${Status}` as any)}
                    </div>
                  );
                },
              },
              {
                title: t("SuperTeacherAttendancesPage.subjectName"),
                accessor:
                  "SectionSchedule.teacherSubject.StageSubject.Subject.name",
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
                  return (
                    <div>
                      {t(
                        `${StudentEnrollment.Section.Class.Stage.name}` as any
                      )}
                    </div>
                  );
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
                render: ({ date }: any) =>
                  date ? (
                    <div>{moment(date).format("YYYY-MM-DD hh:mm:ss A")}</div>
                  ) : null,
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
