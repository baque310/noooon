"use client";
import { DataTable } from "mantine-datatable";
import React, { useState } from "react";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
 import { AddIcons } from "@/components/common/icons/Actions";
import CreateComponent from "./CreateComponent";
import { SelectWithSearch } from "@/components/Filter/SelectSearch";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { useClassGetDataQuery } from "@/services/admin/class";
import { useSectionGetDataQuery } from "@/services/admin/section";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
 import { useSelector } from "react-redux";



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
      classId?: string;
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
  const { isFetching, currentData: data } = useSectionGetDataQuery(params);
  const { isFetching: isFetchingClassData, currentData: ClassData } = useClassGetDataQuery({});


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
      router.push(`/section?${allParams.toString()}`);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectClass = (value: any) => {
    if (value) {
      setParam({ ...param, classId: value.value });

    } else {
      setParam({ ...param, classId: undefined });

    }
  }
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
                render: ({ name }: any) => t(name as any),
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
