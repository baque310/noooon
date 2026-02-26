"use client";
import { DataTable } from "mantine-datatable";
import React, { useState } from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import { AddIcons } from "@/components/common/icons/Actions";
import PageComponent from "./PageComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { IRootState } from "@/store";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { AcademicTabs } from "@/components/common/AcademicTabs";



const TableComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
  const { isMounted } = useMounted();
  const { isFetching, currentData: data } = useStageGetDataQuery();
  const [open, setOpen] = useState(false)
  return (
    <div className={`m-4    rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <AcademicTabs selected="stage">
        <RolePageAndActionBasedComponent
          component={(props) => {
            return (
              <button
                className={` ${props.disabled && "hidden"
                  } flex justify-center gap-2 items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-2 px-4 rounded-xl font-bold shadow-sm `}
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
      </AcademicTabs>

      <div className={"flex justify-between items-center mb-4"}>
        <div className="text-xl font-bold text-slate-800 dark:text-white uppercase ">{t("StagePage.Stages")}</div>
      </div>
      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            onRowClick={async (item) => {
              router.push(`/stage/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data as any}
            columns={[
              {
                title: t("StagePage.name"),
                accessor: "name",
                // sortable: true,
                render: ({ name }: any) => t(name as any),
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


          />
        )}
      </div>
      <PageComponent open={open} setOpen={setOpen} />
    </div>
  );
};

export default withRole(TableComponent, "stage", ["read-any", "read-own"]);
