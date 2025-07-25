
import React from 'react'
 import { Form, Formik, FormikProps } from 'formik';
import { InputForm } from '@/components/Form/inputForm';
import { ButtonForm } from '@/components/Form/ButtonForm';

import { DateTimeForm } from '@/components/Form/DateTimeForm';
import { UploadFileForm } from '@/components/Form/uploadFileForm';
import { FormValues } from './PageComponent';

const SingleAdd = ({
  t,
  data: DataStudentGetDataById,
  studentSchema,
  handleSubmit,
  isLoadingStudentUpdate,
  id
}: {
  t: any,
  data: any,
  studentSchema: any,
  handleSubmit: any,
  isLoadingStudentUpdate: any
  id?: string | null
}) => {

  return (
    <Formik<FormValues>
      initialValues={{
        fullName: DataStudentGetDataById?.fullName ?? "",
        address: DataStudentGetDataById?.address?? "",
        email: DataStudentGetDataById?.email?? undefined,
        phone1: DataStudentGetDataById?.phone1 ?? "",
        phone2: DataStudentGetDataById?.phone2?? "",
        birth: DataStudentGetDataById?.birth?? "",
        enrollmentDate: DataStudentGetDataById?.enrollmentDate?? "",
        photo: DataStudentGetDataById?.photo?? "",
      }}
      validationSchema={studentSchema}
      onSubmit={handleSubmit}
    >
      {(props: FormikProps<any>) => (
        <Form className={"px-4 flex flex-col gap-8"}>
          {/* Student Information Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 rounded-3xl border border-blue-100 dark:border-gray-700 shadow-xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
                <pattern id="pattern-student" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="2" />
                </pattern>
                <rect width="100" height="100" fill="url(#pattern-student)" />
              </svg>
            </div>
            
            <div className="relative p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {t("StudentPage.infoStudent")}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {t("StudentPage.enterStudentPersonalInfo")}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              </div>
              
              <div className="mt-6">
                <DateTimeForm
                  formikProps={props}
                  name={"enrollmentDate"}
                  title={t("StudentPage.enrollmentDate")}
                  placeholder={t("StudentPage.enter-enrollmentDate")}
                />
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-cyan-900/20 rounded-3xl border border-emerald-100 dark:border-gray-700 shadow-xl">
            <div className="relative p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {t("StudentPage.infoContact")}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {t("StudentPage.contactDetailsAndAddress")}
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
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
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
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
            </div>
          </div>
          
          {/* Photo Upload Card */}
          {id && (
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-gray-900 dark:via-rose-900/20 dark:to-fuchsia-900/20 rounded-3xl border border-rose-100 dark:border-gray-700 shadow-xl">
              <div className="relative p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {t("StudentPage.img-info")}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {t("StudentPage.uploadStudentProfilePicture")}
                    </p>
                  </div>
                </div>
                
                <UploadFileForm
                  valueFileName={props.values.photo}
                  formikProps={props}
                  name={"photo"}
                  title={t("StudentPage.photo")}
                  placeholder={""}
                />
              </div>
            </div>
          )}
          
          {/* Action Bar */}
          <div className="relative bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 rounded-3xl"></div>
            <div className="relative flex flex-row-reverse gap-4">
                        <ButtonForm
              props={{
                type: "submit",
                className: "group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform flex items-center gap-3"
              }}
              title={
                <span className="relative flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {t("common.save")}
                  
                  {/* Loading Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </span>
              }
              isLoading={isLoadingStudentUpdate}
            />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default SingleAdd