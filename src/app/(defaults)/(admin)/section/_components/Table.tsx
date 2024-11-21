"use client";
import { DataTable } from "mantine-datatable";
import React, { useState } from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import _logic from "./_logic";
import { AddIcons } from "@/components/common/icons/Actions";
import CreateComponent from "./create/_components/CreateComponent";
import { SelectWithSearch } from "@/components/Filter/SelectSearch";


const TableComponent = () => {
  const {
    t,
    data,
    isFetching,
    router,
    isMounted,
    isDark,
    Search,
    handleKeyPress,
    handleChange,
    handleSelectClass,
    isFetchingClassData,
    ClassData,
    sortStatus,
    setSortStatus,

  } = _logic()
  const [open, setOpen] = useState(false)
  return (
    <div className={`m-4 rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("SectionPage.Section")}</div>
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
            placeholder={t("SectionPage.ClassName")}
            isLoading={isFetchingClassData}
            props={{
              onChange: handleSelectClass
            }}
            options={ClassData?.map((item) => {
              return {
                value: item.id,
                label: t(item.name as any),
              };
            })}
          />

          {
            <RolePageAndActionBasedComponent
              component={(props) => {
                return (
                  <button
                    className={` ${props.disabled && "hidden"
                      } flex justify-center gap-1 items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2    rounded border `}
                    onClick={() => {
                      setOpen(true)
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
              router.push(`/section/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base `}
            records={data as any}
            columns={[
              {
                title: t("SectionPage.name"),
                accessor: "name",
                sortable: true,
                // render: ({ name }: any) => t(name as any),
              },
              {
                title: t("SectionPage.ClassName"),
                accessor: "Class.name",
                // sortable: true,
                // render: ({ Class }: any) => t(Class.name as any),
              },
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
                accessor: "createdAt",
                // sortable: true,
                // render: ({ createdAt }: any) => (createdAt ? <div>{moment(createdAt).format("YYYY-MM-DD hh:mm:ss A")}</div> : null),
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


          />
        )}
      </div>
      <CreateComponent open={open} setOpen={setOpen} />
    </div>
  );
};

export default withRole(TableComponent, "section", ["read-any", "read-own"]);
