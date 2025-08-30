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
import {
  AddChatCreateSubjectTeachersGroupPayload,
  useChatCreateSubjectTeachersGroupMutation,
} from "@/services/admin/chat";
import { useTeacherSubjectGetDataQuery } from "@/services/admin/TeacherSubject";
import { SelectForm } from "@/components/Form/SelectForm";
export interface FormValues extends AddChatCreateSubjectTeachersGroupPayload {}
const SubjectTeachersGroupComponent = ({
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

  const [
    CreateSubjectTeachersGroup,
    { isLoading: isLoadingCreateSubjectTeachersGroup },
  ] = useChatCreateSubjectTeachersGroupMutation();

  const [searchTeacher, setSearchTeacher] = React.useState("");
  const { currentData: teachers, isFetching: isFetchingTeachers } =
    useTeacherSubjectGetDataQuery({
      search: searchTeacher,
    });

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>,
    setOpen: any
  ) => {
    try {
      await CreateSubjectTeachersGroup({
        description: values.description,
        groupName: values.groupName,
        schoolId: session.data?.user.schoolId || "",
        subjectId: values.subjectId,
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
    subjectId: Yup.string().required(t("common.this-field-is-required")),
  });

  return (
    <Model
      title={t("ChatPage.create-subject-teachers-group")}
      open={open}
      setOpen={setOpen}
    >
      <Formik<FormValues>
        initialValues={{
          description: "",
          groupName: "",
          schoolId: "",
          subjectId: "",
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
              name={"subjectId"}
              title={t("ChatPage.teacher")}
              placeholder={t("ChatPage.enter-teacher")}
              options={
                teachers?.map((teacher) => ({
                  label:
                    teacher.StageSubject.Subject.name +
                    " (" +
                    teacher.StageSubject.Class.name +
                    " - " +
                    t(teacher.StageSubject.Stage.name as any) +
                    " - " +
                    teacher.Teacher.fullName +
                    ")",
                  value: teacher.id,
                })) || []
              }
              props={{
                isClearable: true,
                isLoading: isFetchingTeachers,
                onChange: (option: any) => {
                  props.setFieldValue("subjectId", option?.value || "");
                },
                onInputChange: (inputValue: string) => {
                  setSearchTeacher(inputValue);
                },
              }}
            />
            <InputForm
              formikProps={props}
              name={"groupName"}
              title={t("ChatPage.group-name")}
              placeholder={t("ChatPage.enter-group-name")}
            />
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
                isLoading={isLoadingCreateSubjectTeachersGroup}
              />
            </div>
          </Form>
        )}
      </Formik>
    </Model>
  );
};

export default SubjectTeachersGroupComponent;
