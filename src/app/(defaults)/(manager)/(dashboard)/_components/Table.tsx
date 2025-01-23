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
          className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base  border border-dark-dark-light !h-full `}
          records={data as any}
          columns={[
            {
              title: t("DashboardPage.examTypeName"),
              accessor: "examTypeName",
            },
            {
              title: t("DashboardPage.totalStudents"),
              accessor: "totalStudents",
            },
            {
              title: t("DashboardPage.passingCount"),
              accessor: "passingCount",
            },
            {
              title: t("DashboardPage.passRate"),
              accessor: "passRate",
            },
            {
              title: t("DashboardPage.failingCount"),
              accessor: "failingCount",
            },
            {
              title: t("DashboardPage.failRate"),
              accessor: "failRate",
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
