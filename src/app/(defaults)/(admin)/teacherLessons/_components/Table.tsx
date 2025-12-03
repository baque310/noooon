"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect } from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { SelectWithSearch } from "@/components/Filter/SelectSearch";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import { useSettingGetDataQuery } from "@/services/Setting";
import SelectFilter from "@/components/Filter/SelectFilter";
import { useSectionGetDataQuery } from "@/services/admin/section";
import { useTeacherSubjectGetDataQuery } from "@/services/admin/TeacherSubject";
import { useTeacherLessonsGetDataQuery } from "@/services/admin/teacherLessons";
import { AddIcons } from "@/components/common/icons/Actions";
import FormattedDate from "@/components/common/FormattedDate";

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
  const { isFetching: isFetchingSectionData, currentData: SectionData } = useSectionGetDataQuery({});
  const { isFetching: isFetchingTeacherSubjectData, currentData: TeacherSubjectData } = useTeacherSubjectGetDataQuery({
    // sectionId  :param.sectionId,
    schoolYearId: param?.schoolYearId,
  });
  const { isFetching: isFetchingSchoolYearData, currentData: SchoolYearData } = useSchoolYearGetDataQuery();

  useEffect(() => {
    if (SchoolYearData && Setting) {
      setParam({
        ...params,
        schoolYearId: Setting?.currentSchoolYearId,
      });
    }
  }, [SchoolYearData, Setting]);

  const params = {
    skip: pageNumber,
    take: 30,
    sortBy: sortStatus.columnAccessor,
    sortDirection: sortStatus.direction,
    ...(search && { search: search as string }),
    ...param,
  };

  const { isFetching: isFetching, currentData: data } = useTeacherLessonsGetDataQuery({
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
      router.push(`/teacherLessons?${allParams.toString()}`);
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
  };
  const handleSelectTeacherSubject = (value: any) => {
    if (value) {
      setParam({ ...param, teacherSubjectId: value.value });
    } else {
      setParam({ ...param, teacherSubjectId: undefined });
    }
  };
  const handleSelectSchoolYear = (value: any) => {
    if (value) {
      setParam({ ...param, schoolYearId: value });
    } else {
      setParam({ ...param, schoolYearId: undefined });
    }
  };

  return (
    <div className={`m-4 rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("TeacherLessonsPage.Lessons")}</div>
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
              value: param?.schoolYearId,
            }}
            options={SchoolYearData?.map((item) => {
              return {
                value: item.id,
                label: item.from + "-" + item.to,
              };
            })}
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className={"flex justify-start max-md:flex-col gap-3 mt-2"}>
          <SelectFilter
            title={t("StudentEnrollmentPage.SectionName")}
            placement="bottom-end"
            handleChange={handleSelectSection}
            options={
              SectionData?.map((item) => {
                return {
                  label: item.name + " - " + (item?.Class?.name ?? "") + " - " + (item?.Class?.Stage?.name ?? ""),
                  value: item.id,
                };
              }) ?? []
            }
          />
          <div className="max-w-36">
            <SelectWithSearch
              placeholder={t("LessonsPage.teacherFullName")}
              props={{
                onChange: handleSelectTeacherSubject,
              }}
              options={
                TeacherSubjectData?.map((item) => {
                  return {
                    label: item.Teacher.fullName,
                    //  + item.StageSubject.Subject.name,
                    value: item.id,
                  };
                }) ?? []
              }
            />
          </div>
        </div>
        {
          <RolePageAndActionBasedComponent
            component={(props) => {
              return (
                <button
                  className={` ${
                    props.disabled && "hidden"
                  } flex justify-center gap-1 items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2    rounded border `}
                  onClick={() => {
                    router.push("/teacherLessons/createOrUpdate");
                  }}>
                  <AddIcons className="h-4 w-4" />
                  {t("common.add")}
                </button>
              );
            }}
            resource={"lesson"}
            permission={["create-any", "create-own"]}
          />
        }
      </div>
      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            onRowClick={async (item) => {
              router.push(`/teacherLessons/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
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
                render: ({ teacherSubject }: any) => teacherSubject.StageSubject.Stage.name && t(teacherSubject.StageSubject.Stage.name ?? ("" as any)),
              },
              {
                title: t("LessonsPage.SubjectName"),
                accessor: "teacherSubject.StageSubject.Subject.name",
                // sortable: true,
                render: ({ teacherSubject }: any) => teacherSubject.StageSubject.Subject.name && t(teacherSubject.StageSubject.Subject.name ?? ("" as any)),
              },
              {
                title: t("LessonsPage.SectionName"),
                accessor: "Section.name",
                // sortable: true,
                render: ({ Section }: any) => Section?.name && t(Section?.name ?? ("" as any)),
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
                render: (row: any) => (
                  <div className="text-center">
                    <div className="mb-1 text-xs text-gray-500">{t("common.updatedAt")}</div>
                    <FormattedDate date={row.updatedAt} />
                  </div>
                ),
              },
              {
                title: t("common.createdAt"),
                accessor: "createdAt",
                render: (row: any) => (
                  <div className="text-center">
                    <div className="mb-1 text-xs text-gray-500">{t("common.createdAt")}</div>
                    <FormattedDate date={row.createdAt} />
                  </div>
                ),
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
