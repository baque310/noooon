"use client";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import React, { useState } from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
 import { AddIcons } from "@/components/common/icons/Actions";
import CreateComponent from "./CreateComponent";
import { SelectWithSearch } from "@/components/Filter/SelectSearch";
import { getTranslation } from "@/ni18n/i18n";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import useMounted from "@/hooks/useMounted";
import { useClassGetDataQuery } from "@/services/admin/class";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { IRootState } from "@/store";


const TableComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
      columnAccessor: "createdAt",
      direction: "desc",
  });

  const [param, setParam] = useState<
      | {
          search?: string;
          stageId?: string;
      }
      | undefined
  >();
  const params = {
      sortBy: sortStatus.columnAccessor,
      sortDirection: sortStatus.direction,
      ...(search && { search: search as string }),
      ...param,
  };

  const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
  const { isMounted } = useMounted();
  const { isFetching, currentData: dataClass } = useClassGetDataQuery(params);
  const { isFetching: isFetchingStageData, currentData: StageData } = useStageGetDataQuery();


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
          router.push(`/class?${allParams.toString()}`);
      }
  };
  const handleKeyPress = (event: any) => {
      if (event.key === "Enter") {
          handleSearch();
      }
  };

  const handleSelectStage = (value: any) => {
      if (value) {
          setParam({ ...param, stageId: value.value });

      } else {
          setParam({ ...param, stageId: undefined });

      }
  }
  const [open, setOpen] = useState(false)
  return (
    <div className={`m-4 rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("ClassPage.Classes")}</div>
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
                      } flex w-fit justify-center gap-1 items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2    rounded border `}
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
            records={dataClass as any}
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
