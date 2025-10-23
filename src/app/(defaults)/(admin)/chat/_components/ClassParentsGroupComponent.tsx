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
import { useStudentEnrollmentGetDataQuery } from "@/services/admin/studentEnrollment";
import { useTeacherGetDataQuery } from "@/services/admin/teacher";
import { useParentGetDataQuery } from "@/services/admin/parent";
import { AddChatCreateClassParentsGroupPayload, useChatCreateClassParentsGroupMutation } from "@/services/admin/chat";
import { useClassGetDataQuery } from "@/services/admin/class";
export interface FormValues extends AddChatCreateClassParentsGroupPayload {}
const ClassParentsGroupComponent = ({
  open,
  setOpen,
  setOpenChat,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenChat: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = getTranslation();

  const [CreateClassParentsGroup, { isLoading: isLoadingCreateClassParentsGroup }] = useChatCreateClassParentsGroupMutation();

  const [searchTeacher, setSearchTeacher] = React.useState("");
  const { currentData: teachers, isFetching: isFetchingTeachers } = useTeacherGetDataQuery({
    skip: 1,
    take: 100,
    search: searchTeacher,
  });
  const [searchClass, setSearchClass] = React.useState("");
  const { currentData: classes, isFetching: isFetchingClasses } = useClassGetDataQuery({
    search: searchClass,
  });

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {
      await CreateClassParentsGroup({
        classId: values.classId,
        description: values.description,
        groupName: values.groupName,
        teacherId: values.teacherId,
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
    teacherId: Yup.string().required(t("common.this-field-is-required")),
    groupName: Yup.string().required(t("common.this-field-is-required")),
    description: Yup.string().required(t("common.this-field-is-required")),
    classId: Yup.string().required(t("common.this-field-is-required")),
  });

  return (
    <Model title={t("ChatPage.create-class-parents-group")} open={open} setOpen={setOpen}>
      <Formik<FormValues>
        initialValues={{
          classId: "",
          description: "",
          groupName: "",
          teacherId: "",
        }}
        validationSchema={ChatSchema}
        onSubmit={(values, formikHelpers) => {
          handleSubmit(values, formikHelpers, setOpen);
        }}>
        {(props: FormikProps<any>) => (
          <Form className={"flex flex-col gap-4"}>
            <SelectForm
              formikProps={props}
              name={"classId"}
              title={t("ChatPage.class")}
              placeholder={t("ChatPage.enter-class")}
              options={
                classes?.map((item) => ({
                  label: item.name,
                  value: item.id,
                })) || []
              }
              props={{
                isClearable: true,
                isLoading: isFetchingClasses,
                onChange: (option: any) => {
                  props.setFieldValue("classId", option?.value || "");
                },
                onInputChange: (inputValue: string) => {
                  setSearchClass(inputValue);
                },
              }}
            />
            <SelectForm
              formikProps={props}
              name={"teacherId"}
              title={t("ChatPage.teacher")}
              placeholder={t("ChatPage.enter-teacher")}
              options={
                teachers?.data.map((teacher) => ({
                  label: teacher.fullName,
                  value: teacher.id,
                })) || []
              }
              props={{
                isClearable: true,
                isLoading: isFetchingTeachers,
                onChange: (option: any) => {
                  props.setFieldValue("teacherId", option?.value || "");
                },
                onInputChange: (inputValue: string) => {
                  setSearchTeacher(inputValue);
                },
              }}
            />

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
                  className: `w-full`,
                }}
                title={t("common.save")}
                isLoading={isLoadingCreateClassParentsGroup}
              />
            </div>
          </Form>
        )}
      </Formik>
    </Model>
  );
};

export default ClassParentsGroupComponent;
