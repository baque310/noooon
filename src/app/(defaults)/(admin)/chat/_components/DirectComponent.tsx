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
import { AddChatPayload, useChatDirectMutation } from "@/services/admin/chat";
import { useStudentEnrollmentGetDataQuery } from "@/services/admin/studentEnrollment";
import { useTeacherGetDataQuery } from "@/services/admin/teacher";
import { useParentGetDataQuery } from "@/services/admin/parent";
export interface FormValues extends AddChatPayload {
  studentId?: string;
}
const DirectComponent = ({
  open,
  setOpen,
  setOpenChat,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenChat: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = getTranslation();

  const [ChatDirect, { isLoading: isLoadingChatDirect }] = useChatDirectMutation();

  const [searchStudent, setSearchStudent] = React.useState("");
  const { currentData: students, isFetching: isFetchingStudents } = useStudentEnrollmentGetDataQuery({
    skip: 1,
    take: 100,
    search: searchStudent,
  });
  const [searchTeacher, setSearchTeacher] = React.useState("");
  const { currentData: teachers, isFetching: isFetchingTeachers } = useTeacherGetDataQuery({
    skip: 1,
    take: 100,
    search: searchTeacher,
  });
  const [searchParent, setSearchParent] = React.useState("");
  const { currentData: parents, isFetching: isFetchingParents } = useParentGetDataQuery({
    skip: 1,
    take: 100,
    search: searchParent,
  });

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {
      await ChatDirect({
        initialMessage: values.initialMessage,
        targetUserId: values.targetUserId,
        targetUserType: values.targetUserType,
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
    initialMessage: Yup.string().required(t("common.this-field-is-required")),
    targetUserId: Yup.string().required(t("common.this-field-is-required")),
    targetUserType: Yup.string().required(t("common.this-field-is-required")),
  });

  return (
    <Model title={t("ChatPage.add-chat")} open={open} setOpen={setOpen}>
      <Formik<FormValues>
        initialValues={{
          initialMessage: "",
          targetUserId: "",
          targetUserType: "student",
        }}
        validationSchema={ChatSchema}
        onSubmit={(values, formikHelpers) => {
          handleSubmit(values, formikHelpers, setOpen);
        }}>
        {(props: FormikProps<any>) => (
          <Form className={"flex flex-col gap-4"}>
            <SelectForm
              formikProps={props}
              name={"targetUserType"}
              title={t("ChatPage.target-user-type")}
              placeholder={t("ChatPage.select-target-user-type")}
              options={[
                { label: t("ChatPage.teacher"), value: "teacher" },
                { label: t("ChatPage.student"), value: "student" },
                { label: t("ChatPage.parent"), value: "parent" },
              ]}
            />

            {props.values.targetUserType == "student" && (
              <SelectForm
                formikProps={props}
                name={"studentId"}
                title={t("ChatPage.student")}
                placeholder={t("ChatPage.enter-student")}
                options={
                  students?.data.map((student) => ({
                    label: student.Student.fullName,
                    value: student.studentId,
                  })) || []
                }
                props={{
                  isClearable: true,
                  isLoading: isFetchingStudents,
                  onChange: (option: any) => {
                    props.setFieldValue("studentId", option?.value || "");
                    props.setFieldValue("targetUserId", option?.value || "");
                  },
                  onInputChange: (inputValue: string) => {
                    setSearchStudent(inputValue);
                  },
                }}
              />
            )}
            {props.values.targetUserType == "teacher" && (
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
                    props.setFieldValue("targetUserId", option?.value || "");
                  },
                  onInputChange: (inputValue: string) => {
                    setSearchTeacher(inputValue);
                  },
                }}
              />
            )}
            {props.values.targetUserType == "parent" && (
              <SelectForm
                formikProps={props}
                name={"parentId"}
                title={t("ChatPage.parent")}
                placeholder={t("ChatPage.enter-parent")}
                options={
                  parents?.data.map((parent) => ({
                    label: parent.fullName,
                    value: parent.id,
                  })) || []
                }
                props={{
                  isClearable: true,
                  isLoading: isFetchingParents,
                  onChange: (option: any) => {
                    props.setFieldValue("parentId", option?.value || "");
                    props.setFieldValue("targetUserId", option?.value || "");
                  },
                  onInputChange: (inputValue: string) => {
                    setSearchParent(inputValue);
                  },
                }}
              />
            )}

            {/* <InputForm
              formikProps={props}
              name={"initialMessage"}
              title={t("ChatPage.message")}
              placeholder={t("ChatPage.enter-message")}
              props={{ ...({ as: "textarea" } as any) }}
            /> */}

            <div className="flex flex-row-reverse gap-2">
              <ButtonForm
                props={{
                  type: "submit",
                  className: `w-full`,
                }}
                title={t("common.save")}
                isLoading={isLoadingChatDirect}
              />
            </div>
          </Form>
        )}
      </Formik>
    </Model>
  );
};

export default DirectComponent;
