"use client";

import React from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";

import { Form, Formik, FormikProps } from "formik";
import { InputForm } from "@/components/Form/inputForm";
import { OptionType, SelectForm } from "@/components/Form/SelectForm";
import { RolePageAndActionBasedComponent } from "@/components/Provider/RolePageAndActionBasedComponent";
import { ButtonForm } from "@/components/Form/ButtonForm";
import { getTranslation } from "@/ni18n/i18n";
import {
  AddAdminPayload,
  useLazyAdminGetDataByIdQuery,
  useAdminUpdateMutation,
} from "@/services/Manager/Admin";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
interface FormValues extends AddAdminPayload {}
const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [AdminGetDataById, { currentData: DataAdminGetDataById, isFetching }] =
    useLazyAdminGetDataByIdQuery();
  useEffect(() => {
    if (id) {
      AdminGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);
  const [AdminUpdate, { isLoading: isLoadingAdminUpdate }] =
    useAdminUpdateMutation();

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    try {
      if (id) {
        if (!values.password) {
          delete (values as any).password;
        }
        await AdminUpdate({
          body: {
            ...values,
          },
          id: String(id),
        }).unwrap();
      }

      toast.success(t("common.updated-successfully"), { autoClose: 30000 });
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
        t("common.username-must-be-5-20-characters")
      )
      .required(t("common.this-field-is-required")),

    password: Yup.string()
      .nullable()
      .test(
        "is-strong-password",
        t(
          "common.password-must-contain-letters-numbers-and-special-characters"
        ),
        (value) => {
          if (!value) return true;
          return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            value
          );
        }
      )
      .min(8, t("common.password-must-be-at-least-8-characters-long")),
    isActive: Yup.string().required(t("common.this-field-is-required")),
  });

  type AdminSchema = Yup.InferType<typeof managerAdminSchema>;

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t("AdminPage.update-info")} />
        {isFetching ? (
          <LoadingForm />
        ) : (
          <Formik<AdminSchema | any>
            initialValues={{
              username: DataAdminGetDataById?.username ?? "",
              isActive: DataAdminGetDataById?.isActive ?? "",
              password: undefined,
            }}
            validationSchema={managerAdminSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("AdminPage.user-information")}
                  </div>
                  <InputForm
                    formikProps={props}
                    name={"username"}
                    title={t("signInPage.username")}
                    placeholder={t("signInPage.enter-username")}
                  />

                  <InputForm
                    formikProps={props}
                    name={"password"}
                    title={t("signInPage.password")}
                    placeholder={t("signInPage.enter-password")}
                    isPassword={true}
                  />

                  <SelectForm
                    formikProps={props}
                    name={"isActive"}
                    title={t("common.status")}
                    placeholder={t("common.choses-status")}
                    options={[
                      { label: t("common.isActive"), value: "TRUE" },
                      { label: t("common.isNotActive"), value: "FALSE" },
                    ]}
                    props={{
                      isClearable: true,
                      onChange(val) {
                        props.setFieldValue(
                          `isActive`,
                          (val as OptionType)?.value ?? ""
                        );
                      },
                    }}
                  />
                </div>

                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{}}
                    title={t("common.save")}
                    isLoading={isLoadingAdminUpdate}
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

export default PageComponent;
