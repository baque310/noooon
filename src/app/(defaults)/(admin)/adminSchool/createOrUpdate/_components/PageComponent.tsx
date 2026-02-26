"use client"



import * as Yup from 'yup';
import { getTranslation } from "@/ni18n/i18n";
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useSchoolGetDataQuery, useSchoolUpdateMutation } from '@/services/admin/School';
import { BackButton } from '@/components/common/BackButton';
import { LoadingForm } from '@/components/Form/loadingForm';
import { InputForm } from '@/components/Form/inputForm';
import { ButtonForm } from '@/components/Form/ButtonForm';

export interface FormValues {
  username?: string
  password?: string
  name: string
  address: string
  email: string
  phone1: string
  phone2: string

}
const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentData: DataSchoolGetDataById, isFetching } = useSchoolGetDataQuery()

  const [SchoolUpdate, { isLoading: isLoadingSchoolUpdate }] = useSchoolUpdateMutation();

  const handleSubmit = async (
    values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {


      await SchoolUpdate({ 
        name: values.name,
        address: values.address,
        email: values.email,
        phone1: values.phone1,
        phone2: values.phone2, 
      }
      ).unwrap()



      toast.success(t("common.updated-successfully"), { autoClose: 30000, });
      resetForm();
      // if (id) {
      router.back();
      // }
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message == `Resource already exists. More details: {"modelName":"Admin","target":"schools_email_key"}`) {
          return toast.error(t('SchoolPage.email-already-exists'), { autoClose: 30000 });

        }
        if (error.message == `username already exist`) {
          return toast.error(t('SchoolPage.username-already-exists'), { autoClose: 30000 });

        }
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };
  const schoolSchema = Yup.object().shape({
    name: Yup.string().required(t("common.this-field-is-required")),
    email: Yup.string().email(t("common.email-must-be-a-valid-email")).required(t("common.this-field-is-required")),
    phone1: Yup.string().required(t("common.this-field-is-required")),
    phone2: Yup.string().required(t("common.this-field-is-required")),
    address: Yup.string().required(t("common.this-field-is-required")),

  })



  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t("SchoolPage.update-info")} />
        {isFetching ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              name: DataSchoolGetDataById?.name ?? "",
              address: DataSchoolGetDataById?.address ?? "",
              email: DataSchoolGetDataById?.email ?? "",
              phone1: DataSchoolGetDataById?.phone1 ?? "",
              phone2: DataSchoolGetDataById?.phone2 ?? "",

            }}
            validationSchema={schoolSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>

                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("SchoolPage.infoSchool")}
                  </div>

                  <InputForm
                    formikProps={props}
                    name={"name"}
                    title={t("SchoolPage.name")}
                    placeholder={t("SchoolPage.enter-name")}
                  />
                  <InputForm
                    formikProps={props}
                    name={"address"}
                    title={t("SchoolPage.address")}
                    placeholder={t("SchoolPage.enter-address")}
                  />
                  <InputForm
                    formikProps={props}
                    name={"email"}
                    title={t("SchoolPage.email")}
                    placeholder={t("SchoolPage.enter-email")}
                  />
                  <div className='flex gap-2 max-md:flex-col'>


                    <InputForm
                      formikProps={props}
                      name={"phone1"}
                      title={t("SchoolPage.phone1")}
                      placeholder={t("SchoolPage.enter-phone1")}
                      props={{
                        type: "tel"
                      }}
                    />
                    <InputForm
                      formikProps={props}
                      name={"phone2"}
                      title={t("SchoolPage.phone2")}
                      placeholder={t("SchoolPage.enter-phone2")}
                      props={{
                        type: "tel"
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",

                    }}
                    title={t("common.save")}
                    isLoading={isLoadingSchoolUpdate}
                  />
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </>
  );
};

export default PageComponent

