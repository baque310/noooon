import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";


const _logic = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
    const { isMounted } = useMounted();
    const { isFetching: isFetchingStage, currentData: dataStage } = useStageGetDataQuery();

    return {
        t,
        isMounted,
        router,
        data: dataStage,
        isFetching: isFetchingStage,
        isDark,
    }
}

export default _logic