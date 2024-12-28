"use client";
import * as Yup from "yup";
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import { LoadingForm } from "@/components/Form/loadingForm";
import { InputForm } from "@/components/Form/inputForm";
import { ButtonForm } from "@/components/Form/ButtonForm";
import { useEffect } from "react";
import { UploadFileForm } from "@/components/Form/uploadFileForm";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { BackButton } from "@/components/common/BackButton";
import { OptionType, SelectForm } from "@/components/Form/SelectForm";
import { AddSupperAdminPayload, Roles, useLazySupperAdminGetDataByIdQuery, useSupperAdminCreateMutation, useSupperAdminGetDataOwnRolesQuery, useSupperAdminUpdateMutation } from "@/services/admin/SupperAdmin";
import { getTranslation } from "@/ni18n/i18n";

interface FormValues extends AddSupperAdminPayload { }

const Page = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [AdminGetDataById, { currentData: DataAdminGetDataById, isFetching, isLoading }] =
    useLazySupperAdminGetDataByIdQuery();
  const { currentData: DataSupperAdminGetDataOwnRoles, isFetching: isFetchingSupperAdminGetDataOwnRoles } =
    useSupperAdminGetDataOwnRolesQuery();




  useEffect(() => {
    if (id) {
      AdminGetDataById({ id: String(id) })
    }
  }, [id]);



  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .matches(
        /^(?=.{5,20}$)(?![.])(?!.*[.]{2})[a-zA-Z0-9.\u0600-\u06FF]+(?<![.])$/,
        t("SupperAdminPage.username-must-be-5-20-characters-long-and-can-contain-letters,-numbers,-and-periods-It-cannot-start-or-end-with-a-period")
      )
      .required(t("common.this-field-is-required")),

    ...(id && {
      photo: Yup.string().required(t("common.this-field-is-required")),
    }),

    ...(!id && {
      password: Yup.string()
        .min(8, t("common.password-must-be-at-least-8-characters-long"))
        .matches(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          t("common.password-must-contain-letters-numbers-and-special-characters")
        )
        .required(t("common.this-field-is-required")),
    }),

    ...(id && {
      password: Yup.string()
        .nullable() // لجعل الحقل يمكن أن يكون فارغًا
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
    }),
    isActive: Yup.string().required(t("common.this-field-is-required")),
  });

  const [SupperAdminCreate, { isLoading: isLoadingSupperAdminCreate }] = useSupperAdminCreateMutation()
  const [SupperAdminUpdate, { isLoading: isLoadingSupperAdminUpdate }] = useSupperAdminUpdateMutation()
  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    try {
      const formData = new FormData();
      if (typeof values.photo === "string") {
        delete (values as any).photo;
      }
      for (const key in values) {
        if (key == "roles") {
          formData.append(
            "roles",
            JSON.stringify((values.roles as Roles[]).filter((value) => value.resource != ""))
          );
        } else if (key == "password") {
          values.password && formData.append(key, (values as any)[key]);
        } else {
          formData.append(key, (values as any)[key]);
        }
      }
      let res;
      if (id) {

        res = await SupperAdminUpdate({
          id: String(id),
          body: formData,
        }).unwrap();
      } else {
        res = await SupperAdminCreate(values).unwrap();
      }
      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), {
        autoClose: 30000,
      });
      resetForm();
      if (id) {
        router.back();
      } else {
        router.replace(`/supperAdmin/changeRole?id=${res?.id}`);
      }
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message == "username already exist") {
          return toast.error(t("SchoolPage.username-already-exists"), { autoClose: 30000 });

        }
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });

    }
  };


  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "common.update" : "common.add")} />
        {(isFetching || isLoading || isFetchingSupperAdminGetDataOwnRoles) ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              username: DataAdminGetDataById?.username ?? "",
              password: undefined,
              isActive: DataAdminGetDataById?.isActive ?? "TRUE",
              ...!id ? {
                roles: Array.isArray(DataSupperAdminGetDataOwnRoles) ? [...DataSupperAdminGetDataOwnRoles] : [],
              } : {
                photo: DataAdminGetDataById?.photo ?? "",
                roles: Array.isArray(DataAdminGetDataById?.roles) ? [...DataAdminGetDataById.roles] : [],
              } as any

            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("SupperAdminPage.user-information")}
                  </div>
                  <InputForm
                    formikProps={props}
                    name={"username"}
                    title={t("SupperAdminPage.username")}
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

                {id && (
                  <div className="Card flex flex-col gap-1">
                    <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                      {t("BusPage.img-info")}
                    </div>

                    <UploadFileForm
                      valueFileName={props.values.photo}
                      formikProps={props}
                      name={"photo"}
                      title={t("SupperAdminPage.photo")}
                      placeholder={""}
                    />
                  </div>
                )}

                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    title={t("common.save")}
                    isLoading={
                      isLoadingSupperAdminCreate || isLoadingSupperAdminUpdate
                    }
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

export default Page;


