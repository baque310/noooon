"use client";
import { DataTable } from "mantine-datatable";
import React from "react";

import moment from "moment";
import {
  RolePageAndActionBasedComponent,
  withRole,
} from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { useParentGetDataQuery } from "@/services/admin/parent";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { AddIcons } from "@/components/common/icons/Actions";
import Avatar from "@/components/common/Avatar";

const TableComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const isDark =
    useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
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

  const { isFetching, currentData: data } = useParentGetDataQuery({
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
      // router.push({
      //     pathname: router.pathname,
      //     query: { ...router.query, search: value ?? Search },
      // });
      allParams.set("search", value ?? Search);

      router.push(`/parent?${allParams.toString()}`);
      setPageNumber(1);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className={`m-4 rtl:transition-[left] ltr:transition-[right] duration-1000`}
    >
      {/* Header Section */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center max-lg:flex-col max-lg:items-start gap-6">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("ParentPage.parents")}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {t("ParentPage.manageAndViewParentInfo")}
                </p>
              </div>
            </div>

            {/* Action Section */}
            <div className="flex gap-4 max-md:flex-col max-md:w-full">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  value={Search ?? ""}
                  placeholder={`${t("common.searchParents")}`}
                  onKeyDown={handleKeyPress}
                  onChange={handleChange}
                  id="search"
                  className="pl-10 pr-4 py-3 w-80 max-md:w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                  name="search"
                />
              </div>

              {/* Add Button */}
              <RolePageAndActionBasedComponent
                component={(props) => {
                  return (
                    <button
                      className={`${props.disabled && "hidden"} 
                        relative overflow-hidden group
                        flex items-center gap-3 px-6 py-3
                        bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700
                        text-white font-semibold rounded-xl
                        shadow-lg hover:shadow-xl
                        transform hover:scale-105 active:scale-95
                        transition-all duration-200
                        border border-green-500/20
                        min-w-fit whitespace-nowrap`}
                      onClick={() => {
                        router.push("/parent/createOrUpdate");
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                      <AddIcons className="h-5 w-5 relative z-10" />
                      <span className="relative z-10">{t("common.add")}</span>
                    </button>
                  );
                }}
                resource={"admin"}
                permission={["create-any", "create-own"]}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Data Table Section */}
      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            onRowClick={async (item) => {
              router.push(`/parent/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data?.data as any}
            columns={[
              {
                title: t("ParentPage.photo"),
                accessor: "photo",
                sortable: true,
                width: 80,
                render: ({ photo, fullName }: any) => (
                  <div className="flex items-center justify-center">
                    <div className="relative group">
                      <Avatar photo={photo} username={fullName} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-full transition-colors duration-200"></div>
                    </div>
                  </div>
                ),
              },
              {
                title: t("ParentPage.fullName"),
                accessor: "fullName",
                sortable: true,
                render: ({ fullName }: any) => (
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {fullName}
                  </div>
                ),
              },
              {
                title: t("ParentPage.Username"),
                accessor: "User.username",
                render: ({ User }: any) => (
                  <div className="flex items-center gap-2">
                    <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-lg font-medium">
                      @{User?.username}
                    </span>
                  </div>
                ),
              },
              {
                title: t("ParentPage.birth"),
                accessor: "birth",
                sortable: true,
                render: ({ birth }: any) =>
                  birth ? (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {moment(birth).format("MMM DD, YYYY")}
                    </div>
                  ) : null,
              },
              {
                title: t("ParentPage.fullNameStudent"),
                accessor: "fullNameStudent",
                sortable: true,
                render: ({ Student }: any) =>
                  Student && (Student.fullName ?? ""),
              },
              {
                title: t("ParentPage.address"),
                accessor: "address",
                sortable: true,
                render: ({ address }: any) => (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 max-w-48 truncate">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span title={address}>{address}</span>
                  </div>
                ),
              },
              {
                title: t("ParentPage.email"),
                accessor: "email",
                sortable: true,
                render: ({ email }: any) => (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {email}
                  </div>
                ),
              },
              {
                title: t("ParentPage.phone1"),
                accessor: "phone1",
                sortable: true,
                render: ({ phone1 }: any) => (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {phone1}
                  </div>
                ),
              },
              {
                title: t("ParentPage.phone2"),
                accessor: "phone2",
                sortable: true,
                render: ({ phone2 }: any) =>
                  phone2 ? (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {phone2}
                    </div>
                  ) : null,
              },
              {
                title: t("common.updatedAt"),
                accessor: "updatedAt",
                sortable: true,
                render: ({ updatedAt }: any) =>
                  updatedAt ? (
                    <div className="text-xs">
                      <div className="text-gray-500 dark:text-gray-400 font-medium">
                        {moment(updatedAt).format("MMM DD, YYYY")}
                      </div>
                      <div className="text-gray-400 dark:text-gray-500">
                        {moment(updatedAt).format("hh:mm A")}
                      </div>
                    </div>
                  ) : null,
              },
              {
                title: t("common.createdAt"),
                accessor: "createdAt",
                sortable: true,
                render: ({ createdAt }: any) =>
                  createdAt ? (
                    <div className="text-xs">
                      <div className="text-gray-500 dark:text-gray-400 font-medium">
                        {moment(createdAt).format("MMM DD, YYYY")}
                      </div>
                      <div className="text-gray-400 dark:text-gray-500">
                        {moment(createdAt).format("hh:mm A")}
                      </div>
                    </div>
                  ) : null,
              },
            ]}
            customLoader={
              <div className="flex items-center justify-center py-12">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-green-600 rounded-full animate-spin"></div>
                </div>
              </div>
            }
            noRecordsText={""}
            noRecordsIcon={
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t("common.no-data")}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t("common.noParentsFound")}
                </p>
              </div>
            }
            {...((data?.data &&
              data?.data?.length == 0 && { minHeight: 300 }) as any)}
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
            rowClassName={({ record }) =>
              "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            }
            borderRadius="lg"
          />
        )}
      </div>
    </div>
  );
};

export default withRole(TableComponent, "parent", ["read-any", "read-own"]);
