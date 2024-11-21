import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { useClassGetDataQuery } from "@/services/admin/class";
import { useSectionGetDataQuery } from "@/services/admin/section";
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
            classId?: string;
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
    const { isFetching: isFetchingSection, currentData: dataSection } = useSectionGetDataQuery(params);
    const { isFetching: isFetchingClassData, currentData: ClassData } = useClassGetDataQuery({});


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
            router.push(`/section?${allParams.toString()}`);
        }
    };
    const handleKeyPress = (event: any) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    const handleSelectClass = (value: any) => {
        if (value) {
            setParam({ ...param, classId: value.value });

        } else {
            setParam({ ...param, classId: undefined });

        }
    }

    return {
        t,
        isMounted,
        router,
        data: dataSection,
        isFetching: isFetchingSection,
        isDark,
        Search,
        handleKeyPress,
        handleChange,
        handleSelectClass,
        ClassData,
        isFetchingClassData,
        setSortStatus,
        sortStatus

    }
}

export default useLogic