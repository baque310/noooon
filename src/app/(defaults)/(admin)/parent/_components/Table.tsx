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
import { exportJsonToExcel } from "@/utils/excelParser";
import ParentModal from "./ParentModal";
import { Search as SearchIcon, Users, Download } from "lucide-react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>();

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
    <div className="p-4">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">{t("ParentPage.parents")}</h2>
        <div className="flex gap-3">
          {/* Export to Excel Button */}
          <button
            onClick={() => {
              exportJsonToExcel({
                data:
                  data?.data.map((item) => {
                    return {
                      fullName: item.fullName,
                      User: item.User?.username,
                      birth: item.birth,
                      gender: item.gender,
                      address: item.address,
                      email: item.email,
                      phone1: item.phone1,
                      phone2: item.phone2,
                    };
                  }) ?? [],
                fileName: "Parents",
                sheetName: "Parents",
              });
            }}
            disabled={!data?.data || data.data.length === 0 || isFetching}
            className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-extrabold px-6 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-800 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            <Download className="h-4 w-4" />
            تصدير للأكسل
          </button>

          <RolePageAndActionBasedComponent
            component={(props) => (
              <button
                onClick={() => {
                  router.push("/parent/createOrUpdate");
                }}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-sm">
                <AddIcons className="h-5 w-5" />
                إضافة ولي أمر جديد
              </button>
            )}
            resource="admin"
            permission={["create-any", "create-own"]}
          />
        </div>
      </div>

      {/* Search Bar Row */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={Search ?? ""}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            placeholder={t("common.searchParents")}
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-3 ps-10 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition shadow-sm"
          />
        </div>
      </div>
      {/* Data Table Section */}
      <div className="datatables pagination-padding mt-2">
        <div className="flex flex-col gap-3">
          <div className="hidden md:grid grid-cols-[80px_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 bg-primary/5 dark:bg-primary/10 rounded-xl mb-4 text-primary font-extrabold text-sm">
            <div className="text-center">{t("ParentPage.photo")}</div>
            <div className="text-start">{t("ParentPage.fullName")}</div>
            <div className="text-center">{t("ParentPage.Username")}</div>
            <div className="text-center">{t("ParentPage.gender")}</div>
            <div className="text-center">{t("common.createdAt")}</div>
          </div>

          {isFetching ? (
            <div className="flex justify-center items-center py-16">
              <div className="loader !bg-primary !w-8 !h-8" />
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400 dark:text-gray-500">
              <p className="font-bold text-sm">{t("common.no-data")}</p>
            </div>
          ) : (
            data?.data?.map((item: any) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedParentId(item.id);
                  setIsModalOpen(true);
                }}
                className="grid grid-cols-1 md:grid-cols-[80px_1fr_1fr_1fr_1fr] gap-4 items-center px-6 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-center">
                  <div className="relative group">
                    <Avatar photo={item.photo} username={item.fullName} className="w-12 h-12 text-sm" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-full transition-colors duration-200"></div>
                  </div>
                </div>
                <div className="font-extrabold text-gray-800 dark:text-gray-200 text-center md:text-start">
                  {item.fullName}
                </div>
                <div className="font-mono text-gray-500 dark:text-gray-400 text-sm text-center">
                  {item.User?.username || "—"}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-lg font-medium">
                    {t(item.gender.toLowerCase() as any)}
                  </span>
                </div>
                <div className="font-bold text-gray-500 dark:text-gray-400 text-sm text-center">
                  {item.createdAt ? moment(item.createdAt).format("YYYY-MM-DD") : "—"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ParentModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        parentId={selectedParentId}
        onSuccess={() => {
          // Refetch can be implemented if needed, handled by RTK Query cache generally 
        }}
      />
    </div>
  );
};

export default withRole(TableComponent, "parent", ["read-any", "read-own"]);
