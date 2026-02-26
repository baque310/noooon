"use client";

import React from "react";
import { Form, Formik, FormikProps } from "formik";
import { ButtonForm } from "@/components/Form/ButtonForm";
import Model from "@/components/Model";
import { getTranslation } from "@/ni18n/i18n";

import { FormikHelpers } from "formik";

import { toast } from "react-toastify";
import * as Yup from "yup";
import { AddChatCreateClassStudentsGroupPayload, useChatCreateClassStudentsGroupMutation } from "@/services/admin/chat";
import { useSession } from "next-auth/react";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { SelectForm } from "@/components/Form/SelectForm";
import SendMessageIcon from "@/components/common/icons/SendMessageIcon";
export interface FormValues extends AddChatCreateClassStudentsGroupPayload {}
const SchoolStudentsGroupComponent = ({
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
  const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();

  const [ChatCreateSchoolStudentsGroup, { isLoading: isLoadingChatCreateSchoolStudentsGroup }] = useChatCreateClassStudentsGroupMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {
      await ChatCreateSchoolStudentsGroup({
        stageId: values.stageId,
        classId: values.classId,
        sectionId: values.sectionId,
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
    stageId: Yup.string().required(t("common.this-field-is-required")),
    classId: Yup.string().required(t("common.this-field-is-required")),
    sectionId: Yup.string().required(t("common.this-field-is-required")),
  });

  return (
    <Model title={t("ChatPage.create-school-Students-group")} open={open} setOpen={setOpen}>
      <Formik<FormValues>
        initialValues={{
          stageId: "",
          classId: "",
          sectionId: "",
        }}
        validationSchema={ChatSchema}
        onSubmit={(values, formikHelpers) => {
          handleSubmit(values, formikHelpers, setOpen);
        }}>
        {(props: FormikProps<any>) => (
          <Form className={"flex flex-col gap-4"}>
            <SelectForm
              formikProps={props}
              name={"stageId"}
              title={t("StudentEnrollmentPage.StageName")}
              placeholder={t("StudentEnrollmentPage.enter-StageName")}
              options={
                stage?.map((item) => {
                  return {
                    label: t(item.name as any),
                    value: item.id,
                  };
                }) ?? []
              }
              props={{
                isLoading: isFetchingStage,
                isClearable: true,
                onChange: (e) => {
                  props.setFieldValue("stageId", (e as any)?.value ?? "");
                  props.setFieldValue("classId", "");
                  props.setFieldValue("sectionId", "");
                },
              }}
            />

            <SelectForm
              formikProps={props}
              name={"classId"}
              title={t("StudentEnrollmentPage.ClassName")}
              placeholder={t("StudentEnrollmentPage.enter-ClassName")}
              options={
                stage
                  ? stage
                      .find((item) => item.id === props.values.stageId)
                      ?.Class?.map((item) => {
                        return {
                          label: t(item.name as any),
                          value: item.id,
                        };
                      }) || []
                  : []
              }
              props={{
                isLoading: isFetchingStage,
                isClearable: true,
                onChange: (e) => {
                  props.setFieldValue("classId", (e as any)?.value ?? "");
                  props.setFieldValue("sectionId", "");
                },
              }}
            />

            <SelectForm
              formikProps={props}
              name={"sectionId"}
              title={t("StudentEnrollmentPage.SectionName")}
              placeholder={t("StudentEnrollmentPage.enter-SectionName")}
              options={
                stage
                  ? stage
                      .find((item) => item.id === props.values.stageId)
                      ?.Class?.find((item) => item.id === props.values.classId)
                      ?.Section?.map((item) => {
                        return {
                          label: t(item.name as any),
                          value: item.id,
                        };
                      }) || []
                  : []
              }
              props={{
                isClearable: true,
                isLoading: isFetchingStage,
                onChange: (e) => {
                  props.setFieldValue("sectionId", (e as any)?.value ?? "");
                },
              }}
            />

            <div className="flex flex-row-reverse gap-2">
              <ButtonForm
                props={{
                  type: "submit",
                  className: `w-full bg-[#2C6E91] border-[#2C6E91] rounded-md py-2`,
                }}
                title={t("common.sendMessage")}
                isLoading={isLoadingChatCreateSchoolStudentsGroup}
                btnIcon={<SendMessageIcon className="mx-2 w-5 h-5" />}
              />
            </div>
          </Form>
        )}
      </Formik>
    </Model>
  );
};

export default SchoolStudentsGroupComponent;
