import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { useStudentEnrollmentGetDataQuery } from "@/services/admin/studentEnrollment";
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

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
    const { isMounted } = useMounted();

    const [pageNumber, setPageNumber] = useState(Number(1));

    const [param, setParam] = useState<
        | {
            approval_status?: string;
            search?: string;
            range?: string;
        }
        | undefined
    >();
    const params = {
        skip: pageNumber,
        take: 30,
        sortBy: sortStatus.columnAccessor,
        sortDirection: sortStatus.direction,
        ...(search && { search: search as string }),
        ...param,
    };

    const { isFetching: isFetchingStudentEnrollment, currentData: dataStudentEnrollment } = useStudentEnrollmentGetDataQuery({
        ...params,
    });

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
            // router.push({
            //     pathname: router.pathname,
            //     query: { ...router.query, search: value ?? Search },
            // });
            allParams.set("search", value ?? Search);

            router.push(`/studentEnrollment?${allParams.toString()}`);
            setPageNumber(1);
        }
    };
    const handleKeyPress = (event: any) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    return {
        t,
        isMounted,
        router,
        data: dataStudentEnrollment,
        isFetching: isFetchingStudentEnrollment,
        handleChange,
        handleSearch,
        handleKeyPress,
        pageNumber,
        setPageNumber,
        setSortStatus,
        sortStatus,
        Search,
        isDark,
    }
}

export default useLogic