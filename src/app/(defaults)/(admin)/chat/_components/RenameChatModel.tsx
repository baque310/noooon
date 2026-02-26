"use client";

import React from "react";
import Model from "@/components/Model";
import { getTranslation } from "@/ni18n/i18n";
import { Form, Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { InputForm } from "@/components/Form/inputForm";
import { ButtonForm } from "@/components/Form/ButtonForm";
import { useRenameChatMutation } from "@/services/admin/chat";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chat: any | null;
  onRenamed?: () => void;
}

const RenameChatModel: React.FC<Props> = ({ open, setOpen, chat, onRenamed }) => {
  const { t } = getTranslation() as any;
  const [renameChat, { isLoading }] = useRenameChatMutation();
  const router = useRouter();

  const handleSubmit = async (values: { name: string }) => {
    try {
      await renameChat({ roomId: chat.id, body: { name: values.name } }).unwrap();
      toast.success(t("common.updated-successfully"), { autoClose: 3000 });
      setOpen(false);
      if (onRenamed) onRenamed();
      router.refresh();
    } catch (error: any) {
      console.error("Failed to rename chat:", error);
      if (error?.data?.message) {
        toast.error(t(error.data.message), { autoClose: 3000 });
      } else {
        toast.error(t("common.operation-failed"), { autoClose: 3000 });
      }
    }
  };

  return (
    <Model title={t("ChatPage.rename-chat") || "Rename Chat"} open={open} setOpen={setOpen}>
      <Formik<{ name: string }>
        initialValues={{ name: chat?.name ?? "" }}
        validationSchema={Yup.object().shape({ name: Yup.string().required(t("common.this-field-is-required")) })}
        onSubmit={(values) => handleSubmit(values)}>
        {(props: FormikProps<any>) => (
          <Form className="flex flex-col gap-4">
            <InputForm formikProps={props} name={"name"} title={t("ChatPage.name") || "Chat Name"} placeholder={t("ChatPage.enter-name") || "Enter chat name"} />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                {t("common.cancel") || "Cancel"}
              </button>
              <ButtonForm props={{ type: "submit", className: "!bg-[#2C6E91]" }} title={t("common.save") || "Save"} isLoading={isLoading} />
            </div>
          </Form>
        )}
      </Formik>
    </Model>
  );
};

export default RenameChatModel;
