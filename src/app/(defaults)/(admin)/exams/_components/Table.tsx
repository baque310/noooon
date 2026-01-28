"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect } from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { IExams, useExamsGetDataQuery } from "@/services/admin/Exams";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";

import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import { SelectWithSearch } from "@/components/Filter/SelectSearch";
import { useSettingGetDataQuery } from "@/services/Setting";
import RowSectionTable from "./RowSectionTable";
import SelectFilter from "@/components/Filter/SelectFilter";
import { useSectionGetDataQuery } from "@/services/admin/section";
import { useStageSubjectGetDataQuery } from "@/services/admin/StageSubject";
import { useStageGetDataQuery } from "@/services/admin/stage";
import FormattedDate from "@/components/common/FormattedDate";

const TableComponent = () => {
  const { t } = getTranslation();
  const [open, setOpen] = useState(false);
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
  const { isFetching: isFetchingSectionData, currentData: SectionData } = useSectionGetDataQuery({});
  const [stateId, setStageId] = useState("");
  const [classId, setClassId] = useState("");
  const { isFetching: isFetchingStageData, currentData: StageData } = useStageGetDataQuery();

  const { isFetching: isFetchingSchoolYearData, currentData: SchoolYearData } = useSchoolYearGetDataQuery();

  const [param, setParam] = useState<
    | {
        search?: string;
        range?: string;
        sectionId?: string;
        stageSubjectId?: string;
        schoolYearId?: string;
        classId?: string;
        stageId?: string;
      }
    | undefined
  >();

  // --- NEW: Initialize filters from URL on mount ---
  useEffect(() => {
    const urlStageId = searchParams.get("stageId");
    const urlClassId = searchParams.get("classId");
    const urlSectionId = searchParams.get("sectionId");
    const urlStageSubjectId = searchParams.get("stageSubjectId");
    const urlSchoolYearId = searchParams.get("schoolYearId");

    if (urlStageId) setStageId(urlStageId);
    if (urlClassId) setClassId(urlClassId);

    setParam((prev) => ({
      ...(prev ?? {}),
      ...(urlStageId && { stageId: urlStageId }),
      ...(urlClassId && { classId: urlClassId }),
      ...(urlSectionId && { sectionId: urlSectionId }),
      ...(urlStageSubjectId && { stageSubjectId: urlStageSubjectId }),
      ...(urlSchoolYearId && { schoolYearId: urlSchoolYearId }),
    }));
  }, []);

  useEffect(() => {
    if (SchoolYearData && Setting && !searchParams.get("schoolYearId")) {
      setParam((prev) => ({
        ...(prev ?? {}),
        schoolYearId: Setting?.currentSchoolYearId,
      }));
    }
  }, [SchoolYearData, Setting]);

  const params = {
    skip: pageNumber,
    take: 30,
    sortBy: sortStatus.columnAccessor,
    sortDirection: sortStatus.direction,
    ...(search && { search: search as string }),
    ...(param?.sectionId && { sectionId: param?.sectionId }),
    ...(param?.stageSubjectId && { stageSubjectId: param?.stageSubjectId }),
  };

  const { isFetching: isFetchingStageSubjectData, currentData: StageSubjectData } = useStageSubjectGetDataQuery({
    classId: classId,
  });

  const { isFetching: isFetching, currentData: data } = useExamsGetDataQuery({
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
      router.push(`/exams?${allParams.toString()}`);
      setPageNumber(1);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // --- URL parameter helper function ---
  const pushWithCurrentParams = (path = "/exams", extra: Record<string, any> = {}) => {
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

  // --- Filter handlers ---
  const handleSelectStageSubjectId = (value: any) => {
    const stageSubjectId = value ? value.value : undefined;
    setParam((old) => ({ ...(old ?? {}), stageSubjectId }));
    pushWithCurrentParams("/exams", { stageSubjectId });
  };

  const handleSelectSchoolYear = (value: any) => {
    const schoolYearId = value ? value.value : undefined;
    setParam((old) => ({ ...(old ?? {}), schoolYearId }));
    pushWithCurrentParams("/exams", { schoolYearId });
  };

  const handleSelectClass = (value: any) => {
    setClassId(value ?? "");
    const classId = value ?? undefined;
    setParam((old) => ({ ...(old ?? {}), classId, sectionId: undefined }));
    pushWithCurrentParams("/exams", {
      classId,
      sectionId: undefined,
    });
  };

  const handleSelectSection = (value: any) => {
    const sectionId = value ?? undefined;
    setParam((old) => ({ ...(old ?? {}), sectionId }));
    pushWithCurrentParams("/exams", { sectionId });
  };

  const handleSelectStage = (value: any) => {
    setStageId(value ?? "");
    const stageId = value ?? undefined;
    setParam((old) => ({
      ...(old ?? {}),
      stageId,
      classId: undefined,
      sectionId: undefined,
    }));
    pushWithCurrentParams("/exams", {
      stageId,
      classId: undefined,
      sectionId: undefined,
    });
  };

  console.log(data);

  return (
    <div className={`m-4 rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("ExamsPage.exam")}</div>
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
            placeholder={t("ExamsPage.SchoolYear")}
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
          {
            <RolePageAndActionBasedComponent
              component={(props) => {
                return (
                  <button
                    className={` ${
                      props.disabled && "hidden"
                    } flex justify-center gap-1  items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2  rounded border `}
                    onClick={() => {
                      router.push("/exams/createOrUpdate");
                    }}>
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
        {param?.classId && (
          <div className="max-w-36">
            <SelectWithSearch
              placeholder={t("ExamsPage.stageSubject")}
              props={{
                onChange: handleSelectStageSubjectId,
                value: param?.stageSubjectId,
              }}
              options={
                StageSubjectData?.map((item) => {
                  return {
                    label: item.Subject.name,
                    value: item.id,
                  };
                }) ?? []
              }
            />
          </div>
        )}
      </div>
      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            // onRowClick={async (item) => {
            //   router.push(`/exams/${item.record.id}`);
            // }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data?.data as any}
            columns={[
              {
                title: t("HomeworksPage.teacherFullName"),
                accessor: "StageSubject.TeacherSubject",
                sortable: true,
                render: (record: any) => {
                  const matchingTeacher = record.StageSubject?.TeacherSubject?.find((item: any) => item.sectionId === record.ExamSection[0]?.Section?.id);
                  return matchingTeacher?.Teacher?.fullName || "";
                },
              },
              {
                title: t("ExamsPage.stageSubject"),
                accessor: "StageSubject.Subject.name",
                // render: (record: any) => {
                //   console.log(record);

                //   const label =
                //     record.subSubject && typeof record.subSubject === "object" && "name" in record.subSubject ? record.subSubject.name : record.StageSubject?.Subject?.name ?? "";
                //   return (
                //     <div className="max-w-xs truncate" title={label}>
                //       {label}
                //     </div>
                //   );
                // },
              },
              {
                title: t("ExamsPage.subSubject"),
                accessor: "subSubject.name",
              },
              {
                title: t("ExamsPage.content"),
                accessor: "content",
                sortable: true,
                render: ({ content }: any) => (
                  <div className="max-w-xs truncate" title={content}>
                    {content}
                  </div>
                ),
              },
              {
                title: t("ExamsPage.examTypName"),
                accessor: "ExamType",
                render: ({ ExamType }: any) => ExamType?.name ?? "",
              },
              {
                title: t("StagePage.name"),
                accessor: "StageSubject.Stage.name",
                render: ({ StageSubject }: any) => StageSubject?.Stage?.name && t(StageSubject?.Stage?.name ?? ""),
              },
              {
                title: t("ClassPage.name"),
                accessor: "StageSubject.Class.name",
                render: ({ StageSubject }: any) => StageSubject?.Stage?.name && t(StageSubject?.Class?.name ?? ""),
              },
              {
                title: t("SectionPage.name"),
                accessor: "ExamSection[0]?.Section?.name",
                render: ({ ExamSection }: any) => ExamSection[0]?.Section?.name && t(ExamSection[0]?.Section?.name ?? ""),
              },
              {
                title: t("TeacherSubjectPage.SchoolYear"),
                accessor: "SchoolYear",
                render: ({ SchoolYear }: any) => SchoolYear.from + " - " + SchoolYear.to,
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
            rowExpansion={{
              collapseProps: {
                transitionDuration: 500,
                animateOpacity: false,
                transitionTimingFunction: "ease-out",
              },
              content: (record) => {
                console.log(record.record, "content");
                return (
                  <>
                    <RowSectionTable data={record.record.ExamSection as any} id={record.record.id as any} />
                  </>
                );
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default withRole(TableComponent, "exam", ["read-any", "read-own"]);
