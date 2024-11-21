import { getTranslation } from "@/ni18n/i18n";
import { AddAdminPayload, useLazyAdminGetDataByIdQuery, useAdminUpdateMutation } from "@/services/Manager/Admin";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
interface FormValues extends AddAdminPayload { }
const useLogic = () => {

    const { t } = getTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
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
    const [AdminUpdate, { isLoading: isLoadingAdminUpdate }] = useAdminUpdateMutation();

    const handleSubmit = async (
        values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
        try {

            if (id) {
                await AdminUpdate({
                    body: {
                        ...values,
                    },
                    id: String(id),
                }
                ).unwrap()

            }

            toast.success(t("common.updated-successfully"), { autoClose: 30000, });
            resetForm();
            if (id) {
                router.back();
            }
        } catch (error: any) {
            console.error("Failed to operation :", error);
            if (error) {
                return toast.error(JSON.stringify(error), { autoClose: 30000 });
            }
            toast.error(error, { autoClose: 30000 });
        }
    };
    const managerAdminSchema = Yup.object().shape({
        username: Yup.string()
            .matches(
                /^(?=.{5,20}$)(?![.])(?!.*[.]{2})[a-zA-Z0-9.\u0600-\u06FF]+(?<![.])$/,
                t(
                    "common.username-must-be-5-20-characters"
                )
            )
            .required(t("common.this-field-is-required")),

        password: Yup.string()
            .nullable()  
            .test(
                "is-strong-password",
                t("common.password-must-contain-letters-numbers-and-special-characters"),
                (value) => {
                    if (!value) return true;
                    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
                        value
                    );
                }
            )
            .min(8, t("common.password-must-be-at-least-8-characters-long")),
        isActive: Yup.string().required(t("common.this-field-is-required")),
    })



    return {
        t,
        router,
        data: DataAdminGetDataById,
        isFetching: isFetching,
        id,
        managerAdminSchema,
        handleSubmit,
        isLoadingAdminUpdate,

    }
}

export default useLogic