"use client";
import React from "react";

import { getTranslation } from "@/ni18n/i18n";
import { useGetAdminCountQuery } from "@/services/admin/Dashboard";
import RowCard from "./RowCard";

const AdminCountRowComponent = () => {
  const { t } = getTranslation();
  const { currentData, isFetching } = useGetAdminCountQuery();

  return (
    <div className={`m-4 flex-col flex gap-4`}>
      <div className="grid md:grid-cols-4 gap-4 ">
        {/* <RowCard
          title={t("DashboardPage..attendanceTodayPresent")}
          number={currentData?.attendanceToday.Present}
        />
        <RowCard
          title={t("DashboardPage..attendanceTodayAbsent")}
          number={currentData?.attendanceToday.Absent}
        />
        <RowCard
          title={t("DashboardPage..attendanceTodayVacation")}
          number={currentData?.attendanceToday.Vacation}
        />

        <RowCard
          title={t("DashboardPage.homeworkCountToday")}
          number={currentData?.homeworkCountToday}
        />
        <RowCard
          title={t("DashboardPage.complaintsCount")}
          number={currentData?.complaintsCount}
        />
        <RowCard
          title={t("DashboardPage.lessonsCountToday")}
          number={currentData?.lessonsCountToday}
        /> */}
      </div>
    </div>
  );
};

export default AdminCountRowComponent;
