import { ButtonForm } from "@/components/Form/ButtonForm";
import { InputForm } from "@/components/Form/inputForm";
import Model from "@/components/Model";
import { getTranslation } from "@/ni18n/i18n";
import {
  useUserAdminUpdatePasswordMutation,
  useUserManagerUpdatePasswordMutation,
} from "@/services/Manager/User";
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import React from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

export interface FormValues {
  newPassword: string;
}
export const ChangePasswordByAdminModel = ({
  data,
  isAdmin = false,
  open,
  setOpen,
}: {
  isAdmin?: boolean;
  data: {
    username: string;
    userId: string;
  };
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = getTranslation();

  const [
    UserAdminUpdatePassword,
    { isLoading: isLoadingUserAdminUpdatePassword },
  ] = useUserAdminUpdatePasswordMutation();
  const [
    UserManagerUpdatePassword,
    { isLoading: isLoadingUserManagerUpdatePassword },
  ] = useUserManagerUpdatePasswordMutation();

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    try {
      if (isAdmin) {
        await UserAdminUpdatePassword({
          id: data.userId,
          body: {
            newPassword: values?.newPassword,
          },
        }).unwrap();
      } else {
        const res = await UserManagerUpdatePassword({
          id: data.userId,
          body: {
            newPassword: values?.newPassword,
          },
        }).unwrap();
        console.log(res);
      }
      setOpen(false);
      toast.success(t("common.changePassword-successfully"), {
        autoClose: 30000,
      });
      resetForm();
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error.message) {
        return toast.error(t(error.message), { autoClose: 30000 });
      }
      if (error) {
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const userSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required(t("common.this-field-is-required"))
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
  });
  return (
    <>
      {open && (
        <Model title={t("common.changePassword")} open={open} setOpen={setOpen} className="z-[3000]">
          <Formik<FormValues>
            initialValues={{
              newPassword: "",
            }}
            validationSchema={userSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <InputForm
                  formikProps={props}
                  name={"newPassword"}
                  title={t("signInPage.password")}
                  placeholder={t("signInPage.enter-password")}
                  isPassword={true}
                />

                <ButtonForm
                  props={{
                    type: "submit",
                    className: "w-full",
                  }}
                  title={t("common.save")}
                  isLoading={
                    isLoadingUserAdminUpdatePassword ||
                    isLoadingUserManagerUpdatePassword
                  }
                />
              </Form>
            )}
          </Formik>
        </Model>
      )}
    </>
  );
};
