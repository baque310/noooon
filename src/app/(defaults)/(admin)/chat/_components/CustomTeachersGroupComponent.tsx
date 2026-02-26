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

import { useSession } from "next-auth/react";
import { AddChatCreateCustomTeachersGroupPayload, useChatCreateCustomTeachersGroupMutation } from "@/services/admin/chat";
import { CheckBoxForm } from "@/components/Form/CheckBoxForm";
import { useTeacherGetDataQuery } from "@/services/admin/teacher";
import SendMessageIcon from "@/components/common/icons/SendMessageIcon";
export interface FormValues extends AddChatCreateCustomTeachersGroupPayload {}
const CustomTeachersGroupComponent = ({
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

  const [CreateCustomTeachersGroup, { isLoading: isLoadingCreateCustomTeachersGroup }] = useChatCreateCustomTeachersGroupMutation();

  const [searchTeacher, setSearchTeacher] = React.useState("");
  const { currentData: teachers, isFetching: isFetchingTeachers } = useTeacherGetDataQuery({
    skip: 1,
    take: 100,
    search: searchTeacher,
  });

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {
      await CreateCustomTeachersGroup({
        description: values.description,
        groupName: values.groupName,
        schoolId: session.data?.user.schoolId || "",
        teacherIds: values.teacherIds,
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
    teacherIds: Yup.array().min(1, t("common.this-field-is-required")),
  });

  return (
    <Model title={t("ChatPage.create-custom-teachers-group")} open={open} setOpen={setOpen}>
      <Formik<FormValues>
        initialValues={{
          description: "",
          groupName: "",
          schoolId: "",
          teacherIds: [],
        }}
        validationSchema={ChatSchema}
        onSubmit={(values, formikHelpers) => {
          handleSubmit(values, formikHelpers, setOpen);
        }}>
        {(props: FormikProps<any>) => (
          <Form className={"flex flex-col gap-4"}>
            <>
              <InputForm
                formikProps={props}
                name={"searchUser"}
                title={t("")}
                placeholder={t("common.search")}
                props={{
                  onChange: (e) => {
                    setSearchTeacher(e.target.value);
                    props.setFieldValue("searchUser", e.target.value);
                  },
                }}
              />
              {isFetchingTeachers ? (
                <div className="flex justify-center">
                  <div className="loader !bg-primary !w-8 !h-8" />
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto border p-2 border-primary/30 rounded-md">
                  {props.values.allStudentsThisASectionsORClasses !== "TRUE" &&
                    teachers?.data?.map((item, index) => (
                      <div className="p-1 border-b" key={item.id}>
                        {/* Use item.value for key if it's unique */}
                        <CheckBoxForm
                          key={index}
                          formikProps={props}
                          name={`teacherIds.${index}`}
                          title={`${item.fullName}`}
                          props={{
                            checked: props.values.teacherIds.some((it: any) => it == item.id),
                            value: props.values.teacherIds.some((it: any) => it == item.id),
                            onChange: (e) => {
                              if (e.target.checked) {
                                let newValues = props.values.teacherIds.concat(item.id);
                                props.setFieldValue(`teacherIds`, newValues);
                              } else {
                                let newValues = props.values.teacherIds.filter((it: any) => it != item.id);
                                props.setFieldValue(`teacherIds`, newValues);
                              }
                            },
                          }}
                        />
                      </div>
                    ))}
                </div>
              )}
            </>
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
                isLoading={isLoadingCreateCustomTeachersGroup}
                btnIcon={<SendMessageIcon className="mx-2 w-5 h-5" />}
              />
            </div>
          </Form>
        )}
      </Formik>
    </Model>
  );
};

export default CustomTeachersGroupComponent;
