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
    handleSelectStage,
    isFetchingStageData,
    StageData,
    sortStatus,
    setSortStatus,

  } = _logic()
  const [open, setOpen] = useState(false)
  return (
    <div className={`m-4 rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("ClassPage.Classes")}</div>
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
            placeholder={t("ClassPage.StageName")}
            isLoading={isFetchingStageData}
            props={{
              onChange: handleSelectStage
            }}
            options={StageData?.map((item) => {
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
              router.push(`/class/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base `}
            records={data as any}
            columns={[
              {
                title: t("ClassPage.name"),
                accessor: "name",
                sortable: true,
                render: ({ name }: any) => t(name as any),
              },
              {
                title: t("ClassPage.StageName"),
                accessor: "Stage.name",
                // sortable: true,
                render: ({ Stage }: any) => t(Stage.name as any),
              },

              {
                title: t("common.createdAt"),
                accessor: "createdAt",
                // sortable: true,
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


          />
        )}
      </div>
      <CreateComponent open={open} setOpen={setOpen} />
    </div>
  );
};

export default withRole(TableComponent, "class", ["read-any", "read-own"]);
