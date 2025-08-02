import React from "react";
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import { ButtonForm } from "@/components/Form/ButtonForm";
import { UploadFileForm } from "@/components/Form/uploadFileForm";
import { getTranslation } from "@/ni18n/i18n";
import { toast } from "react-toastify";
import { getJsonFromExcel } from "@/utils/excelParser";
import * as Yup from "yup";
import { useParentMultipleForExcelMutation } from "@/services/admin/parent";

const ExcelAdd = () => {
  const { t } = getTranslation();
  const [isLoadingParentUpdate, setIsLoadingParentUpdate] =
    React.useState(false);
  const [ParentMultipleForExcel, { isLoading }] =
    useParentMultipleForExcelMutation();
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

      setIsLoadingParentUpdate(true);

      const parentsData = await getJsonFromExcel(file);

      const res = await ParentMultipleForExcel({
        parents: parentsData.map((item) => ({
          fullName: item.fullName,
          gender:
            item.gender === "male"
              ? "Male"
              : item.gender === "female"
              ? "Female"
              : item.gender,
          phone1: item.phone1,
          birth: !!item.birth ? item.birth : undefined,
          address: !!item.address ? item.address : undefined,
          email: !!item.email ? item.email : undefined,
          phone2: !!item.phone2 ? item.phone2 : undefined,
        })) as any,
      }).unwrap();
      console.log(res, "res");

      toast.success(t("common.added-successfully"), { autoClose: 30000 });
      resetForm();
      setIsLoadingParentUpdate(false);
    } catch (error: any) {
      setIsLoadingParentUpdate(false);
      console.error("Failed to operation :", error);
      if (error) {
        if (
          error.message ==
          `Resource already exists. More details: {\"modelName\":\"Parent\",\"target\":\"parents_email_key\"}`
        ) {
          return toast.error(t("ParentPage.email-already-exists"), {
            autoClose: 30000,
          });
        }
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const parentSchema = Yup.object().shape({
    file: Yup.mixed().required(t("common.this-field-is-required")),
  });

  return (
    <Formik<{
      file: File | null;
    }>
      initialValues={{ file: null }}
      validationSchema={parentSchema}
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
                    {t("ParentPage.excel-upload")}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {t("ParentPage.excel-upload-description")}
                  </p>
                </div>
              </div>

              <UploadFileForm
                accept=".xlsx, .xls"
                formikProps={props}
                name={"file"}
                title={t("ParentPage.upload-excel")}
                placeholder={""}
              />
            </div>
          </div>

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
                isLoading={isLoadingParentUpdate}
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ExcelAdd;
