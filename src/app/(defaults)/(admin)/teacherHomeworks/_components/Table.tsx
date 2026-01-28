"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect } from "react";
import moment, { now } from "moment";
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
import { useTeacherHomeworksGetDataQuery, useTeacherHomeworksIsSeenUpdateMutation } from "@/services/admin/teacherHomeworks";
import { AddIcons } from "@/components/common/icons/Actions";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { DatePicker } from "@/components/Filter/DatePicker";
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

  const [pageNumber, setPageNumber] = useState<number>(1);

  const [stageId, setStageId] = useState<string | undefined>();
  const [classId, setClassId] = useState<string | undefined>();
  const [sectionId, setSectionId] = useState<string | undefined>();
  const [schoolYearId, setSchoolYearId] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>("");

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

  // ------------------ SCHOOL YEAR DEFAULT ------------------
  useEffect(() => {
    if (SchoolYearData && Setting) {
      setParam((prev) => ({
        ...prev,
        schoolYearId: Setting?.currentSchoolYearId,
      }));
    }
  }, [SchoolYearData, Setting]);

  // ------------------ API PARAMS (DATE ADDED) ------------------
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

    ...(param?.date && { date: param.date }), // ✅ FIXED
  };

  const { isFetching, currentData: data } = useTeacherHomeworksGetDataQuery(params);
  const [updateIsSeen] = useTeacherHomeworksIsSeenUpdateMutation();

  const { currentData: StageData } = useStageGetDataQuery();

  // ------------------ SEARCH HANDLERS ------------------
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

  // --- NEW: URL parameter helper function (mirrored from second page) ---
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
      // Preserve scroll position by using scroll: false option through replaceState
      window.history.replaceState({ ...window.history.state, scroll: false }, "", newUrl);
    } else {
      router.push(newUrl);
    }
  };

  // ------------------ UPDATED: SELECT HANDLERS WITH URL PERSISTENCE ------------------
  const handleSelectDate = (value: string) => {
    setSelectedDate(value);
    const date = value || undefined;
    setParam((prev) => ({
      ...prev,
      date,
    }));
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
    setParam((prev) => ({
      ...prev,
      teacherSubjectId,
    }));
    pushWithCurrentParams("/teacherHomeworks", { teacherSubjectId });
  };

  const handleSelectSchoolYear = (value: any) => {
    const schoolYearId = value?.value || undefined;
    setSchoolYearId(schoolYearId);
    setParam((prev) => ({
      ...prev,
      schoolYearId,
    }));
    pushWithCurrentParams("/teacherHomeworks", { schoolYearId });
  };

  const handleSelectClass = (value: any) => {
    const classId = value || undefined;
    setClassId(classId);
    setParam((prev) => ({
      ...prev,
      classId,
      sectionId: undefined,
    }));
    pushWithCurrentParams("/teacherHomeworks", {
      classId,
      sectionId: undefined,
    });
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
    pushWithCurrentParams("/teacherHomeworks", {
      stageId,
      classId: undefined,
      sectionId: undefined,
    });
  };

  return (
    <div className="m-4 rtl:transition-[left] ltr:transition-[right] duration-1000">
      <div className="flex justify-between max-md:flex-col gap-2">
        <div className="text-xl uppercase">{t("HomeworksPage.Homeworks")}</div>

        <div className="flex gap-3 max-md:flex-col max-md:items-end">
          <input value={Search} placeholder={`${t("common.search")} ...`} onKeyDown={handleKeyPress} onChange={handleChange} className="form-input text-white-dark" />

          <SelectWithSearch
            placeholder={t("HomeworksPage.SchoolYear")}
            isLoading={!SchoolYearData || isFetchingSetting}
            props={{
              onChange: handleSelectSchoolYear,
              value: param.schoolYearId,
            }}
            options={SchoolYearData?.map((item) => ({
              value: item.id,
              label: `${item.from}-${item.to}`,
            }))}
          />

          <DatePicker value={selectedDate} onChange={handleSelectDate} placeholder={t("SuperTeacherAttendancesPage.Select_Date")} className="min-w-[180px]" />
        </div>
      </div>

      {/* ------------------ STAGE / CLASS / SECTION ------------------ */}
      <div className="flex justify-between items-center mt-2">
        <div className={"flex justify-start max-md:flex-col gap-3 mt-2   "}>
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

                      // label: item.Teacher.fullName,
                      //  + item.StageSubject.Subject.name,
                      value: item.id,
                    };
                  }) ?? []
                }
              />
            </div>
          )}
        </div>

        <RolePageAndActionBasedComponent
          resource={"homework"}
          permission={["create-any", "create-own"]}
          component={(props) => (
            <button
              className={`${props.disabled && "hidden"} flex items-center gap-1 bg-primary text-white py-1 px-2 rounded border`}
              onClick={() => router.push("/teacherHomeworks/createOrUpdate")}>
              <AddIcons className="h-4 w-4" />
              {t("common.add")}
            </button>
          )}
        />
      </div>

      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data?.data as any}
            onRowClick={(item) => {
              updateIsSeen({ id: item.record.id as string, status: "TRUE" });
              router.push(`/teacherHomeworks/${item.record.id}`);
            }}
            columns={[
              {
                title: t("HomeworksPage.teacherFullName"),
                accessor: "teacherSubject.Teacher.fullName",
                sortable: true,
              },
              {
                title: t("HomeworksPage.SubjectName"),
                accessor: "teacherSubject.StageSubject.Subject.name",
                // sortable: true,
                render: ({ teacherSubject }: any) => teacherSubject.StageSubject.Subject.name && t(teacherSubject.StageSubject.Subject.name ?? ("" as any)),
              },
              {
                title: t("HomeworksPage.title"),
                accessor: "title",
                sortable: true,
              },
              {
                title: t("HomeworksPage.content"),
                accessor: "content",
                sortable: true,
                render: ({ content }: any) => (
                  <div className="max-w-xs truncate" title={content}>
                    {content}
                  </div>
                ),
              },
              {
                title: t("HomeworksPage.dueDate"),
                accessor: "dueDate",
                sortable: true,
                render: ({ dueDate }: any) => (dueDate ? <div>{moment(dueDate).format("YYYY-MM-DD ")}</div> : null),
              },
              {
                title: t("HomeworksPage.StageName"),
                accessor: "teacherSubject.StageSubject.Stage.name",
                // sortable: true,
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
                title: t("HomeworksPage.SectionName"),
                accessor: "StudentHomework",
                render: ({ StudentHomework }) => {
                  const list = Array.isArray(StudentHomework) ? StudentHomework : [];
                  const sections = Array.from(new Set(list.map((item: any) => item?.Student?.StudentEnrollment?.[0]?.Section?.name).filter(Boolean)));
                  return sections.length > 0 ? sections.join(", ") : "-";
                },
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
              if (record.isSeen === "FALSE" && moment(record?.createdAt || "").isSameOrAfter(moment().subtract(2, "days").startOf("day"))) {
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

export default withRole(TableComponent, "homework", ["read-any", "read-own"]);
