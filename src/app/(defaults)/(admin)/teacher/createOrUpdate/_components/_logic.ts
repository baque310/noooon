import { getTranslation } from "@/ni18n/i18n";
import { AddTeacherPayload, useLazyTeacherGetDataByIdQuery, useTeacherCreateMutation, useTeacherUpdateMutation } from "@/services/admin/teacher";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
export interface FormValues extends AddTeacherPayload {

}
export interface FormValuesMulti {
    teachersData: {
        id: number;
        fullName: string;
        phone1: string;
    }[]
}
const useLogic = () => {

    const { t } = getTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [selected, setSelected] = useState("add")
    const [TeacherGetDataById, { currentData: DataTeacherGetDataById, isFetching }] = useLazyTeacherGetDataByIdQuery()
    useEffect(() => {
        if (id) {
            TeacherGetDataById({ id: String(id) })
                .then((data) => {
                    if (!data.data) {
                        router.back();
                    }
                });
        }
    }, [id])
    console.log("data.data", DataTeacherGetDataById);

    const [TeacherCreate, { isLoading: isLoadingTeacherCreate }] = useTeacherCreateMutation();
    const [TeacherUpdate, { isLoading: isLoadingTeacherUpdate }] = useTeacherUpdateMutation();

    const handleSubmit = async (
        values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
        try {

            const formData = new FormData();
            if (typeof values.photo === "string") {
                delete (values as any).url;
            }
            for (const key in values) {
                if ((values as any)[key]) {
                    formData.append(key, (values as any)[key]);
                }
            }

            if (id) {
                await TeacherUpdate({
                    body: formData,
                    id: String(id),
                }
                ).unwrap()

            } else {
                await TeacherCreate({
                    ...values

                }).unwrap()
            }
            toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000, });
            resetForm();
            if (id) {
                router.back();
            }
        } catch (error: any) {
            console.error("Failed to operation :", error);
            if (error) {
                if (error.message == `Resource already exists. More details: {\"modelName\":\"Teacher\",\"target\":\"teachers_email_key\"}`) {
                    return toast.error(t('TeacherPage.email-already-exists'), { autoClose: 30000 });
                }
                return toast.error(JSON.stringify(error), { autoClose: 30000 });
            }
            toast.error(error, { autoClose: 30000 });
        }
    };
  
    const teacherSchema = Yup.object().shape({
        fullName: Yup.string().required(t("common.this-field-is-required")),
        phone1: Yup.string().required(t("common.this-field-is-required")),
    }) 

    return {
        t,
        router,
        data: DataTeacherGetDataById,
        isFetching: isFetching,
        id,
        teacherSchema,
        handleSubmit,
        isLoadingTeacherUpdate: isLoadingTeacherUpdate || isLoadingTeacherCreate,
        selected,
        setSelected
    }
}

export default useLogic