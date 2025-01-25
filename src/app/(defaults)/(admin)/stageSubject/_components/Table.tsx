"use client";
import { DataTable } from "mantine-datatable";
import React from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { useStageSubjectGetDataQuery } from "@/services/admin/StageSubject";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";

import { AddIcons } from "@/components/common/icons/Actions";
import CreateComponent from "./CreateComponent";
import { useStageGetDataQuery } from "@/services/admin/stage";
import SelectFilter from "@/components/Filter/SelectFilter";


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
      stageId?: string;
      classId?: string;
      search?: string;
      range?: string;
    }
    | undefined
  >();
  const params = {
    sortBy: sortStatus.columnAccessor,
    sortDirection: sortStatus.direction,
    ...(search && { search: search as string }),
    ...param,
  };
  const { isFetching: isFetchingStageData, currentData: StageData } = useStageGetDataQuery();

  const { isFetching, currentData: data } = useStageSubjectGetDataQuery({
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

      router.push(`/stageSubject?${allParams.toString()}`);
      setPageNumber(1);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  const [open, setOpen] = useState(false)
  const handleSelectClass = (value: any) => {
    if (value) {
      setParam({ ...param, classId: value });

    } else {
      setParam({ ...param, classId: undefined, });

    }
  }

  const handleSelectStage = (value: any) => {
    if (value) {
      setParam({ ...param, stageId: value });

    } else {
      setParam({ ...param, stageId: undefined, classId: undefined });
    }
  }
  return (
    <div className={`m-4    rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("StageSubjectPage.StageSubject")}</div>
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
      <div className={"flex justify-start max-md:flex-col gap-3 mt-2   "}>
        <SelectFilter
          placement="bottom-end"
          title={t("StudentEnrollmentPage.StageName")}
          handleChange={handleSelectStage}
          options={StageData?.map((item) => {
            return {
              value: item.id,
              label: t(item.name as any),
            };
          }) ?? []
          }
        />

        {param?.stageId &&
          <SelectFilter
            title={t("SectionPage.ClassName")}
            placement="bottom-end"
            handleChange={handleSelectClass}
            options={StageData?.find(it => it.id == param?.stageId)?.Class?.map((item) => {
              return {
                value: item.id,
                label: t(item.name as any),
              };
            }) ?? []
            }
          />
        }



      </div>
      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            onRowClick={async (item) => {
              router.push(`/stageSubject/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data as any}
            columns={[
              {
                title: t("StageSubjectPage.SubjectName"),
                accessor: "Subject.name",
                // sortable: true,
              },
              {
                title: t("StageSubjectPage.StageName"),
                accessor: "Stage.name",
                // sortable: true,
                render: ({ Stage }: any) => (Stage ? <div>{t(Stage.name as any)}</div> : null),
              },
              {
                title: t("StageSubjectPage.ClassName"),
                accessor: "Class.name",
                // sortable: true,
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
          />
        )}
      </div>
      <CreateComponent open={open} setOpen={setOpen} />
    </div>
  );
};

export default withRole(TableComponent, "stage_subject", ["read-any", "read-own"]);
