"use client";
import React from "react";

import { withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import { getTranslation } from "@/ni18n/i18n";
import { useRouter } from "next/navigation";
import RowCard from "./RowCard";
import { useDashboardGetDataQuery } from "@/services/Manager/Dashboard";

const RowComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();

  const { currentData, isFetching } = useDashboardGetDataQuery();

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
          title={t("DashboardPage.schoolCount")}
          number={currentData?.schoolCount.totalCount}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4 ">
        <RowCard
          title={t("DashboardPage.schoolCountHasBanner")}
          number={currentData?.schoolCount.hasBanner}
        />
        <RowCard
          title={t("DashboardPage.schoolCountHasNotBanner")}
          number={currentData?.schoolCount.hasNotBanner}
        />
      </div>
    </div>
  );
};

export default withRole(RowComponent, "dashboard", ["read-any", "read-own"]);
