"use client";
import { DataTable } from "mantine-datatable";
import React from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useLogic from "./_logic";
import { AddIcons } from "@/components/common/icons/Actions";


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
        <div className="text-xl uppercase ">{t("StudentPage.student")}</div>
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
                      router.push("/student/createOrUpdate");
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
              router.push(`/student/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base `}
            records={data?.data as any}
            columns={[
              {
                title: t("StudentPage.fullName"),
                accessor: "fullName",
                sortable: true,
              },
              {
                title: t("StudentPage.Username"),
                accessor: "User.username",
                // sortable: true,
              },
              {
                title: t("StudentPage.birth"),
                accessor: "birth",
                sortable: true,
                render: ({ birth }: any) => (birth ? <div>{moment(birth).format("YYYY-MM-DD")}</div> : null),
              },
              {
                title: t("StudentPage.enrollmentDate"),
                accessor: "enrollmentDate",
                sortable: true,
                render: ({ enrollmentDate }: any) => (enrollmentDate ? <div>{moment(enrollmentDate).format("YYYY-MM-DD")}</div> : null),
              },
              {
                title: t("StudentPage.address"),
                accessor: "address",
                sortable: true,
              },
              {
                title: t("StudentPage.email"),
                accessor: "email",
                sortable: true,
              },
              {
                title: t("StudentPage.phone1"),
                accessor: "phone1",
                sortable: true,
              },
              {
                title: t("StudentPage.phone2"),
                accessor: "phone2",
                sortable: true,
              },

              {
                title: t("common.updatedAt"),
                accessor: "updatedAt",
                sortable: true,
                render: ({ updatedAt }: any) => (updatedAt ? <div>{moment(updatedAt).format("YYYY-MM-DD hh:mm:ss A")}</div> : null),
              },
              {
                title: t("common.createdAt"),
                accessor: "createdAt",
                sortable: true,
                render: ({ createdAt }: any) => (createdAt ? <div>{moment(createdAt).format("YYYY-MM-DD hh:mm:ss A")}</div> : null),
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

export default withRole(TableComponent, "student", ["read-any", "read-own"]);
