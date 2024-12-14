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
import { useLessonsGetDataQuery } from "@/services/admin/Lessons";


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
  const { isFetching: isFetchingStageData, currentData: StageData } = useStageGetDataQuery();
  const { isFetching: isFetchingSchoolYearData, currentData: SchoolYearData } = useSchoolYearGetDataQuery();

  const [param, setParam] = useState<
    | {
      approval_status?: string;
      search?: string;
      range?: string;
      classId?: string;
      sectionId?: string;
      stageId?: string;
      schoolYearId?: string;

    }
    | undefined
  >();
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
    ...param,
  };

  const { isFetching: isFetching, currentData: data } = useLessonsGetDataQuery({
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
      router.push(`/lesson?${allParams.toString()}`);
      setPageNumber(1);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

  const handleSelectClass = (value: any) => {
    if (value) {
      setParam({ ...param, classId: value.value });

    } else {
      setParam({ ...param, classId: undefined, sectionId: undefined });

    }
  }
  const handleSelectSection = (value: any) => {
    if (value) {
      setParam({ ...param, sectionId: value.value });

    } else {
      setParam({ ...param, sectionId: undefined });
    }
  }
  const handleSelectStage = (value: any) => {
    if (value) {
      setParam({ ...param, stageId: value.value });

    } else {
      setParam({ ...param, stageId: undefined, classId: undefined, sectionId: undefined });
    }
  }
  const handleSelectSchoolYear = (value: any) => {
    if (value) {
      setParam({ ...param, schoolYearId: value.value });

    } else {
      setParam({ ...param, schoolYearId: undefined });
    }
  }


  return (
    <div className={`m-4 rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("LessonsPage.lessons")}</div>
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
            placeholder={t("LessonsPage.SchoolYear")}
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
      {/* <div className={"flex justify-start max-md:flex-col gap-3 mt-2   "}>

        <SelectWithSearch
          placeholder={t("LessonsPage.StageName")}
          isLoading={isFetchingStageData}
          props={{
            onChange: handleSelectStage
          }}
          options={StageData?.map((item) => {
            return {
              value: item.id,
              label: t(item.name as any),
            };
          })}
        />
        {param?.stageId &&
          <SelectWithSearch
            placeholder={t("SectionPage.ClassName")}

            props={{
              onChange: handleSelectClass
            }}
            options={StageData?.find(it => it.id == param?.stageId)?.Class?.map((item) => {
              return {
                value: item.id,
                label: t(item.name as any),
              };
            })}
          />

        }

        {param?.classId && <SelectWithSearch
          placeholder={t("LessonsPage.SectionName")}
          props={{
            onChange: handleSelectSection
          }}
          options={StageData?.find(it => it.id == param?.stageId)?.Class.find(it => it.id == param?.classId)?.Section?.map((item) => {
            return {
              value: item.id,
              label: t(item.name as any),
            };
          })}
        />}
      </div> */}
      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            onRowClick={async (item) => {
              router.push(`/lesson/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base `}
            records={data?.data as any}
            columns={[

              {
                title: t("LessonsPage.title"),
                accessor: "title",
                sortable: true,
              },
              {
                title: t("LessonsPage.content"),
                accessor: "content",
                sortable: true,
              },
              {
                title: t("LessonsPage.teacherFullName"),
                accessor: "teacherSubject.Teacher.fullName",
                sortable: true,
              },
              {
                title: t("LessonsPage.StageName"),
                accessor: "teacherSubject.StageSubject.Stage.name",
                // sortable: true,
                render: ({ teacherSubject }: any) => teacherSubject.StageSubject.Stage.name && t(teacherSubject.StageSubject.Stage.name ?? "" as any)

              },
              {
                title: t("LessonsPage.SubjectName"),
                accessor: "teacherSubject.StageSubject.Subject.name",
                // sortable: true,
                render: ({ teacherSubject }: any) => teacherSubject.StageSubject.Subject.name && t(teacherSubject.StageSubject.Subject.name ?? "" as any)

              },
              {
                title: t("LessonsPage.SectionName"),
                accessor: "Section.name",
                // sortable: true,
                render: ({ Section }: any) => Section?.name && t(Section?.name ?? "" as any)
              }, 
              {
                title: t("LessonsPage.SchoolYear"),
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

export default withRole(TableComponent, "lesson", ["read-any", "read-own"]);
