"use client";
import React from "react";

import { withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import { getTranslation } from "@/ni18n/i18n";
import { useDashboardGetDataQuery } from "@/services/admin/Dashboard";
import RowCard from "./RowCard";
import TableComponent from "./Table";
import RowCardMullite from "./RowCardMullite";
import { RowToday } from "./RowToday";
import { RowWeek } from "./RowWeek";
import { RowMonth } from "./RowMonth";
import { TopSummary } from "./TopSummary";

const RowComponent = () => {
  const { t } = getTranslation();
  const { currentData, isFetching } = useDashboardGetDataQuery()

  return (
    <div className={`m-4 flex-col flex gap-4`}>

      <TopSummary />

      {/* Exam Pass/Fail Rates Section */}
      <div className="w-full bg-white dark:bg-[#1a2941] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mt-2">
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex flex-col gap-1 items-start text-left rtl:text-right w-full">
            <h2 className="text-xl font-bold text-[#1f2937] dark:text-white">إحصائيات الامتحانات ونسب النجاح والرسوب</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              تفصيل لنتائج الامتحانات مقسمة حسب النوع، مبيناً إجمالي المُمتحنين، والناجحين، ونسب النجاح والرسوب المئوية.
            </p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
          <TableComponent data={currentData?.passFailRates} isFetching={isFetching} />
        </div>
      </div>

      <div className="gap-4 max-md:flex-col flex w-full">
        {/* <RowCardMullite
          title={t("DashboardPage.ThisToday")}
          numberAbsent={currentData?.attendanceCounts.today.Absent}
          numberPresent={currentData?.attendanceCounts.today.Present}
          numberVacation={currentData?.attendanceCounts.today.Vacation}
          titleAbsent={t("DashboardPage.absent")}
          titlePresent={t("DashboardPage.present")}
          titleVacation={t("DashboardPage.vacation")}
        /> */}
        <RowToday data={currentData} />
        <RowWeek data={currentData} />
        <RowMonth data={currentData} />
        {/* <RowCardMullite
          title={t("DashboardPage.ThisWeek")}
          numberAbsent={currentData?.attendanceCounts.week.Absent}
          numberPresent={currentData?.attendanceCounts.week.Present}
          numberVacation={currentData?.attendanceCounts.week.Vacation}
          titleAbsent={t("DashboardPage.absent")}
          titlePresent={t("DashboardPage.present")}
          titleVacation={t("DashboardPage.vacation")}
        /> */}
        {/* <RowCardMullite
          title={t("DashboardPage.ThisMonth")}
          numberAbsent={currentData?.attendanceCounts.month.Absent}
          numberPresent={currentData?.attendanceCounts.month.Present}
          numberVacation={currentData?.attendanceCounts.month.Vacation}
          titleAbsent={t("DashboardPage.absent")}
          titlePresent={t("DashboardPage.present")}
          titleVacation={t("DashboardPage.vacation")}
        /> */}
      </div>
    </div>
  );
};

export default withRole(RowComponent, "dashboard", ["read-any", "read-own"]);


