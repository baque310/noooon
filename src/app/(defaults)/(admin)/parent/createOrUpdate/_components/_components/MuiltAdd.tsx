import React from "react";
import { FieldArray, Form, Formik, FormikProps } from "formik";
import { InputForm } from "@/components/Form/inputForm";
import { ButtonForm } from "@/components/Form/ButtonForm";
import { FormValuesMulti } from "./PageComponent";

const MuiltAdd = ({
  t,
  studentSchemaMulti,
  handleSubmitMulti,
  isLoadingStudentCreateMulti,
}: {
  t: any;
  studentSchemaMulti: any;
  handleSubmitMulti: any;
  isLoadingStudentCreateMulti: any;
}) => {
  return (
    <Formik<FormValuesMulti>
      initialValues={{
        studentsData: [
          {
            id: Math.random(),
            s_name: "",
            s_phone: "",
            p_name: "",
            p_phone: "",
          },
        ],
      }}
      validationSchema={studentSchemaMulti}
      onSubmit={handleSubmitMulti}
    >
      {(props: FormikProps<any>) => (
        <Form className={"px-4 flex flex-col gap-8"}>
          {/* Modern Header Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 border border-blue-100 dark:border-gray-700">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
                <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="2" />
                </pattern>
                <rect width="100" height="100" fill="url(#pattern)" />
              </svg>
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {t("StudentPage.infoStudent")}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {t("StudentPage.addMultipleStudentsDesc")}
                  </p>
                </div>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {props.values.studentsData.length} {props.values.studentsData.length === 1 ? t("StudentPage.student") : t("StudentPage.students")}
                </span>
              </div>
            </div>
          </div>
          
          {/* Students Container */}
          <div className="space-y-6">
            <FieldArray name="studentsData">
              {({ insert, remove, push, replace }) => (
                <div className="space-y-6">
                  {props.values.studentsData?.map(
                    (item: any, index: number) => {
                      return (
                        <div
                          key={index}
                          className="group relative bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
                        >
                          {/* Gradient Header */}
                          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[1px] rounded-t-3xl">
                            <div className="bg-white dark:bg-gray-800 rounded-t-3xl p-6">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                  {/* Animated Student Number */}
                                  <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                      {index + 1}
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                      {t("StudentPage.student")} #{index + 1}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                      {t("StudentPage.completeStudentParentInfo")}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Enhanced Remove Button */}
                                {props.values.studentsData.length > 1 && (
                                  <button
                                    className="group/btn relative flex items-center justify-center w-10 h-10 bg-red-50 hover:bg-red-500 dark:bg-red-900/20 dark:hover:bg-red-500 border border-red-200 dark:border-red-800 text-red-500 hover:text-white rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-90"
                                    type="button"
                                    onClick={() => remove(index)}
                                    title={t("common.remove")}
                                  >
                                    <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Content Area */}
                          <div className="p-6 space-y-6">
                            {/* Student Information Card */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                                  {t("StudentPage.studentInfo")}
                                </h4>
                              </div>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <InputForm
                                  className="w-full"
                                  formikProps={props}
                                  name={`studentsData.${index}.s_name`}
                                  title={t("StudentPage.studentFullName")}
                                  placeholder={t("StudentPage.enter-studentFullName")}
                                />
                                <InputForm
                                  className="w-full"
                                  formikProps={props}
                                  name={`studentsData.${index}.s_phone`}
                                  title={t("StudentPage.studentPhone")}
                                  placeholder={t("StudentPage.enter-studentPhone")}
                                  props={{
                                    type: "tel",
                                    ...(props.values.studentsData &&
                                      props.values.studentsData[index] &&
                                      props.values.studentsData[index].s_phone && {
                                        dir: "ltr",
                                      }),
                                  }}
                                />
                              </div>
                            </div>

                            {/* Parent Information Card */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                  </svg>
                                </div>
                                <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-300">
                                  {t("StudentPage.parentInfo")}
                                </h4>
                              </div>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <InputForm
                                  className="w-full"
                                  formikProps={props}
                                  name={`studentsData.${index}.p_name`}
                                  title={t("StudentPage.parentFullName")}
                                  placeholder={t("StudentPage.enter-parentFullName")}
                                />
                                <InputForm
                                  className="w-full"
                                  formikProps={props}
                                  name={`studentsData.${index}.p_phone`}
                                  title={t("StudentPage.parentPhone")}
                                  placeholder={t("StudentPage.enter-parentPhone")}
                                  props={{
                                    type: "tel",
                                    ...(props.values.studentsData &&
                                      props.values.studentsData[index] &&
                                      props.values.studentsData[index].p_phone && {
                                        dir: "ltr",
                                      }),
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                  
                  {/* Enhanced Add Button */}
                  <div className="flex justify-center pt-8">
                    <button
                      type="button"
                      className="group relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform"
                      onClick={() =>
                        push({
                          id: Math.random(),
                          s_name: "",
                          s_phone: "",
                          p_name: "",
                          p_phone: "",
                        })
                      }
                    >
                      {/* Button Background Animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      
                      <span className="relative flex items-center gap-3">
                        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        {t("common.add")} {t("StudentPage.student")}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </FieldArray>
          </div>

          {/* Modern Action Bar */}
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
                    {t("common.save")} {t("StudentPage.allStudents")}
                    
                    {/* Loading Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </span>
                }
                isLoading={isLoadingStudentCreateMulti}
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default MuiltAdd;
