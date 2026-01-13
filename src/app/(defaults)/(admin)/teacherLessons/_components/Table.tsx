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
import { useTeacherLessonsGetDataQuery, useTeacherLessonsIsSeenUpdateMutation } from "@/services/admin/teacherLessons";
import { AddIcons } from "@/components/common/icons/Actions";
import FormattedDate from "@/components/common/FormattedDate";
import { useStageGetDataQuery } from "@/services/admin/stage";

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
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [stageId, setStageId] = useState<string | undefined>();
  const [classId, setClassId] = useState<string | undefined>();
  const [sectionId, setSectionId] = useState<string | undefined>();
  const [schoolYearId, setSchoolYearId] = useState<string | undefined>();

  const [param, setParam] = useState<{
    search?: string;
    range?: string;
    schoolYearId?: string;
    teacherSubjectId?: string;
    sectionId?: string;
    classId?: string;
    stageId?: string;
  }>({});

  const { isFetching: isFetchingSectionData, currentData: SectionData } = useSectionGetDataQuery({});
  const { currentData: TeacherSubjectData } = useTeacherSubjectGetDataQuery({
    stageId,
    classId,
    schoolYearId: schoolYearId || Setting?.currentSchoolYearId || "",
    sectionId,
  });
  const { isFetching: isFetchingSchoolYearData, currentData: SchoolYearData } = useSchoolYearGetDataQuery();

  const { currentData: StageData } = useStageGetDataQuery();

  useEffect(() => {
    if (SchoolYearData && Setting) {
      setParam((prev) => ({
        ...prev,
        schoolYearId: Setting?.currentSchoolYearId,
      }));
    }
  }, [SchoolYearData, Setting]);

  const params = {
    skip: pageNumber,
    take: 30,
    sortBy: sortStatus.columnAccessor,
    sortDirection: sortStatus.direction,
    ...(search && { search }),
    range: param.range,
    schoolYearId: param.schoolYearId,
    teacherSubjectId: param.teacherSubjectId,
    sectionId: param.sectionId,
  };

  const { isFetching, currentData: data } = useTeacherLessonsGetDataQuery(params);
  const [updateIsSeen] = useTeacherLessonsIsSeenUpdateMutation();

  const [Search, setSearch] = useState(search);
  const handleChange = (e: any) => {
    const value = e.target.value;
    setSearch(value);
    if (value === "") {
      handleSearch(value);
    }
  };
  const allParams = new URLSearchParams(searchParams);
  const handleSearch = (value?: string) => {
    if (search !== Search) {
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

  const handleSelectStage = (value: any) => {
    const stageId = value || undefined;
    setStageId(stageId);
    setParam((prev) => ({
      ...prev,
      stageId,
      classId: undefined,
      sectionId: undefined,
    }));
  };

  const handleSelectClass = (value: any) => {
    const classId = value || undefined;
    setClassId(classId);
    setParam((prev) => ({
      ...prev,
      classId,
      sectionId: undefined,
    }));
  };

  const handleSelectSection = (value: any) => {
    setSectionId(value || undefined);
    setParam((prev) => ({ ...prev, sectionId: value || undefined }));
  };

  const handleSelectTeacherSubject = (value: any) => {
    setParam((prev) => ({
      ...prev,
      teacherSubjectId: value?.value || undefined,
    }));
  };

  const handleSelectSchoolYear = (value: any) => {
    setSchoolYearId(value?.value || undefined);
    setParam((prev) => ({
      ...prev,
      schoolYearId: value?.value || undefined,
    }));
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
          {param?.sectionId && (
            <div className="max-w-36">
              <SelectWithSearch
                placeholder={t("HomeworksPage.teacherFullName")}
                props={{
                  onChange: handleSelectTeacherSubject,
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
          )}
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
            onRowClick={(item) => {
              updateIsSeen({ id: item.record.id as string, status: "TRUE" });
              router.push(`/teacherLessons/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data?.data as any}
            columns={[
              {
                title: t("LessonsPage.teacherFullName"),
                accessor: "teacherSubject.Teacher.fullName",
                sortable: true,
              },
              {
                title: t("LessonsPage.SubjectName"),
                accessor: "teacherSubject.StageSubject.Subject.name",
                render: ({ teacherSubject }: any) => teacherSubject.StageSubject.Subject.name && t(teacherSubject.StageSubject.Subject.name ?? ("" as any)),
              },
              {
                title: t("LessonsPage.title"),
                accessor: "title",
                sortable: true,
              },
              {
                title: t("LessonsPage.content"),
                accessor: "content",
                sortable: true,
                render: ({ content }: any) => (
                  <div className="max-w-xs truncate" title={content}>
                    {content}
                  </div>
                ),
              },
              {
                title: t("LessonsPage.StageName"),
                accessor: "teacherSubject.StageSubject.Stage.name",
                render: ({ teacherSubject }: any) => teacherSubject.StageSubject.Stage.name && t(teacherSubject.StageSubject.Stage.name ?? ("" as any)),
              },
              {
                title: t("HomeworksPage.ClassName"),
                accessor: "teacherSubject.StageSubject.Class.name",
                render: ({ teacherSubject }: any) => {
                  const name = teacherSubject?.StageSubject?.Class?.name;
                  return name ? t(name as any) : "-";
                },
              },
              {
                title: t("LessonsPage.SectionName"),
                accessor: "teacherSubject.Section.name",
                render: ({ teacherSubject }: any) => {
                  const name = teacherSubject?.Section?.name;
                  return name ? t(name as any) : "-";
                },
              },
              {
                title: t("LessonsPage.SchoolYear"),
                accessor: "SchoolYear.from",
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
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            totalRecords={data?.totalCount}
            rowClassName={(record) => {
              const baseClasses = "transition-colors duration-200 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0";
              if (record.isSeen === "FALSE") {
                return `${baseClasses} !bg-yellow-50 dark:bg-yellow-900/20 hover:!bg-yellow-100 dark:hover:bg-yellow-900/30`;
              }

              return `${baseClasses} hover:bg-gray-50 dark:hover:bg-gray-700/50`;
            }}
            recordsPerPage={30}
            page={pageNumber}
            onPageChange={(p) => setPageNumber(p)}
          />
        )}
      </div>
    </div>
  );
};

export default withRole(TableComponent, "lesson", ["read-any", "read-own"]);
