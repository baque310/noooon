import React from "react";
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import { ButtonForm } from "@/components/Form/ButtonForm";
import { UploadFileForm } from "@/components/Form/uploadFileForm";
import { getTranslation } from "@/ni18n/i18n";
import { useStudentMultiStudentsForExcelMutation } from "@/services/admin/student";
import { toast } from "react-toastify";
import { getJsonFromExcel } from "@/utils/excelParser";
import * as Yup from "yup";

const ExcelAdd = () => {
  const { t } = getTranslation();
  const [isLoadingStudentUpdate, setIsLoadingStudentUpdate] =
    React.useState(false);
  const [StudentMultiStudentsForExcel, { isLoading, data }] =
    useStudentMultiStudentsForExcelMutation();
  const handleSubmit = async (
    values: {
      file: File | null;
    },
    {
      setSubmitting,
      resetForm,
    }: FormikHelpers<{
      file: File | null;
    }>
  ) => {
    try {
      const file = values.file;

      setIsLoadingStudentUpdate(true);

      const studentsData = await getJsonFromExcel(file);

      await StudentMultiStudentsForExcel({
        students: studentsData.map((item) => ({
          fullName: item.fullName,
          gender:
            item.gender === "male"
              ? "Male"
              : item.gender === "female"
              ? "Female"
              : item.gender,
          phone1: item.phone1,
          birth: !!item.birth ? item.birth : undefined,
          enrollmentDate: !!item.enrollmentDate
            ? item.enrollmentDate
            : undefined,
          address: !!item.address ? item.address : undefined,
          email: !!item.email ? item.email : undefined,
          phone2: !!item.phone2 ? item.phone2 : undefined,
        })) as any,
      }).unwrap();

      toast.success(t("common.added-successfully"), { autoClose: 30000 });
      resetForm();
      setIsLoadingStudentUpdate(false);
    } catch (error: any) {
      setIsLoadingStudentUpdate(false);
      console.error("Failed to operation :", error);
      if (error) {
        if (
          error.message ==
          `Resource already exists. More details: {\"modelName\":\"Student\",\"target\":\"students_email_key\"}`
        ) {
          return toast.error(t("StudentPage.email-already-exists"), {
            autoClose: 30000,
          });
        }
        if (error.message) {
          return toast.error(t(error.message), { autoClose: 30000 });
        }
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const studentSchema = Yup.object().shape({
    file: Yup.mixed().required(t("common.this-field-is-required")),
  });

  return (
    <Formik<{
      file: File | null;
    }>
      initialValues={{ file: null }}
      validationSchema={studentSchema}
      onSubmit={handleSubmit}
    >
      {(props: FormikProps<any>) => (
        <Form className={"px-4 flex flex-col gap-8"}>
          {/* Excel Upload Card */}

          <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-gray-900 dark:via-rose-900/20 dark:to-fuchsia-900/20 rounded-3xl border border-rose-100 dark:border-gray-700 shadow-xl">
            <div className="relative p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {t("StudentPage.excel-upload")}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {t("StudentPage.excel-upload-description")}
                  </p>
                </div>
              </div>

              <UploadFileForm
                accept=".xlsx, .xls"
                formikProps={props}
                name={"file"}
                title={t("StudentPage.upload-excel")}
                placeholder={""}
              />
            </div>
          </div>

          {/* Results Section */}
          {data && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Success Count Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-gray-700 shadow-lg">
                  <div className="relative p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-green-800 dark:text-green-300">
                          {t("ParentPage.successCount")}
                        </h3>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {data?.successCount || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Count Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-gray-900 dark:via-red-900/20 dark:to-rose-900/20 rounded-2xl border border-red-200 dark:border-gray-700 shadow-lg">
                  <div className="relative p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-red-800 dark:text-red-300">
                          {t("ParentPage.errorCount")}
                        </h3>
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                          {data?.errorCount || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Successful Entries */}
              {data?.success && data.success.length > 0 && (
                <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/10 dark:to-emerald-900/10 rounded-2xl border border-green-200 dark:border-gray-700 shadow-lg">
                  <div className="relative p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                        {t("StudentPage.Successfully Added Students")}
                      </h3>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {data.success.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-green-100 dark:border-gray-600"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-700 dark:text-green-300 font-medium">
                            {item.fullName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Entries */}
              {data?.errors && data.errors.length > 0 && (
                <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-gray-900 dark:via-red-900/10 dark:to-rose-900/10 rounded-2xl border border-red-200 dark:border-gray-700 shadow-lg">
                  <div className="relative p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
                        {t("StudentPage.Failed Entries")}
                      </h3>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {data.errors.map((error, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-red-100 dark:border-gray-600"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="font-semibold text-red-700 dark:text-red-300">
                              {error.student.fullName}
                            </span>
                          </div>
                          <div className="ml-5 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg border-l-4 border-red-400">
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {error.error.includes("students_phone1_key")
                                ? t("StudentPage.phone1-already-exists")
                                : error.error.includes("students_phone2_key")
                                ? t("StudentPage.phone2-already-exists")
                                : error.error.includes("students_email_key")
                                ? t("StudentPage.email-already-exists")
                                : error.error.includes(
                                    "Unique constraint failed on the constraint:"
                                  )
                                ? error.error.split(
                                    "Unique constraint failed on the constraint:"
                                  )[1]
                                : error.error}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="relative bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 rounded-3xl"></div>
            <div className="relative flex flex-row-reverse gap-4">
              <ButtonForm
                props={{
                  type: "submit",
                  className:
                    "group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform flex items-center gap-3",
                }}
                title={
                  <span className="relative flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
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
  );
};

export default ExcelAdd;
