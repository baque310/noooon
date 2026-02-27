"use client";
import { DataTable } from "mantine-datatable";
import React from "react";

import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { IRootState } from "@/store";
import { useSelector } from "react-redux";


const TableComponent = ({ isFetching, data }: { isFetching: boolean, data?: any[] }) => {
  const { t } = getTranslation();

  const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
  const { isMounted } = useMounted();


  return (
    <div className="datatables pagination-padding">
      {isMounted && (
        <DataTable
          fetching={isFetching}
          className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base !h-full `}
          records={data as any}
          columns={[
            {
              title: t("DashboardPage.examTypeName") || "نوع الامتحان",
              accessor: "examTypeName",
              render: ({ examTypeName }: any) => <div className="font-bold text-gray-800 dark:text-gray-200">{examTypeName}</div>
            },
            {
              title: t("DashboardPage.totalStudents") || "الطلاب الممتحنون",
              accessor: "totalStudents",
              render: ({ totalStudents }: any) => <div className="font-semibold">{totalStudents}</div>
            },
            {
              title: t("DashboardPage.passingCount") || "عدد الناجحين",
              accessor: "passingCount",
              render: ({ passingCount }: any) => <div className="text-green-600 font-semibold">{passingCount}</div>
            },
            {
              title: t("DashboardPage.passRate") || "نسبة النجاح",
              accessor: "passRate",
              render: ({ passRate }: any) => (
                <div className="flex items-center gap-2 min-w-[120px]">
                  <span className="text-green-600 font-bold w-12">{passRate}</span>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: passRate }}></div>
                  </div>
                </div>
              ),
            },
            {
              title: t("DashboardPage.failingCount") || "عدد الراسبين",
              accessor: "failingCount",
              render: ({ failingCount }: any) => <div className="text-red-500 font-semibold">{failingCount}</div>
            },
            {
              title: t("DashboardPage.failRate") || "نسبة الرسوب",
              accessor: "failRate",
              render: ({ failRate }: any) => (
                <div className="flex items-center gap-2 min-w-[120px]">
                  <span className="text-red-500 font-bold w-12">{failRate}</span>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: failRate }}></div>
                  </div>
                </div>
              ),
            },
          ]}
          customLoader={<div className="loader !bg-primary"></div>}
          noRecordsText={t("common.no-data")}
          noRecordsIcon={<></>}
          {... { minHeight: 130 } as any}
          totalRecords={data?.length}
          recordsPerPage={30}
        />
      )}
    </div>
  );
};

export default TableComponent 
