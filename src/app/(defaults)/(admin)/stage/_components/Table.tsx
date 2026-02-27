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
      <div className="mt-4">
        {/* List Header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr] gap-4 px-6 py-4 bg-primary/5 dark:bg-primary/10 rounded-xl mb-4 text-primary font-extrabold text-sm">
          <div className="text-start">اسم المرحلة</div>
          <div className="text-center">تاريخ الإنشاء</div>
        </div>

        {/* List Body */}
        <div className="flex flex-col gap-3">
          {isFetching ? (
            <div className="flex justify-center items-center py-16">
              <div className="loader !bg-primary !w-8 !h-8" />
            </div>
          ) : data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400 dark:text-gray-500">
              <p className="font-bold text-sm">{t("common.no-data")}</p>
            </div>
          ) : (
            (data as any[])?.map((item: any) => (
              <div
                key={item.id}
                onClick={() => router.push(`/stage/${item.id}`)}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 items-center px-6 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <div className="font-extrabold text-gray-800 dark:text-gray-200 text-center md:text-start">
                  {t(item.name as any)}
                </div>
                <div className="font-bold text-gray-500 dark:text-gray-400 text-sm text-center">
                  {item.createdAt ? moment(item.createdAt).format("YYYY-MM-DD") : "—"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <PageComponent open={open} setOpen={setOpen} />
    </div>
  );
};

export default withRole(TableComponent, "stage", ["read-any", "read-own"]);
