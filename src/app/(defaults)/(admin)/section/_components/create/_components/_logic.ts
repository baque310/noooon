import { getTranslation } from "@/ni18n/i18n";
import { useClassGetDataQuery } from "@/services/admin/class";
import { useLazySectionGetDataByIdQuery, useSectionCreateMutation, useSectionUpdateMutation } from "@/services/admin/section";
import { FormikHelpers } from "formik";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
export interface FormValues {
    name: string
    classId: string
    isActive?: string
}
const useLogic = () => {

    const { t } = getTranslation();
    const router = useRouter();


    const params = useParams()
    const { id } = params
    const [SectionGetDataById, { currentData: DataSectionGetDataById, isFetching }] = useLazySectionGetDataByIdQuery()
    useEffect(() => {
        if (id) {
            SectionGetDataById({ id: String(id) })

        }
    }, [id])


    const [SectionCreate, { isLoading: isLoadingSectionCreate }] = useSectionCreateMutation();
    const [SectionUpdate, { isLoading: isLoadingSectionUpdate }] = useSectionUpdateMutation();
    const { currentData: classData, isFetching: isFetchingClass } = useClassGetDataQuery({});

    const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
        try {
            if (id) {
                await SectionUpdate({
                    id: id as string,
                    body: {
                        name: values.name,
                        isActive: values.isActive as string,
                    }

                }).unwrap()
            }
            else {
                await SectionCreate({
                    name: values.name,
                    classId: values.classId
                }).unwrap()
            }
            toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000, });
            resetForm();
            setOpen(false)

        } catch (error: any) {
            console.error("Failed to operation :", error);
            if (error) {
                if (error.message == "name already exist") {
                    return toast.error(t('SectionPage.name-already-exists'), { autoClose: 30000 });
                }

                return toast.error(JSON.stringify(error), { autoClose: 30000 });
            }
            toast.error(error, { autoClose: 30000 });
        }
    };
    const schoolSchema = Yup.object().shape({
        name: Yup.string().required(t("common.this-field-is-required")),
        ...id ? {
            isActive: Yup.string().required(t("common.this-field-is-required")),
        } : {
            classId: Yup.string().required(t("common.this-field-is-required")),
        }
    });

    return {
        t,
        router,
        schoolSchema,
        handleSubmit,
        isLoadingSectionUpdate: isLoadingSectionCreate || isLoadingSectionUpdate,
        classData,
        isFetchingClass,
        data: DataSectionGetDataById,
        isFetching,
        id
    }
}

export default useLogic