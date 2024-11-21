import { getTranslation } from "@/ni18n/i18n";
import { useLazySectionGetDataByIdQuery, useSectionRemoveMutation } from "@/services/admin/section";
 import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

const _logic = () => {
    const { t } = getTranslation();
    const router = useRouter()
    const params = useParams()
    const { id } = params
    const [SectionGetDataById, { currentData: DataSectionGetDataById, isFetching }] = useLazySectionGetDataByIdQuery()
    const [SectionRemove, { isLoading: isLoadingSectionRemove }] = useSectionRemoveMutation()
    useEffect(() => {
        if (id) {
            SectionGetDataById({ id: String(id) })
                .then((data) => {
                    if (!data.data) {
                        router.back();
                    }
                });
        }
    }, [id])

    const handleRemove = async () => {
        try {
            await SectionRemove({ id: String(id) }).unwrap();
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
        data: DataSectionGetDataById,
        isFetching: isFetching || !DataSectionGetDataById,
        id,
        handleRemove ,
        isLoadingSectionRemove

    }
}

export default _logic