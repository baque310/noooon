"use client";

import React from "react";
import { Form, Formik, FormikProps } from "formik";
import { ButtonForm } from "@/components/Form/ButtonForm";
import Model from "@/components/Model";
import { SelectForm } from "@/components/Form/SelectForm";
import { InputForm } from "@/components/Form/inputForm";
import { getTranslation } from "@/ni18n/i18n";

import { FormikHelpers } from "formik";

import { toast } from "react-toastify";
import * as Yup from "yup";
import {
  AddChatMessagePayload,
  useChatGetDataQuery,
  useChatMessageMutation,
} from "@/services/admin/chat";
export interface FormValues extends AddChatMessagePayload {
  studentId?: string;
}
const GroupComponent = ({
  open,
  setOpen,
  setOpenChat,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenChat: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = getTranslation();

  const [ChatMessage, { isLoading: isLoadingChatMessage }] =
    useChatMessageMutation();

  const { currentData: chats, isFetching: isFetchingChats } =
    useChatGetDataQuery();

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>,
    setOpen: any
  ) => {
    try {
      await ChatMessage({
        message: values.message,
        messageType: values.messageType,
        roomId: values.roomId,
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
    message: Yup.string().required(t("common.this-field-is-required")),
    roomId: Yup.string().required(t("common.this-field-is-required")),
  });

  return (
    <Model title={t("ChatPage.add-chat")} open={open} setOpen={setOpen}>
      <Formik<FormValues>
        initialValues={{
          message: "",
          messageType: "text",
          roomId: "",
        }}
        validationSchema={ChatSchema}
        onSubmit={(values, formikHelpers) => {
          handleSubmit(values, formikHelpers, setOpen);
        }}
      >
        {(props: FormikProps<any>) => (
          <Form className={"flex flex-col gap-4"}>
            <SelectForm
              formikProps={props}
              name={"roomId"}
              title={t("ChatPage.room")}
              placeholder={t("ChatPage.enter-room")}
              options={
                chats?.data.map((chat) => ({
                  label: chat.name,
                  value: chat.rocketChatId,
                })) || []
              }
              props={{
                isClearable: true,
                isLoading: isFetchingChats,
                onChange: (option: any) => {
                  props.setFieldValue("roomId", option?.value || "");
                },
              }}
            />

            <InputForm
              formikProps={props}
              name={"message"}
              title={t("ChatPage.message")}
              placeholder={t("ChatPage.enter-message")}
              props={{ ...({ as: "textarea" } as any) }}
            />

            <div className="flex flex-row-reverse gap-2">
              <ButtonForm
                props={{
                  type: "submit",
                  className: `w-full`,
                }}
                title={t("common.save")}
                isLoading={isLoadingChatMessage}
              />
            </div>
          </Form>
        )}
      </Formik>
    </Model>
  );
};

export default GroupComponent;
