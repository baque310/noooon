"use client";
import { DataTable } from "mantine-datatable";
import React from "react";

import moment from "moment";
import { withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { AddIcons } from "@/components/common/icons/Actions";
import Avatar from "@/components/common/Avatar";
import { useComplaintGetDataForAdminQuery } from "@/services/admin/complaint";

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

  const { isFetching, currentData: data } = useComplaintGetDataForAdminQuery({
    ...params,
  });
  console.log(data);
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

      router.push(`/adminComplaint?${allParams.toString()}`);
      setPageNumber(1);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={`m-4 rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      {/* Header Section */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center max-lg:flex-col max-lg:items-start gap-6">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t("ComplaintPage.complaints")}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t("ComplaintPage.manageAndViewComplaintInfo")}</p>
              </div>
            </div>

            {/* Action Section */}
            <div className="flex gap-4 max-md:flex-col max-md:w-full">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  value={Search ?? ""}
                  placeholder={`${t("common.searchComplaints")}`}
                  onKeyDown={handleKeyPress}
                  onChange={handleChange}
                  id="search"
                  className="pl-10 pr-4 py-3 w-80 max-md:w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transcomplaint transition-all duration-200 shadow-sm hover:shadow-md"
                  name="search"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Data Table Section */}
      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            onRowClick={async (item) => {
              router.push(`/adminComplaint/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data?.data as any}
            // إضافة الأعمدة الجديدة في مصفوفة columns داخل DataTable

            columns={[
              // إضافة عمود اسم الطالب
              {
                title: t("ComplaintPage.studentName"),
                accessor: "user.Student",
                sortable: true,
                render: ({ user }: any) => (
                  <div className="font-medium text-gray-900 dark:text-white">{user?.Student?.fullName || user?.Parent?.fullName || t("common.notAvailable")}</div>
                ),
              },
              // إضافة عمود الصف
              {
                title: t("ComplaintPage.grade"),
                accessor: "user.Student.StudentEnrollment[0].Class.name",
                sortable: true,
                render: ({ user }: any) => {
                  const grade = user?.Student?.StudentEnrollment?.[0]?.Class?.name || t("common.notAvailable");
                  return (
                    <div className="text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        {grade}
                      </span>
                    </div>
                  );
                },
              },
              // إضافة عمود الشعبة
              {
                title: t("ComplaintPage.section"),
                accessor: "user.Student.StudentEnrollment[0].Section.name",
                sortable: true,
                render: ({ user }: any) => {
                  const section = user?.Student?.StudentEnrollment?.[0]?.Section?.name || t("common.notAvailable");
                  return (
                    <div className="text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                        {section}
                      </span>
                    </div>
                  );
                },
              },
              {
                title: t("ComplaintPage.title"),
                accessor: "title",
                sortable: true,
                render: ({ title }: any) => <div className="font-semibold text-gray-900 dark:text-white">{title}</div>,
              },
              {
                title: t("ComplaintPage.description"),
                accessor: "description",
                render: ({ description }: any) => (
                  <div className="truncate" style={{ maxWidth: "200px" }}>
                    {description}
                  </div>
                ),
              },
              {
                title: t("ComplaintPage.approval_status"),
                accessor: "approval_status",
                sortable: true,
                render: ({ approval_status }) => (
                  <div className="flex gap-2 px-[2px]">
                    {approval_status == "approved" ? (
                      <div className={` rounded-md p-1 text-center bg-success/20 text-success `}>{t(approval_status as any)}</div>
                    ) : approval_status == "pending" ? (
                      <div className={` rounded-md p-1 text-center bg-warning/20 text-warning `}>{t(approval_status as any)}</div>
                    ) : (
                      <div className={` rounded-md p-1 text-center bg-danger/50 text-danger`}>{t(approval_status as any)}</div>
                    )}
                  </div>
                ),
              },
              // {
              //   title: t("ComplaintPage.reason"),
              //   accessor: "reason",
              //   sortable: true,
              //   render: ({ reason }: any) => reason ?? "",
              // },
              {
                title: t("common.updatedAt"),
                accessor: "updatedAt",
                sortable: true,
                render: ({ updatedAt }: any) =>
                  updatedAt ? (
                    <div className="text-xs">
                      <div className="text-gray-500 dark:text-gray-400 font-medium">{moment(updatedAt).format("MMM DD, YYYY")}</div>
                      <div className="text-gray-400 dark:text-gray-500">{moment(updatedAt).format("hh:mm A")}</div>
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
                      <div className="text-gray-500 dark:text-gray-400 font-medium">{moment(createdAt).format("MMM DD, YYYY")}</div>
                      <div className="text-gray-400 dark:text-gray-500">{moment(createdAt).format("hh:mm A")}</div>
                    </div>
                  ) : null,
              },
            ]}
            customLoader={
              <div className="flex items-center justify-center py-12">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transcomplaint border-t-green-600 rounded-full animate-spin"></div>
                </div>
              </div>
            }
            noRecordsText={""}
            noRecordsIcon={
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("common.no-data")}</h3>
                <p className="text-gray-500 dark:text-gray-400">{t("common.noComplaintsFound")}</p>
              </div>
            }
            {...({ minHeight: 300 } as any)}
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
            rowClassName={(record) => {
              const baseClasses = "transition-colors duration-200 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0";

              if (record.approval_status === "pending") {
                return `${baseClasses} !bg-yellow-50 dark:bg-yellow-900/20 hover:!bg-yellow-100 dark:hover:bg-yellow-900/30`;
              }

              return `${baseClasses} hover:bg-gray-50 dark:hover:bg-gray-700/50`;
            }}
            borderRadius="lg"
          />
        )}
      </div>
    </div>
  );
};

export default withRole(TableComponent, "complaint", ["read-any", "read-own"]);
