import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { useClassGetDataQuery } from "@/services/admin/class";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";


const useLogic = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const search = searchParams.get("search") || "";
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: "createdAt",
        direction: "desc",
    });

    const [param, setParam] = useState<
        | {
            search?: string;
            stageId?: string;
        }
        | undefined
    >();
    const params = {
        sortBy: sortStatus.columnAccessor,
        sortDirection: sortStatus.direction,
        ...(search && { search: search as string }),
        ...param,
    };

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
    const { isMounted } = useMounted();
    const { isFetching: isFetchingClass, currentData: dataClass } = useClassGetDataQuery(params);
    const { isFetching: isFetchingStageData, currentData: StageData } = useStageGetDataQuery();


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
            router.push(`/class?${allParams.toString()}`);
        }
    };
    const handleKeyPress = (event: any) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    const handleSelectStage = (value: any) => {
        if (value) {
            setParam({ ...param, stageId: value.value });

        } else {
            setParam({ ...param, stageId: undefined });

        }
    }

    return {
        t,
        isMounted,
        router,
        data: dataClass,
        isFetching: isFetchingClass,
        isDark,
        Search,
        handleKeyPress,
        handleChange,
        handleSelectStage,
        StageData,
        isFetchingStageData,
        setSortStatus,
        sortStatus

    }
}

export default useLogic