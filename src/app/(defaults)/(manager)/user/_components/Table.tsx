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

import { useUserGetDataQuery } from "@/services/Manager/User";
import { SelectWithSearch } from "@/components/Filter/SelectSearch";
import { ChangePasswordByAdminModel } from "@/components/Model/ChangePasswordByAdminModel";

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

  const { isFetching, currentData: data } = useUserGetDataQuery({
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

      router.push(`/user?${allParams.toString()}`);
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
    <div
      className={`m-4    rtl:transition-[left] ltr:transition-[right] duration-1000`}
    >
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("UserPage.Users")}</div>
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
              onChange: handleSelect,
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
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data?.data as any}
            columns={[
              {
                title: t("UserPage.username"),
                accessor: "username",
                sortable: true,
              },
              {
                title: t("UserPage.SchoolName"),
                accessor: "School.name",
              },
              {
                title: t("UserPage.SchoolAddress"),
                accessor: "School.address",
              },
              {
                title: t("common.status"),
                accessor: "isActive",
                sortable: true,
                render: ({ isActive }) => (
                  <div className="flex gap-2 px-[2px]">
                    {isActive == "TRUE" ? (
                      <div
                        className={` rounded-md p-1 text-center bg-success/20 text-success `}
                      >
                        {t("common.isActive")}
                      </div>
                    ) : (
                      <div
                        className={` rounded-md p-1 text-center bg-danger/50 text-danger`}
                      >
                        {t("common.isNotActive")}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                title: t("common.statusDeleted"),
                accessor: "isDeleted",
                sortable: true,
                render: ({ isDeleted }) => (
                  <div className="flex gap-2 px-[2px]">
                    {isDeleted == "TRUE" ? (
                      <div
                        className={` rounded-md p-1 text-center bg-success/20 text-success `}
                      >
                        {t("common.isDeleted")}
                      </div>
                    ) : (
                      <div
                        className={` rounded-md p-1 text-center bg-danger/50 text-danger`}
                      >
                        {t("common.isNotDeleted")}
                      </div>
                    )}
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
              {
                title: t("common.action"),
                accessor: "action",
                sortable: true,
                render: ({ id, username }: any) => (
                  <ChangePasswordButton userId={id} username={username} />
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

export default withRole(TableComponent, "user", ["read-any", "read-own"]);

const ChangePasswordButton = ({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) => {
  const { t } = getTranslation();
  const [openChangePassword, setOpenChangePassword] = useState(false);

  return (
    <>
      <button
        className="hover:bg-primary hover:text-white py-1 px-2 rounded-md"
        onClick={() => setOpenChangePassword(true)}
      >
        {t("common.changePassword")}
      </button>
      <ChangePasswordByAdminModel
        open={openChangePassword}
        setOpen={setOpenChangePassword}
        data={{
          username,
          userId,
        }}
      />
    </>
  );
};
