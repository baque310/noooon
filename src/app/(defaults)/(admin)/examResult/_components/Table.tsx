"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect } from "react";

import moment from "moment";
import { withRole, RolePageAndActionBasedComponent } from "@/components/Provider/RolePageAndActionBasedComponent";
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
import { useExamResultsGetDataQuery, useLazyExamResultsGetDataByIdQuery, useExamResultsUpdateMutation } from "@/services/admin/ExamResults";
import SelectFilter from "@/components/Filter/SelectFilter";
import { useSectionGetDataQuery } from "@/services/admin/section";
import { useStageSubjectGetDataQuery } from "@/services/admin/StageSubject";
import { DeleteIcons, UpdateIcons } from "@/components/common/icons/Actions";
import UpdateModel from "./UpdateModel";
import { toast } from "react-toastify";
import FormattedDate from "@/components/common/FormattedDate";

const TableComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedExamResult, setSelectedExamResult] = useState<any>(null);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });
  const [selectedRecords, setSelectedRecords] = useState([]);
  const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
  const { isMounted } = useMounted();
  const { currentData: Setting, isFetching: isFetchingSetting } = useSettingGetDataQuery();
  const [pageNumber, setPageNumber] = useState(1);
  const { isFetching: isFetchingSectionData, currentData: SectionData } = useSectionGetDataQuery({});
  const { isFetching: isFetchingStageSubjectData, currentData: StageSubjectData } = useStageSubjectGetDataQuery({});
  const { isFetching: isFetchingSchoolYearData, currentData: SchoolYearData } = useSchoolYearGetDataQuery();
  const { isFetching: isFetchingStageData, currentData: StageData } = useStageGetDataQuery();

  const [ExamResultsGetDataById, { currentData: examResultData }] = useLazyExamResultsGetDataByIdQuery();
  const [ExamResultsUpdate, { isLoading: isLoadingUpdate }] = useExamResultsUpdateMutation();

  const [param, setParam] = useState<
    | {
        approval_status?: string;
        search?: string;
        range?: string;
        stageSubjectId?: string;
        sectionId?: string;
        schoolYearId?: string;
        stageId?: string;
        classId?: string;
      }
    | undefined
  >();

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
    ...(param?.schoolYearId && { schoolYearId: param.schoolYearId }),
    // ...(param?.stageId && { stageSubjectId: param.stageId }),
    ...(param?.classId && { classId: param.classId }),
    ...(param?.sectionId && { sectionId: param.sectionId }),
    ...(param?.stageSubjectId && { stageSubjectId: param.stageSubjectId }),
  };

  const { isFetching, currentData: data } = useExamResultsGetDataQuery(params);

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
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl" ? true : false;

  const handleSelectSection = (value: any) => {
    setParam((prev) => ({
      ...prev,
      sectionId: value || undefined,
    }));
    setPageNumber(1);
  };

  const handleSelectClass = (value: any) => {
    setParam((prev) => ({
      ...prev,
      classId: value || undefined,
      sectionId: undefined, // Reset section when class changes
    }));
    setPageNumber(1);
  };

  const handleSelectStage = (value: any) => {
    setParam((prev) => ({
      ...prev,
      stageId: value || undefined,
      classId: undefined, // Reset class when stage changes
      sectionId: undefined, // Reset section when stage changes
    }));
    setPageNumber(1);
  };

  const handleSelectSchoolYear = (value: any) => {
    setParam((prev) => ({
      ...prev,
      schoolYearId: value?.value || undefined,
    }));
    setPageNumber(1);
  };

  const handleSelectStageSubjectId = (value: any) => {
    setParam((prev) => ({
      ...prev,
      stageSubjectId: value?.value || undefined,
    }));
    setPageNumber(1);
  };

  useEffect(() => {
    if (openUpdateModal && selectedExamResult?.id) {
      ExamResultsGetDataById({ id: selectedExamResult.id });
    }
  }, [openUpdateModal, selectedExamResult?.id]);

  const handleUpdateClick = (record: any) => {
    setSelectedExamResult(record);
    setOpenUpdateModal(true);
  };

  const handleUpdateSubmit = async (values: { score: number | string; notes: string }, formikHelpers: any) => {
    try {
      if (!selectedExamResult?.id) return;
      await ExamResultsUpdate({
        id: selectedExamResult.id,
        body: { score: Number(values.score), notes: values.notes },
      }).unwrap();
      toast.success(String(t("common.updated-successfully" as any)), { autoClose: 3000 });
      formikHelpers.resetForm();
      setOpenUpdateModal(false);
      setSelectedExamResult(null);
    } catch (error: any) {
      console.error("Failed to update exam result:", error);
      toast.error(error?.data?.message ?? error?.message ?? JSON.stringify(error), { autoClose: 30000 });
      formikHelpers.setSubmitting(false);
    }
  };

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
                      router.push("/examResult/createOrUpdate");
                    }}>
                    {t("common.add")}
                  </button>
                );
              }}
              resource={"exam_result"}
              permission={["create-any", "create-own"]}
            />
          }
        </div>
      </div>
      <div className={"flex justify-start max-md:flex-col gap-3 mt-2"}>
        {/* Stage Filter */}
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

        {/* Class Filter - Only shown when stage is selected */}
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

        {/* Section Filter - Only shown when class is selected */}
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

        {/* Stage Subject Filter */}
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
              },

              {
                title: t("ExamResultsPage.score"),
                accessor: "score",
                sortable: true,
                render: (record: any) => (
                  <>
                    <div className="items-right flex gap-6">
                      <p dir="ltr">{record.score ? record.score : null}</p>
                      <div className="row-actions items-right m-0 flex gap-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateClick(record);
                          }}
                          title={t("common.update")}>
                          <UpdateIcons className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </>
                ),
              },

              {
                title: t("ExamResultsPage.notes"),
                accessor: "notes",
                sortable: true,
              },
              {
                title: t("ExamResultsPage.StageName"),
                accessor: "ExamSection.Exam.StageSubject.Stage.name",
                render: ({ ExamSection }: any) => ExamSection.Exam.StageSubject.Stage.name && t(ExamSection.Exam.StageSubject.Stage.name ?? ("" as any)),
              },
              {
                title: t("ExamResultsPage.examDate"),
                accessor: "ExamSection.examDate",
                render: ({ ExamSection }: any) => (ExamSection?.examDate ? <div>{moment(ExamSection.examDate).format("YYYY-MM-DD")}</div> : null),
              },
              {
                title: t("ExamResultsPage.SectionName"),
                accessor: "ExamSection.Section.name",
                render: ({ ExamSection }: any) => ExamSection?.Section?.name && t(ExamSection?.Section?.name ?? ("" as any)),
              },
              {
                title: t("ExamResultsPage.ExamTypeName"),
                accessor: "ExamSection.Exam.ExamType.name",
              },
              {
                title: t("ExamResultsPage.SubjectName"),
                accessor: "ExamSection.Exam.StageSubject.Subject.name",
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

      <UpdateModel
        open={openUpdateModal}
        setOpen={setOpenUpdateModal}
        name={selectedExamResult?.Student?.fullName || ""}
        title={String(t("common.update" as any))}
        description={String(t("ExamResultsPage.update-exam-result" as any) || t("common.update" as any))}
        onSubmit={handleUpdateSubmit}
        isLoading={isLoadingUpdate}
        initialValues={{ score: examResultData?.score ?? "", notes: examResultData?.notes ?? "" }}
      />
    </div>
  );
};

export default withRole(TableComponent, "exam_result", ["read-any", "read-own"]);
