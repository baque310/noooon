import { getTranslation } from "@/ni18n/i18n";
import { useClassRemoveMutation, useLazyClassGetDataByIdQuery } from "@/services/admin/class";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

const useLogic = () => {
    const { t } = getTranslation();
    const router = useRouter()
    const params = useParams()
    const { id } = params
    const [ClassGetDataById, { currentData: DataClassGetDataById, isFetching }] = useLazyClassGetDataByIdQuery()
    const [ClassRemove, { isLoading: isLoadingClassRemove }] = useClassRemoveMutation()
    useEffect(() => {
        if (id) {
            ClassGetDataById({ id: String(id) })
                .then((data) => {
                    if (!data.data) {
                        router.back();
                    }
                });
        }
    }, [id])

    const handleRemove = async () => {
        try {
            await ClassRemove({ id: String(id) }).unwrap();
            toast.success(t('common.deleted-successfully'), { autoClose: 15000 });
            router.back();
        } catch (error: any) {
            console.error('Failed to operation :', error);
            if (error && error.message) {
                return toast.error(error.message, { autoClose: 15000 });
            }
            toast.error(error, { autoClose: 15000 });
        }
    };
    return {
        t,
        router,
        data: DataClassGetDataById,
        isFetching: isFetching || !DataClassGetDataById,
        id,
        handleRemove ,
        isLoadingClassRemove

    }
}

export default useLogic