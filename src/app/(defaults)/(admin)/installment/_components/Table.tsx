"use client";
import { DataTable } from "mantine-datatable";
import React from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";

import { AddIcons } from "@/components/common/icons/Actions";
import { useInstallmentGetDataQuery } from "@/services/admin/Installment";
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

  const [pageNumber, setPageNumber] = useState(Number(1));

  const [param, setParam] = useState<
    | {
        approval_status?: string;
        search?: string;
        range?: string;
      }
    | undefined
  >();
  const params = {
    skip: pageNumber,
    take: 30,
    sortBy: sortStatus.columnAccessor,
    sortDirection: sortStatus.direction,
    ...(search && { search: search as string }),
    ...param,
  };

  const { isFetching, currentData: data } = useInstallmentGetDataQuery({
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

      router.push(`/installment?${allParams.toString()}`);
      setPageNumber(1);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={`m-4    rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("InstallmentPage.installments")}</div>
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
                      router.push("/installment/createOrUpdate");
                    }}>
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
      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            onRowClick={async (item) => {
              router.push(`/installment/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data?.data as any}
            columns={[
              {
                title: t("InstallmentPage.StudentFullName"),
                accessor: "title",
                sortable: true,
                render: ({ StudentEnrollment }: any) => <div>{StudentEnrollment.Student.fullName}</div>,
              },
              {
                title: t("InstallmentPage.title"),
                accessor: "title",
                sortable: true,
              },
              {
                title: t("StudentInstallmentPage.SchoolYear"),
                accessor: "SchoolYear",
                // sortable: true,
                render: ({ SchoolYear }: any) => SchoolYear.from + " - " + SchoolYear.to,
              },
              {
                title: t("InstallmentPage.numberOfInstallments"),
                accessor: "numberOfInstallments",
                sortable: true,
              },
              {
                title: t("InstallmentPage.totalAmount"),
                accessor: "totalAmount",
                sortable: true,
                render: ({ totalAmount }: any) =>
                  totalAmount && (
                    <div className="flex gap-1">
                      {totalAmount?.toLocaleString()}
                      <span className="font-bold text-teal-500 bg-teal-500/20 w-fit justify-center items-center rounded-md flex text-xs px-1">{t("IQD")}</span>
                    </div>
                  ),
              },
              {
                title: t("InstallmentPage.installmentAmount"),
                accessor: "installmentAmount",
                sortable: true,
                render: ({ installmentAmount }: any) =>
                  installmentAmount && (
                    <div className="flex gap-1">
                      {installmentAmount?.toLocaleString()}
                      <span className="font-bold text-teal-500 bg-teal-500/20 w-fit justify-center items-center rounded-md flex text-xs px-1">{t("IQD")}</span>
                    </div>
                  ),
              },

              {
                title: t("InstallmentPage.discountAmount"),
                accessor: "discountAmount",
                sortable: true,
                render: ({ discountAmount }: any) =>
                  discountAmount && (
                    <div className="flex gap-1">
                      {discountAmount?.toLocaleString()}
                      <span className="font-bold text-teal-500 bg-teal-500/20 w-fit justify-center items-center rounded-md flex text-xs px-1">{t("IQD")}</span>
                    </div>
                  ),
              },
              {
                title: t("InstallmentPage.finalTotalAmount"),
                accessor: "finalTotalAmount",
                sortable: true,
                render: ({ finalTotalAmount }: any) =>
                  finalTotalAmount && (
                    <div className="flex gap-1">
                      {finalTotalAmount?.toLocaleString()}
                      <span className="font-bold text-teal-500 bg-teal-500/20 w-fit justify-center items-center rounded-md flex text-xs px-1">{t("IQD")}</span>
                    </div>
                  ),
              },
              {
                title: t("common.status"),
                accessor: "isActive",
                sortable: true,
                render: ({ isActive }: any) =>
                  isActive ? <div className="text-green-500">{t("common.isActive")}</div> : <div className="text-red-500">{t("common.isNotActive")}</div>,
              },
              {
                title: t("InstallmentPage.startDate"),
                accessor: "startDate",
                sortable: true,
                render: ({ startDate }: any) => (startDate ? <div>{moment(startDate).format("YYYY-MM-DD hh:mm:ss A")}</div> : null),
              },
              {
                title: t("InstallmentPage.notes"),
                accessor: "notes",
                sortable: true,
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

export default withRole(TableComponent, "installment", ["read-any", "read-own"]);
