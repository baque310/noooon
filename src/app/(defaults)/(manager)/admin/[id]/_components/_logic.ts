import { getTranslation } from "@/ni18n/i18n";
import { useLazyAdminGetDataByIdQuery } from "@/services/Manager/Admin";
 import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const _logic = () => {
    const { t } = getTranslation();
    const router = useRouter()
    const params = useParams()
    const { id } = params
    const [AdminGetDataById, { currentData: DataAdminGetDataById, isFetching }] = useLazyAdminGetDataByIdQuery()
    useEffect(() => {
        if (id) {
            AdminGetDataById({ id: String(id) })
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
        data: DataAdminGetDataById,
        isFetching: isFetching || !DataAdminGetDataById,
        id

    }
}

export default _logic