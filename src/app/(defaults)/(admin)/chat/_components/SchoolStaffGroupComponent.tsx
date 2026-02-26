"use client";

import React from "react";
import { Form, Formik, FormikProps } from "formik";
import { ButtonForm } from "@/components/Form/ButtonForm";
import Model from "@/components/Model";
import { InputForm } from "@/components/Form/inputForm";
import { getTranslation } from "@/ni18n/i18n";

import { FormikHelpers } from "formik";

import { toast } from "react-toastify";
import * as Yup from "yup";
import { AddChatCreateSchoolStaffGroupPayload, useChatCreateSchoolStaffGroupMutation } from "@/services/admin/chat";
import { useSession } from "next-auth/react";
import SendMessageIcon from "@/components/common/icons/SendMessageIcon";
export interface FormValues extends AddChatCreateSchoolStaffGroupPayload {}
const SchoolStaffGroupComponent = ({
  open,
  setOpen,
  setOpenChat,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenChat: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = getTranslation();
  const session = useSession();

  const [ChatCreateSchoolStaffGroup, { isLoading: isLoadingChatCreateSchoolStaffGroup }] = useChatCreateSchoolStaffGroupMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {
      await ChatCreateSchoolStaffGroup({
        description: values.description,
        groupName: values.groupName,
        schoolId: session.data?.user.schoolId || "",
      }).unwrap();

      toast.success(t("common.added-successfully"), { autoClose: 30000 });
      resetForm();
      setOpen(false);
      setOpenChat(false);
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message) {
          return toast.error(t(error.message), {
            autoClose: 30000,
          });
        }

        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };
  const ChatSchema = Yup.object().shape({
    description: Yup.string().required(t("common.this-field-is-required")),
    groupName: Yup.string().required(t("common.this-field-is-required")),
  });

  return (
    <Model title={t("ChatPage.create-school-staff-group")} open={open} setOpen={setOpen}>
      <Formik<FormValues>
        initialValues={{
          description: "",
          groupName: "",
          schoolId: "",
        }}
        validationSchema={ChatSchema}
        onSubmit={(values, formikHelpers) => {
          handleSubmit(values, formikHelpers, setOpen);
        }}>
        {(props: FormikProps<any>) => (
          <Form className={"flex flex-col gap-4"}>
            <InputForm formikProps={props} name={"groupName"} title={t("ChatPage.group-name")} placeholder={t("ChatPage.enter-group-name")} />
            <InputForm
              formikProps={props}
              name={"description"}
              title={t("ChatPage.description")}
              placeholder={t("ChatPage.enter-description")}
              props={{ ...({ as: "textarea" } as any) }}
            />

            <div className="flex flex-row-reverse gap-2">
              <ButtonForm
                props={{
                  type: "submit",
                  className: `w-full bg-[#2C6E91] border-[#2C6E91] rounded-md py-2`,
                }}
                title={t("common.sendMessage")}
                isLoading={isLoadingChatCreateSchoolStaffGroup}
                btnIcon={<SendMessageIcon className="mx-2 w-5 h-5" />}
              />
            </div>
          </Form>
        )}
      </Formik>
    </Model>
  );
};

export default SchoolStaffGroupComponent;
