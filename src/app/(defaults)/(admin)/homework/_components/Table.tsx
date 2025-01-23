"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect } from "react";

import moment from "moment";
import { withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { SelectWithSearch } from "@/components/Filter/SelectSearch";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import { useSettingGetDataQuery } from "@/services/Setting";
import { useHomeworksGetDataQuery } from "@/services/admin/Homeworks";
import SelectFilter from "@/components/Filter/SelectFilter";
import { useSectionGetDataQuery } from "@/services/admin/section";
import { useTeacherSubjectGetDataQuery } from "@/services/admin/TeacherSubject";


const TableComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });
  const [selectedRecords, setSelectedRecords] = useState([]);
  const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
  const { isMounted } = useMounted();
  const { currentData: Setting, isFetching: isFetchingSetting } = useSettingGetDataQuery();
  const [pageNumber, setPageNumber] = useState(Number(1));
  const [param, setParam] = useState<
    | {
      search?: string;
      range?: string;
      sectionId?: string;
      schoolYearId?: string;
      teacherSubjectId?: string;
    }
    | undefined
  >();
  const { isFetching: isFetchingSectionData, currentData: SectionData } = useSectionGetDataQuery({
  });
  const { isFetching: isFetchingTeacherSubjectData, currentData: TeacherSubjectData } = useTeacherSubjectGetDataQuery({
    // sectionId  :param.sectionId,
    schoolYearId: param?.schoolYearId

  });
  const { isFetching: isFetchingSchoolYearData, currentData: SchoolYearData } = useSchoolYearGetDataQuery();


  useEffect(() => {
    if (SchoolYearData && Setting) {
      setParam(
        {
          ...params,
          schoolYearId: Setting?.currentSchoolYearId

        }
      )
    }
  }, [SchoolYearData, Setting])

  const params = {
    skip: pageNumber,
    take: 30,
    sortBy: sortStatus.columnAccessor,
    sortDirection: sortStatus.direction,
    ...(search && { search: search as string }),
    ...param
  };

  const { isFetching: isFetching, currentData: data } = useHomeworksGetDataQuery({
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
      router.push(`/homework?${allParams.toString()}`);
      setPageNumber(1);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
 

  const handleSelectSection = (value: any) => {
    if (value) {
      setParam({ ...param, sectionId: value });

    } else {
      setParam({ ...param, sectionId: undefined });
    }
  }
  const handleSelectTeacherSubject = (value: any) => {
    if (value) {
      setParam({ ...param, teacherSubjectId: value.value });

    } else {
      setParam({ ...param, teacherSubjectId: undefined });
    }
  }
  const handleSelectSchoolYear = (value: any) => {
    if (value) {
      setParam({ ...param, schoolYearId: value });

    } else {
      setParam({ ...param, schoolYearId: undefined });
    }
  }


  return (
    <div className={`m-4 rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("HomeworksPage.Homeworks")}</div>
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

          <SelectWithSearch
            placeholder={t("HomeworksPage.SchoolYear")}
            isLoading={isFetchingSchoolYearData || isFetchingSetting}
            props={{
              onChange: handleSelectSchoolYear,
              value: param?.schoolYearId
            }}
            options={SchoolYearData?.map((item) => {
              return {
                value: item.id,
                label: item.from + '-' + item.to
              };
            })}
          />

        </div>
      </div>
      <div className={"flex justify-start max-md:flex-col gap-3 mt-2   "}>
        <SelectFilter
          title={t("StudentEnrollmentPage.SectionName")}
          placement="bottom-end"
          handleChange={handleSelectSection}
          options={
            SectionData?.map((item) => {
              return {
                label: t(item.name as any),
                value: item.id,
              };
            }
            ) ?? []
          }
        />
        <div className="max-w-36">
          <SelectWithSearch
            placeholder={t("HomeworksPage.teacherFullName")}
            props={{
              onChange: handleSelectTeacherSubject,
            }}
            options={
              TeacherSubjectData?.map((item) => {
                return {
                  label: item.Teacher.fullName 
                  //  + item.StageSubject.Subject.name,
                  ,
                  value: item.id,
                };
              }
              ) ?? []
            }
          />
        </div>


      </div>

      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            onRowClick={async (item) => {
              router.push(`/homework/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base  border border-dark-dark-light`}
            records={data?.data as any}
            columns={[

              {
                title: t("HomeworksPage.title"),
                accessor: "title",
                sortable: true,
              },
              {
                title: t("HomeworksPage.content"),
                accessor: "content",
                sortable: true,
              },
              {
                title: t("HomeworksPage.dueDate"),
                accessor: "dueDate",
                sortable: true,
                render: ({ dueDate }: any) => (dueDate ? <div>{moment(dueDate).format("YYYY-MM-DD ")}</div> : null),
              },
              {
                title: t("HomeworksPage.teacherFullName"),
                accessor: "teacherSubject.Teacher.fullName",
                sortable: true,
              },
              {
                title: t("HomeworksPage.StageName"),
                accessor: "teacherSubject.StageSubject.Stage.name",
                // sortable: true,
                render: ({ teacherSubject }: any) => teacherSubject.StageSubject.Stage.name && t(teacherSubject.StageSubject.Stage.name ?? "" as any)

              },
              {
                title: t("HomeworksPage.SubjectName"),
                accessor: "teacherSubject.StageSubject.Subject.name",
                // sortable: true,
                render: ({ teacherSubject }: any) => teacherSubject.StageSubject.Subject.name && t(teacherSubject.StageSubject.Subject.name ?? "" as any)

              },
              {
                title: t("HomeworksPage.SectionName"),
                accessor: "Section.name",
                // sortable: true,
                render: ({ Section }: any) => Section?.name && t(Section?.name ?? "" as any)
              },
              {
                title: t("HomeworksPage.SchoolYear"),
                accessor: "SchoolYear.from",
                // sortable: true,
                render: ({ SchoolYear }: any) => (SchoolYear.from || SchoolYear.to ? SchoolYear.from + " - " + SchoolYear.to : null),

              },

              {
                title: t("common.updatedAt"),
                accessor: "updatedAt",
                sortable: true,
                render: ({ updatedAt }: any) => (updatedAt ? <div>{moment(updatedAt).format("YYYY-MM-DD hh:mm:ss A")}</div> : null),
              },
              {
                title: t("common.createdAt"),
                accessor: "createdAt",
                sortable: true,
                render: ({ createdAt }: any) => (createdAt ? <div>{moment(createdAt).format("YYYY-MM-DD hh:mm:ss A")}</div> : null),
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

export default withRole(TableComponent, "homework", ["read-any", "read-own"]);
