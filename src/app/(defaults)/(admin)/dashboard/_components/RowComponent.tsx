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

const RowComponent = () => {
  const { t } = getTranslation();
  const { currentData, isFetching } = useDashboardGetDataQuery()

  return (
    <div className={`m-4 flex-col flex gap-4`}>

      <div className="grid md:grid-cols-4 gap-4 ">
        <RowCard
          title={t("DashboardPage.adminCount")}
          number={currentData?.adminCount}
        />
        <RowCard
          title={t("DashboardPage.teacherCount")}
          number={currentData?.teacherCount}
        />
        <RowCard
          title={t("DashboardPage.studentCount")}
          number={currentData?.studentCount}
        />
        <RowCard
          title={t("DashboardPage.busCount")}
          number={currentData?.busCount}
        />
      </div>

      <div className="gap-4  max-md:flex-col flex  w-full">
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
      <TableComponent data={currentData?.passFailRates} isFetching={isFetching} />
    </div>
  );
};

export default withRole(RowComponent, "dashboard", ["read-any", "read-own"]);


