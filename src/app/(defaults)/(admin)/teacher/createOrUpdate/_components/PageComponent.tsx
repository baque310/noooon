"use client"

import React from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';

import useLogic, { FormValues } from './_logic';
import { ButtonForm } from '@/components/Form/ButtonForm';
import { Form, Formik, FormikProps } from 'formik';
import { InputForm } from '@/components/Form/inputForm';
import { DateTimeForm } from '@/components/Form/DateTimeForm';
import { UploadFileForm } from '@/components/Form/uploadFileForm';

const PageComponent = () => {
  const { t,
    isFetching: isFetching,
    id,
    selected,
    setSelected,
    data,
    teacherSchema,
    handleSubmit,
    isLoadingTeacherUpdate,


  } = useLogic();

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "TeacherPage.update-info" : "TeacherPage.add")} />

        {isFetching ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{

              fullName: data?.fullName ?? "",
              address: data?.address,
              email: data?.email,
              phone1: data?.phone1 ?? "",
              phone2: data?.phone2,
              birth: data?.birth,
              hiringDate: data?.hiringDate,
              photo: data?.photo,
            }}
            validationSchema={teacherSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("TeacherPage.infoTeacher")}
                  </div>
                  <InputForm
                    formikProps={props}
                    name={"fullName"}
                    title={t("TeacherPage.fullName")}
                    placeholder={t("TeacherPage.enter-fullName")}
                  />
                  <DateTimeForm
                    formikProps={props}
                    name={"birth"}
                    title={t("TeacherPage.birth")}
                    placeholder={t("TeacherPage.enter-birth")}

                  />
                  <DateTimeForm
                    formikProps={props}
                    name={"hiringDate"}
                    title={t("TeacherPage.hiringDate")}
                    placeholder={t("TeacherPage.enter-hiringDate")}

                  />
                </div>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("TeacherPage.infoContact")}
                  </div>

                  <InputForm
                    formikProps={props}
                    name={"address"}
                    title={t("TeacherPage.address")}
                    placeholder={t("TeacherPage.enter-address")}
                  />
                  <InputForm
                    formikProps={props}
                    name={"email"}
                    title={t("TeacherPage.email")}
                    placeholder={t("TeacherPage.enter-email")}
                  />
                  <div className='flex gap-2 max-md:flex-col'>


                    <InputForm
                      formikProps={props}
                      name={"phone1"}
                      title={t("TeacherPage.phone1")}
                      placeholder={t("TeacherPage.enter-phone1")}
                      props={{
                        type: "tel"
                      }}
                    />
                    <InputForm
                      formikProps={props}
                      name={"phone2"}
                      title={t("TeacherPage.phone2")}
                      placeholder={t("TeacherPage.enter-phone2")}
                      props={{
                        type: "tel"
                      }}
                    />
                  </div>
                </div>
                {id && <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("TeacherPage.img-info")}</div>
                  <UploadFileForm
                    valueFileName={props.values.photo}
                    formikProps={props}
                    name={"photo"}
                    title={t("TeacherPage.photo")}
                    placeholder={""}
                  />
                </div>}
                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",

                    }}
                    title={t("common.save")}
                    isLoading={isLoadingTeacherUpdate}
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

