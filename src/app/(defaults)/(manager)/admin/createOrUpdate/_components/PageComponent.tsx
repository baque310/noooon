"use client"


import React from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';
import * as Yup from 'yup';

import _logic from './_logic';
import { Form, Formik, FormikProps } from 'formik';
import { InputForm } from '@/components/Form/inputForm';
import { OptionType, SelectForm } from '@/components/Form/SelectForm';
import { RolePageAndActionBasedComponent } from '@/components/Provider/RolePageAndActionBasedComponent';
import { ButtonForm } from '@/components/Form/ButtonForm';

const PageComponent = () => {
  const { t,
    router,
    data: DataAdminGetDataById,
    isFetching: isFetching,
    id,
    managerAdminSchema,
    handleSubmit,
    isLoadingAdminUpdate, } = _logic();

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
              password: "",

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
                      { label: t("common.isActive"), value: "true" },
                      { label: t("common.isNotActive"), value: "false" },
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
                  {
                    <RolePageAndActionBasedComponent
                      component={(props) => {
                        return (
                          <ButtonForm
                            props={{
                              className: `${props?.disabled && "hidden"}`,
                            }}
                            title={t("common.save")}
                            isLoading={isLoadingAdminUpdate}
                          />
                        );
                      }}
                      resource={"admin"}
                      permission={["update-any", "update-own"]}
                    />
                  }

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

