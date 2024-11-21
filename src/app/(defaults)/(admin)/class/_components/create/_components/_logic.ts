import { getTranslation } from "@/ni18n/i18n";
import { useClassCreateMutation, useClassUpdateMutation, useLazyClassGetDataByIdQuery } from "@/services/admin/class";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { FormikHelpers } from "formik";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
export interface FormValues {
    name: string
    stageId: string
}
const _logic = () => {

    const { t } = getTranslation();
    const router = useRouter();


    const params = useParams()
    const { id } = params
    const [ClassGetDataById, { currentData: DataClassGetDataById, isFetching }] = useLazyClassGetDataByIdQuery()
    useEffect(() => {
        if (id) {
            ClassGetDataById({ id: String(id) })

        }
    }, [id])


    const [ClassCreate, { isLoading: isLoadingClassCreate }] = useClassCreateMutation();
    const [ClassUpdate, { isLoading: isLoadingClassUpdate }] = useClassUpdateMutation();
    const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();

    const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
        try {
            if (id) {
                await ClassUpdate({
                    id: id as string,
                    body: {
                        name: values.name
                    }

                }).unwrap()
            }
            else {
                await ClassCreate({
                    name: values.name,
                    stageId: values.stageId
                }).unwrap()
            }
            toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000, });
            resetForm();
            setOpen(false)

        } catch (error: any) {
            console.error("Failed to operation :", error);
            if (error) {
                if (error.message == "name already exist") {
                    return toast.error(t('ClassPage.name-already-exists'), { autoClose: 30000 });
                }

                return toast.error(JSON.stringify(error), { autoClose: 30000 });
            }
            toast.error(error, { autoClose: 30000 });
        }
    };
    const schoolSchema = Yup.object().shape({
        name: Yup.string().required(t("common.this-field-is-required")),
    });

    return {
        t,
        router,
        schoolSchema,
        handleSubmit,
        isLoadingClassUpdate: isLoadingClassCreate || isLoadingClassUpdate,
        stage,
        isFetchingStage,
        data: DataClassGetDataById,
        isFetching,
        id
    }
}

export default _logic