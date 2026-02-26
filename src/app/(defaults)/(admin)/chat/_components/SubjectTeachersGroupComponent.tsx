"use client";
import { BookOpen, User, Rows3, SquareStack, GraduationCap } from "lucide-react";

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
import { AddChatCreateSubjectTeachersGroupPayload, useChatCreateSubjectTeachersGroupMutation } from "@/services/admin/chat";
import { useTeacherSubjectGetDataQuery } from "@/services/admin/TeacherSubject";
import { SelectForm } from "@/components/Form/SelectForm";
import SendMessageIcon from "@/components/common/icons/SendMessageIcon";
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

  const [CreateSubjectTeachersGroup, { isLoading: isLoadingCreateSubjectTeachersGroup }] = useChatCreateSubjectTeachersGroupMutation();

  const [searchTeacher, setSearchTeacher] = React.useState("");
  const { currentData: teachers, isFetching: isFetchingTeachers } = useTeacherSubjectGetDataQuery({
    search: searchTeacher,
  });

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
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
    <Model title={t("ChatPage.create-subject-teachers-group")} open={open} setOpen={setOpen}>
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
        }}>
        {(props: FormikProps<any>) => (
          <Form className={"flex flex-col gap-4"}>
            <SelectForm
              formikProps={props}
              name={"subjectId"}
              title={t("ChatPage.teacher")}
              placeholder={t("ChatPage.enter-teacher")}
              options={
                teachers?.map((teacher) => ({
                  label: (
                    <div
                      className="group relative rounded-2xl border border-gray-200 bg-white/60 p-4 shadow-sm
             hover:shadow-md hover:bg-white transition-all duration-200 focus-within:ring-2
             focus-within:ring-blue-500 dark:border-gray-700 dark:bg-gray-900/60 dark:hover:bg-gray-900"
                      tabIndex={0}
                      aria-label="Teacher subject card">
                      {/* Header: Subject */}
                      <div className="flex items-start gap-2">
                        <span
                          className="mt-0.5 rounded-lg p-1.5 bg-blue-50 text-blue-600 
                     dark:bg-blue-400/10 dark:text-blue-300">
                          <BookOpen className="size-4" aria-hidden />
                        </span>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{teacher.StageSubject.Subject.name}</h3>
                      </div>

                      {/* Teacher */}
                      <div className="mt-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <User className="size-4 opacity-80" aria-hidden />
                        <span className="font-medium">{teacher.Teacher.fullName}</span>
                      </div>

                      {/* Meta badges */}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 
                 text-gray-700 ring-1 ring-gray-200
                 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
                          title="Section">
                          <Rows3 className="size-4 opacity-70" aria-hidden />
                          {teacher?.Section?.name}
                        </span>

                        <span
                          className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 
                 text-gray-700 ring-1 ring-gray-200
                 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
                          title="Class">
                          <SquareStack className="size-4 opacity-70" aria-hidden />
                          {teacher.StageSubject.Class.name}
                        </span>

                        <span
                          className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 
                 text-gray-700 ring-1 ring-gray-200
                 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
                          title="Stage">
                          <GraduationCap className="size-4 opacity-70" aria-hidden />
                          {t(teacher.StageSubject.Stage.name as any)}
                        </span>
                      </div>

                      {/* Optional: subtle divider & right-caret affordance */}
                      <div
                        className="pointer-events-none absolute inset-y-0 right-2 hidden items-center 
                  opacity-0 transition-all duration-200 group-hover:flex group-hover:opacity-40">
                        <svg viewBox="0 0 24 24" className="size-4 fill-current">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </div>
                    </div>
                  ),

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
                isLoading={isLoadingCreateSubjectTeachersGroup}
                btnIcon={<SendMessageIcon className="mx-2 w-5 h-5" />}
              />
            </div>
          </Form>
        )}
      </Formik>
    </Model>
  );
};

export default SubjectTeachersGroupComponent;
