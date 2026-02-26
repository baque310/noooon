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
import { useStudentInstallmentGetDataQuery } from "@/services/admin/studentInstallment";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { SelectWithSearch } from "@/components/Filter/SelectSearch";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import { useSettingGetDataQuery } from "@/services/Setting";
import CreateOrUpdateComponent from "./CreateOrUpdateComponent";

const TableComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [dataRow, setDataRow] = useState<any>();
  const search = searchParams.get("search") || "";
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });
  const isDark =
    useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
  const { isMounted } = useMounted();
  const { currentData: Setting, isFetching: isFetchingSetting } =
    useSettingGetDataQuery();
  const [pageNumber, setPageNumber] = useState(Number(1));

  const { isFetching: isFetchingSchoolYearData, currentData: SchoolYearData } =
    useSchoolYearGetDataQuery();

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

  const { isFetching: isFetching, currentData: data } =
    useStudentInstallmentGetDataQuery({
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
      router.push(`/studentInstallment?${allParams.toString()}`);
      setPageNumber(1);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectSchoolYear = (value: any) => {
    if (value) {
      setParam({ ...param, schoolYearId: value.value });
    } else {
      setParam({ ...param, schoolYearId: undefined });
    }
  };
  return (
    <div
      className={`m-4 rtl:transition-[left] ltr:transition-[right] duration-1000`}
    >
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">
          {t("StudentInstallmentPage.StudentInstallment")}
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

          <SelectWithSearch
            placeholder={t("TeacherSubjectPage.enter-SchoolYear")}
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
                  <div className="inline-flex relative">
                    <button
                      className={` ${
                        props.disabled && "hidden"
                      } flex justify-center gap-1 border-l-dark-light/35 items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2  rounded border`}
                      onClick={() => {
                        setDataRow(undefined);
                        setOpen(true);
                      }}
                    >
                      {t("common.add")}
                    </button>
                  </div>
                );
              }}
              resource={"admin"}
              permission={["create-any", "create-own"]}
            />
          }
        </div>
      </div>
      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            onRowClick={async (item) => {
              router.push(`studentInstallment/${item.record.id}`)
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data?.data as any}
            columns={[
              {
                title: t("StudentInstallmentPage.StudentFullName"),
                accessor: "StudentEnrollment.Student.fullName",
                // sortable: true,
              },
              {
                title: t("StudentInstallmentPage.SchoolYear"),
                accessor: "SchoolYear",
                // sortable: true,
                render: ({ SchoolYear }: any) =>
                  SchoolYear.from + " - " + SchoolYear.to,
              },
              {
                title: t("StudentInstallmentPage.date"),
                accessor: "date",
                sortable: true,
                render: ({ date }: any) =>
                  moment(date).format("YYYY-MM-DD hh:mm:ss A"),
              },
              {
                title: t("StudentInstallmentPage.amount"),
                accessor: "amount",
                sortable: true,
                render: ({ amount }: any) =>
                  amount && (
                    <div className="flex gap-1">
                      {amount?.toLocaleString()}
                      <span className="font-bold text-teal-500 bg-teal-500/20 w-fit justify-center items-center rounded-md flex text-xs px-1">
                        {t("IQD")}
                      </span>
                    </div>
                  ),
              },

              {
                title: t("common.updatedAt"),
                accessor: "updatedAt",
                sortable: true,
                render: ({ updatedAt }: any) =>
                  updatedAt ? (
                    <div>
                      {moment(updatedAt).format("YYYY-MM-DD hh:mm:ss A")}
                    </div>
                  ) : null,
              },
              {
                title: t("common.createdAt"),
                accessor: "createdAt",
                sortable: true,
                render: ({ createdAt }: any) =>
                  createdAt ? (
                    <div>
                      {moment(createdAt).format("YYYY-MM-DD hh:mm:ss A")}
                    </div>
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
      <CreateOrUpdateComponent data={dataRow} open={open} setOpen={setOpen} />
    </div>
  );
};

export default withRole(TableComponent, "student_installment", [
  "read-any",
  "read-own",
]);
