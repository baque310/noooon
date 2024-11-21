"use client";
import { DataTable } from "mantine-datatable";
import React from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import { AddIcons } from "@/components/common/icons/Actions";
import useLogic from "./_logic";
 

const TableComponent = () => {
  const {
    t,
    data,
    isFetching,
    handleChange,
    handleKeyPress,
    pageNumber,
    setPageNumber,
    setSortStatus,
    sortStatus,
    Search,
    router,
    isMounted,
    isDark,
  } = useLogic()
  return (
    <div className={`m-4    rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("SupperAdminPage.supperAdmin")}</div>
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
          {
            <RolePageAndActionBasedComponent
              component={(props) => {
                return (
                  <button
                    className={` ${props.disabled && "hidden"
                      } flex justify-center gap-1 items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2    rounded border `}
                    onClick={() => {
                      router.push("/createOrUpdate");
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
              router.push(`/supperAdmin/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base `}
            records={data?.data as any}
            columns={[
              {
                title: t("SupperAdminPage.username"),
                accessor: "username",
                sortable: true,
              },
              // {
              //   title: t("SupperAdminPage.School.name"),
              //   accessor: "School.name",
              //   // sortable: true,
              // },
              // {
              //   title: t("SupperAdminPage.School.address"),
              //   accessor: "School.address",
              //   // sortable: true,
              // },
              // {
              //   title: t("SupperAdminPage.School.email"),
              //   accessor: "School.email",
              //   // sortable: true,
              // },
              // {
              //   title: t("SupperAdminPage.School.phone1"),
              //   accessor: "School.phone1",
              //   // sortable: true,
              // },
              // {
              //   title: t("SupperAdminPage.School.phone2"),
              //   accessor: "School.phone2",
              //   // sortable: true,
              // },
              // {
              //   title: t("SupperAdminPage.School.hasBanner"),
              //   accessor: "School.hasBanner",
              //   // sortable: true,
              //   render: ({ School }: any) => (School.hasBanner ? <div>{t("common.yes")}</div> : <div>{t("common.no")}</div>),
              // },
              {
                title: t("common.status"),
                accessor: "isActive",
                sortable: true,
                render: ({ isActive }) => (
                  <div className="flex gap-2 px-[2px]">
                    {isActive == "true" ? (
                      <div className={` rounded-md p-1 text-center bg-success/20 text-success `}>{t("common.isActive")}</div>
                    ) : (
                      <div className={` rounded-md p-1 text-center bg-danger/50 text-danger`}>{t("common.isNotActive")}</div>
                    )}
                  </div>
                ),
              },
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
