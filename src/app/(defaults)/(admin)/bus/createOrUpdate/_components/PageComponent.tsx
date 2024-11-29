"use client"

import React from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';

import { getTranslation } from "@/ni18n/i18n";
import { AddBusPayload, useLazyBusGetDataByIdQuery, useBusCreateMutation, useBusUpdateMutation } from "@/services/admin/bus";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
export interface FormValues extends AddBusPayload {

}
import { ButtonForm } from '@/components/Form/ButtonForm';
import { Form, Formik, FormikProps } from 'formik';
import { InputForm } from '@/components/Form/inputForm'; 
import { UploadFileForm } from '@/components/Form/uploadFileForm';

const PageComponent = () => {
  const { t } = getTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id"); 
    const [BusGetDataById, { currentData: data, isFetching }] = useLazyBusGetDataByIdQuery()
    useEffect(() => {
        if (id) {
            BusGetDataById({ id: String(id) })
                .then((data) => {
                    if (!data.data) {
                        router.back();
                    }
                });
        }
    }, [id]) 

    const [BusCreate, { isLoading: isLoadingBusCreate }] = useBusCreateMutation();
    const [BusUpdate, { isLoading: isLoadingBusUpdate }] = useBusUpdateMutation();

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
                await BusUpdate({
                    body: formData,
                    id: String(id),
                }
                ).unwrap()

            } else {
                await BusCreate({
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
                return toast.error(JSON.stringify(error), { autoClose: 30000 });
            }
            toast.error(error, { autoClose: 30000 });
        }
    };
  
    const busSchema = Yup.object().shape({
        fullName: Yup.string().required(t("common.this-field-is-required")),
        phone1: Yup.string().required(t("common.this-field-is-required")),
    }) 


  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "BusPage.update-info" : "BusPage.add")} />

        {isFetching ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{

              fullName: data?.fullName ?? "",
              address: data?.address,
              carColor: data?.carColor,
              phone1: data?.phone1 ?? "",
              phone2: data?.phone2,
              carNumber: data?.carNumber,
              carType: data?.carType,
              photo: data?.photo,
            }}
            validationSchema={busSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("BusPage.infoBus")}
                  </div>
                  <InputForm
                    formikProps={props}
                    name={"fullName"}
                    title={t("BusPage.fullName")}
                    placeholder={t("BusPage.enter-fullName")}
                  />
                  <InputForm
                    formikProps={props}
                    name={"carType"}
                    title={t("BusPage.carType")}
                    placeholder={t("BusPage.enter-carType")}

                  />
                  <InputForm
                    formikProps={props}
                    name={"carNumber"}
                    title={t("BusPage.carNumber")}
                    placeholder={t("BusPage.enter-carNumber")}

                  />
                  <InputForm
                    formikProps={props}
                    name={"carColor"}
                    title={t("BusPage.carColor")}
                    placeholder={t("BusPage.enter-carColor")}

                  />
                </div>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("BusPage.infoContact")}
                  </div> 
                  <InputForm
                    formikProps={props}
                    name={"address"}
                    title={t("BusPage.address")}
                    placeholder={t("BusPage.enter-address")}
                  /> 
                  <div className='flex gap-2 max-md:flex-col'> 
                    <InputForm
                      formikProps={props}
                      name={"phone1"}
                      title={t("BusPage.phone1")}
                      placeholder={t("BusPage.enter-phone1")}
                      props={{
                        type: "tel"
                      }}
                    />
                    <InputForm
                      formikProps={props}
                      name={"phone2"}
                      title={t("BusPage.phone2")}
                      placeholder={t("BusPage.enter-phone2")}
                      props={{
                        type: "tel"
                      }}
                    />
                  </div>
                </div>
                {id && <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("BusPage.img-info")}</div>
                  <UploadFileForm
                    valueFileName={props.values.photo}
                    formikProps={props}
                    name={"photo"}
                    title={t("BusPage.photo")}
                    placeholder={""}
                  />
                </div>}
                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",

                    }}
                    title={t("common.save")}
                    isLoading={isLoadingBusUpdate ||isLoadingBusCreate}
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

