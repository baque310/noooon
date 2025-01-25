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
import { useExamResultsGetDataQuery } from "@/services/admin/ExamResults";
import SelectFilter from "@/components/Filter/SelectFilter";
import { useSectionGetDataQuery } from "@/services/admin/section";
import { useStageSubjectGetDataQuery } from "@/services/admin/StageSubject";


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
  const { isFetching: isFetchingSectionData, currentData: SectionData } = useSectionGetDataQuery({})
  const { isFetching: isFetchingStageSubjectData, currentData: StageSubjectData } = useStageSubjectGetDataQuery({

  })
  const { isFetching: isFetchingSchoolYearData, currentData: SchoolYearData } = useSchoolYearGetDataQuery();

  const [param, setParam] = useState<
    | {
      approval_status?: string;
      search?: string;
      range?: string;
      stageSubjectId?: string; 
      sectionId?: string;
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

  const { isFetching: isFetching, currentData: data } = useExamResultsGetDataQuery({
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
      router.push(`/examResult?${allParams.toString()}`);
      setPageNumber(1);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

 
  const handleSelectSection = (value: any) => {
    if (value) {
      setParam({ ...param, sectionId: value });

    } else {
      setParam({ ...param, sectionId: undefined });
    }
  }
 
  const handleSelectSchoolYear = (value: any) => {
    if (value) {
      setParam({ ...param, schoolYearId: value.value });

    } else {
      setParam({ ...param, schoolYearId: undefined });
    }
  }

  const handleSelectStageSubjectId = (value: any) => {
    if (value) {
      setParam({ ...param, stageSubjectId: value.value });

    } else {
      setParam({ ...param, stageSubjectId: undefined, });
    }
  }


  return (
    <div className={`m-4 rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("ExamResultsPage.examResult")}</div>
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
            placeholder={t("ExamResultsPage.SchoolYear")}
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
            placeholder={t("ExamsPage.stageSubject")}
            props={{
              onChange: handleSelectStageSubjectId,
            }}
            options={
              StageSubjectData?.map((item) => {
                return {
                  label: item.Subject.name 
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
              router.push(`/examResult/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data?.data as any}
            columns={[

              {
                title: t("ExamResultsPage.StudentFullName"),
                accessor: "Student.fullName",
                // sortable: true,
              },
              {
                title: t("ExamResultsPage.score"),
                accessor: "score",
                sortable: true,
              },
              {
                title: t("ExamResultsPage.notes"),
                accessor: "notes",
                sortable: true,
              },
              {
                title: t("ExamResultsPage.StageName"),
                accessor: "ExamSection.Exam.StageSubject.Stage.name",
                // sortable: true,
                render: ({ ExamSection }: any) => ExamSection.Exam.StageSubject.Stage.name && t(ExamSection.Exam.StageSubject.Stage.name ?? "" as any)

              },
              {
                title: t("ExamResultsPage.examDate"),
                accessor: "ExamSection.examDate",
                // sortable: true,
                render: ({ ExamSection }: any) => (ExamSection?.examDate ? <div>{moment(ExamSection.examDate).format("YYYY-MM-DD")}</div> : null),

              },
              {
                title: t("ExamResultsPage.SectionName"),
                accessor: "ExamSection.Section.name",
                // sortable: true,
                render: ({ ExamSection }: any) => ExamSection?.Section?.name && t(ExamSection?.Section?.name ?? "" as any)
              },
              {
                title: t("ExamResultsPage.ExamTypeName"),
                accessor: "ExamSection.Exam.ExamType.name",
                // sortable: true,
              },
              {
                title: t("ExamResultsPage.SubjectName"),
                accessor: "ExamSection.Exam.StageSubject.Subject.name",
                // sortable: true,
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

export default withRole(TableComponent, "exam_result", ["read-any", "read-own"]);
