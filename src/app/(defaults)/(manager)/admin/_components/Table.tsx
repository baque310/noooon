"use client";
import { DataTable } from "mantine-datatable";
import React from "react";

import moment from "moment";
import { withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { useAdminGetDataQuery } from "@/services/Manager/Admin";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { SelectWithSearch } from "@/components/Filter/SelectSearch";



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
      isActive?: string;
      search?: string;
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

  const { isFetching: isFetching, currentData: data } = useAdminGetDataQuery({
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
      router.push(`/admin?${allParams.toString()}`);
      setPageNumber(1);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };



  const handleSelect = (value: any) => {
    if (value) {
      setParam({ ...param, isActive: value.value });

    } else {
      setParam({ ...param, isActive: undefined });
    }
  };
  return (
    <div className={`m-4    rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("AdminPage.admins")}</div>
        <div className={"flex gap-3"}>
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
            placeholder={t("common.status")}
            isLoading={false}
            props={{
              onChange: handleSelect
            }}
            options={[
              { label: t("common.isActive"), value: "TRUE" },
              { label: t("common.isNotActive"), value: "FALSE" },
            ]}
          />
        </div>
      </div>
      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            onRowClick={async (item) => {
              router.push(`/admin/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base  border border-dark-dark-light`}
            records={data?.data as any}
            columns={[
              {
                title: t("AdminPage.username"),
                accessor: "username",
                sortable: true,
              },
              {
                title: t("AdminPage.School.name"),
                accessor: "School.name",
                // sortable: true,
              },
              {
                title: t("AdminPage.School.address"),
                accessor: "School.address",
                // sortable: true,
              },
              {
                title: t("AdminPage.School.email"),
                accessor: "School.email",
                // sortable: true,
              },
              {
                title: t("AdminPage.School.phone1"),
                accessor: "School.phone1",
                // sortable: true,
              },
              {
                title: t("AdminPage.School.phone2"),
                accessor: "School.phone2",
                // sortable: true,
              },
              {
                title: t("AdminPage.School.hasBanner"),
                accessor: "School.hasBanner",
                // sortable: true,
                render: ({ School }: any) => (School.hasBanner ? <div>{t("common.yes")}</div> : <div>{t("common.no")}</div>),
              },
              {
                title: t("common.status"),
                accessor: "isActive",
                sortable: true,
                render: ({ isActive }) => (
                  <div className="flex gap-2 px-[2px]">
                    {isActive == "TRUE" ? (
                      <div className={` rounded-md p-1 text-center bg-success/20 text-success `}>{t("common.isActive")}</div>
                    ) : (
                      <div className={` rounded-md p-1 text-center bg-danger/50 text-danger`}>{t("common.isNotActive")}</div>
                    )}
                  </div>
                ),
              },
              // {
              //   title: t("common.updatedAt"),
              //   accessor: "updatedAt",
              //   sortable: true,
              //   render: ({ updatedAt }: any) => (updatedAt ? <div>{moment(updatedAt).format("YYYY-MM-DD hh:mm:ss A")}</div> : null),
              // },
              {
                title: t("common.createdAt"),
                accessor: "School.createdAt",
                // sortable: true,
                render: ({ School }: any) => (School.createdAt ? <div>{moment(School.createdAt).format("YYYY-MM-DD hh:mm:ss A")}</div> : null),
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

export default withRole(TableComponent, "admin", ["read-any", "read-own"]);
