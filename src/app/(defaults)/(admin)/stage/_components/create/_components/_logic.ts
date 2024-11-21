import { getTranslation } from "@/ni18n/i18n";
import { useLazyStageGetDataByIdQuery, useStageCreateMutation } from "@/services/admin/stage";
import { FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
 import { toast } from "react-toastify";
import * as Yup from 'yup';
export interface FormValues {
    name: string
}
const useLogic = () => {

    const { t } = getTranslation();
    const router = useRouter();


    const [StageCreate, { isLoading: isLoadingStageCreate }] = useStageCreateMutation();

    const handleSubmit = async (
        values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
        try {

            await StageCreate({
                name: values.name,

            }).unwrap()

            toast.success(t("common.added-successfully"), { autoClose: 30000, });
            resetForm();

        } catch (error: any) {
            console.error("Failed to operation :", error);
            if (error) {
                if (error.message=="name already exist") {
                    return toast.error(t('StagePage.name-already-exists'), { autoClose: 30000 });
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
        isLoadingStageUpdate: isLoadingStageCreate,
    

    }
}

export default useLogic