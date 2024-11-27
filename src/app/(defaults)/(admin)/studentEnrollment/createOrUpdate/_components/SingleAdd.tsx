
import React from 'react'
import { FormValues } from './_logic';
import { Form, Formik, FormikProps } from 'formik';
import { InputForm } from '@/components/Form/inputForm';
import { ButtonForm } from '@/components/Form/ButtonForm';

import { DateTimeForm } from '@/components/Form/DateTimeForm';
import { UploadFileForm } from '@/components/Form/uploadFileForm';

const SingleAdd = ({
  t,
  data: DataStudentGetDataById,
  studentSchema,
  handleSubmit,
  isLoadingStudentUpdate,
}: {
  t: any,
  data: any,
  studentSchema: any,
  handleSubmit: any,
  isLoadingStudentUpdate: any
}) => {

  return (
    <Formik<FormValues>
      initialValues={{

        fullName: DataStudentGetDataById?.fullName ?? "",
        address: DataStudentGetDataById?.address,
        email: DataStudentGetDataById?.email,
        phone1: DataStudentGetDataById?.phone1 ?? "",
        phone2: DataStudentGetDataById?.phone2,
        birth: DataStudentGetDataById?.birth,
        enrollmentDate: DataStudentGetDataById?.enrollmentDate,
        photo: DataStudentGetDataById?.photo,
      }}
      validationSchema={studentSchema}
      onSubmit={handleSubmit}
    >
      {(props: FormikProps<any>) => (
        <Form className={"px-4 flex flex-col gap-4"}>
          <div className="Card flex flex-col gap-1">
            <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
              {t("StudentPage.infoStudent")}
            </div>
            <InputForm
              formikProps={props}
              name={"fullName"}
              title={t("StudentPage.fullName")}
              placeholder={t("StudentPage.enter-fullName")}
            />
            <DateTimeForm
              formikProps={props}
              name={"birth"}
              title={t("StudentPage.birth")}
              placeholder={t("StudentPage.enter-birth")}

            />
            <DateTimeForm
              formikProps={props}
              name={"enrollmentDate"}
              title={t("StudentPage.enrollmentDate")}
              placeholder={t("StudentPage.enter-enrollmentDate")}

            />
          </div>
          <div className="Card flex flex-col gap-1">
            <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
              {t("StudentPage.infoContact")}
            </div>

            <InputForm
              formikProps={props}
              name={"address"}
              title={t("StudentPage.address")}
              placeholder={t("StudentPage.enter-address")}
            />
            <InputForm
              formikProps={props}
              name={"email"}
              title={t("StudentPage.email")}
              placeholder={t("StudentPage.enter-email")}
            />
            <div className='flex gap-2 max-md:flex-col'>


              <InputForm
                formikProps={props}
                name={"phone1"}
                title={t("StudentPage.phone1")}
                placeholder={t("StudentPage.enter-phone1")}
                props={{
                  type: "tel"
                }}
              />
              <InputForm
                formikProps={props}
                name={"phone2"}
                title={t("StudentPage.phone2")}
                placeholder={t("StudentPage.enter-phone2")}
                props={{
                  type: "tel"
                }}
              />
            </div>
          </div>
          <div className="Card flex flex-col gap-1">
            <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("StudentPage.img-info")}</div>
            <UploadFileForm
              valueFileName={props.values.photo}
              formikProps={props}
              name={"photo"}
              title={t("StudentPage.photo")}
              placeholder={""}
            />
          </div>
          <div className="flex flex-row-reverse gap-2">
            <ButtonForm
              props={{
                type: "submit",

              }}
              title={t("common.save")}
              isLoading={isLoadingStudentUpdate}
            />
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default SingleAdd