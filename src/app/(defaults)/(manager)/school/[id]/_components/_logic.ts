import { getTranslation } from "@/ni18n/i18n";
import { useLazySchoolGetDataByIdQuery } from "@/services/Manager/School";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const _logic = () => {
    const { t } = getTranslation();
    const router = useRouter()
    const params = useParams()
    const { id } = params
    const [SchoolGetDataById, { currentData: DataSchoolGetDataById, isFetching }] = useLazySchoolGetDataByIdQuery()
    useEffect(() => {
        if (id) {
            SchoolGetDataById({ id: String(id) })
                .then((data) => {
                    if (!data.data) {
                        router.back();
                    }
                });
        }
    }, [id])

    return {
        t,
        router,
        data: DataSchoolGetDataById,
        isFetching: isFetching || !DataSchoolGetDataById,
        id

    }
}

export default _logic