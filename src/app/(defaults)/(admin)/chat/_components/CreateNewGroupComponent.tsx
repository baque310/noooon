"use client";
import { BookOpen, User, Rows3, SquareStack, GraduationCap } from "lucide-react";
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
  AddChatPayload,
  AddChatCreateCustomTeachersGroupPayload,
  AddChatCreateClassParentsGroupPayload,
  AddChatCreateSubjectTeachersGroupPayload,
  AddChatCreateSchoolStaffGroupPayload,
  AddChatCreateClassStudentsGroupPayload,
  ChatTargetUserType,
  useChatDirectMutation,
  useChatCreateClassStudentsGroupMutation,
  useChatCreateSchoolStaffGroupMutation,
  useChatCreateCustomTeachersGroupMutation,
  useChatCreateClassParentsGroupMutation,
  useChatCreateSupervisorTeachersGroupMutation,
} from "@/services/admin/chat";
import { useStudentEnrollmentGetDataQuery } from "@/services/admin/studentEnrollment";
import { useTeacherGetDataQuery } from "@/services/admin/teacher";
import { useParentGetDataQuery } from "@/services/admin/parent";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { useClassGetDataQuery } from "@/services/admin/class";
import SendMessageIcon from "@/components/common/icons/SendMessageIcon";
import { useSession } from "next-auth/react";
import { useTeacherSubjectGetDataQuery } from "@/services/admin/TeacherSubject";
import { MultiSelectDropdown } from "@/components/MultiSelectDropdown";

export interface FormValues
  extends Partial<AddChatPayload>,
    Partial<AddChatCreateCustomTeachersGroupPayload>,
    Partial<AddChatCreateSubjectTeachersGroupPayload>,
    Partial<AddChatCreateSchoolStaffGroupPayload>,
    Partial<AddChatCreateClassStudentsGroupPayload> {
  GroupType?: string;
  targetUserType?: ChatTargetUserType | undefined;
  studentId?: string;
  teacherId?: string;
  parentId?: string;
}

const CreateNewGroupComponent = ({
  open,
  setOpen,
  setOpenChat,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenChat?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = getTranslation();

  const [, { isLoading: isLoadingChatDirect }] = useChatDirectMutation();
  const [ChatCreateSchoolStudentsGroup, { isLoading: isLoadingChatCreateSchoolStudentsGroup }] = useChatCreateClassStudentsGroupMutation();
  const [ChatCreateSchoolStaffGroup, { isLoading: isLoadingChatCreateSchoolStaffGroup }] = useChatCreateSchoolStaffGroupMutation();
  const [CreateCustomTeachersGroup, { isLoading: isLoadingCreateCustomTeachersGroup }] = useChatCreateCustomTeachersGroupMutation();
  const [ChatCreateSupervisorTeachersGroup, { isLoading: isLoadingChatCreateSupervisorTeachersGroup }] = useChatCreateSupervisorTeachersGroupMutation();
  const [CreateClassParentsGroup, { isLoading: isLoadingCreateClassParentsGroup }] = useChatCreateClassParentsGroupMutation();

  const [searchStudent, setSearchStudent] = React.useState("");
  const { currentData: students, isFetching: isFetchingStudents } = useStudentEnrollmentGetDataQuery({
    skip: 1,
    take: 100,
    search: searchStudent,
  });

  const [searchTeacher, setSearchTeacher] = React.useState("");
  const { currentData: teachersData, isFetching: isFetchingTeachersData } = useTeacherGetDataQuery({
    skip: 1,
    take: 100,
    search: searchTeacher,
  });

  const { currentData: teachers, isFetching: isFetchingTeachers } = useTeacherSubjectGetDataQuery({
    search: searchTeacher,
  });

  const [searchParent, setSearchParent] = React.useState("");
  const { currentData: parents, isFetching: isFetchingParents } = useParentGetDataQuery({
    skip: 1,
    take: 100,
    search: searchParent,
  });

  const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();

  const [searchClass, setSearchClass] = React.useState("");
  const { currentData: classes, isFetching: isFetchingClasses } = useClassGetDataQuery({
    search: searchClass,
  });

  const session = useSession();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {
      if (values.GroupType === "studentGroup") {
        await ChatCreateSchoolStudentsGroup({
          stageId: String(values.stageId),
          classId: String(values.classId),
          groupName: String(values.groupName),
          sectionId: String(values.sectionId),
        }).unwrap();
      } else if (values.GroupType === "staffGroup") {
        await ChatCreateSchoolStaffGroup({
          description: String(values.description),
          groupName: String(values.groupName),
          schoolId: session.data?.user.schoolId || "",
        }).unwrap();
      } else if (values.GroupType === "teacherGroup") {
        if (!values.teacherIds || values.teacherIds.length === 0) {
          toast.error(t("common.this-field-is-required"));
          return;
        }

        const selectedTeacherId = values.teacherIds[0];
        const selectedTeacher = teachers?.find((t) => t.id === selectedTeacherId);

        if (!selectedTeacher) {
          toast.error(t("ChatPage.selectedTeacher-not-found"));
          return;
        }

        if (selectedTeacher.Section?.id) {
          await ChatCreateSupervisorTeachersGroup({
            sectionId: selectedTeacher.Section.id,
            teacherId: selectedTeacher.Teacher.id,
            groupName: values.groupName || "",
            description: values.description || "",
          }).unwrap();
        } else {
          await ChatCreateSupervisorTeachersGroup({
            classId: selectedTeacher.StageSubject.Class.id,
            teacherId: selectedTeacher.Teacher.id,
            groupName: values.groupName || "",
            description: values.description || "",
          }).unwrap();
        }
      } else if (values.GroupType === "otherGroup") {
        if (!values.teacherIds || values.teacherIds.length === 0) {
          toast.error(t("common.this-field-is-required"));
          return;
        }
        await CreateCustomTeachersGroup({
          description: String(values.description),
          groupName: String(values.groupName),
          schoolId: session.data?.user.schoolId || "",
          teacherIds: values.teacherIds,
        }).unwrap();
      }

      if (values.GroupType === "parentGroup") {
        await CreateClassParentsGroup({
          classId: String(values.classId),
          description: String(values.description),
          groupName: String(values.groupName),
          teacherId: String(values.teacherId),
        }).unwrap();
      }

      toast.success(t("common.added-successfully"), { autoClose: 30000 });
      resetForm();
      setOpen(false);
      if (setOpenChat) setOpenChat(false);
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
    GroupType: Yup.string().required(t("common.this-field-is-required")),
    stageId: Yup.string().when("GroupType", (g, schema) => {
      const GroupType = g as unknown as string;
      return GroupType === "studentGroup" ? schema.required(t("common.this-field-is-required")) : schema.notRequired();
    }),
    sectionId: Yup.string().when("GroupType", (g, schema) => {
      const GroupType = g as unknown as string;
      return GroupType === "studentGroup" ? schema.required(t("common.this-field-is-required")) : schema.notRequired();
    }),
    teacherIds: Yup.array()
      .of(Yup.string())
      .when("GroupType", (g, schema) => {
        const GroupType = g as unknown as string;
        return GroupType === "teacherGroup" || GroupType === "otherGroup" ? schema.min(1, t("common.this-field-is-required")) : schema.notRequired();
      }),
    classId: Yup.string().when("GroupType", (g, schema) => {
      const GroupType = g as unknown as string;
      return GroupType === "parentGroup" ? schema.required(t("common.this-field-is-required")) : schema.notRequired();
    }),
    teacherId: Yup.string().when("GroupType", (g, schema) => {
      const GroupType = g as unknown as string;
      return GroupType === "parentGroup" ? schema.required(t("common.this-field-is-required")) : schema.notRequired();
    }),
    groupName: Yup.string().when("GroupType", (g, schema) => {
      const GroupType = g as unknown as string;
      return GroupType === "teacherGroup" || GroupType === "staffGroup" || GroupType === "otherGroup" || GroupType === "parentGroup"
        ? schema.required(t("common.this-field-is-required"))
        : schema.notRequired();
    }),
    description: Yup.string().when("GroupType", (g, schema) => {
      const GroupType = g as unknown as string;
      return GroupType === "teacherGroup" || GroupType === "staffGroup" || GroupType === "otherGroup" || GroupType === "parentGroup"
        ? schema.required(t("common.this-field-is-required"))
        : schema.notRequired();
    }),
  });

  return (
    <Model title={t("ChatPage.add-chat")} open={open} setOpen={setOpen}>
      <Formik<FormValues>
        initialValues={{
          GroupType: "",
          initialMessage: "",
          targetUserId: "",
          targetUserType: "student",
          stageId: "",
          classId: "",
          sectionId: "",
          teacherId: "",
          teacherIds: [],
          groupName: "",
          description: "",
        }}
        validationSchema={ChatSchema}
        onSubmit={(values, formikHelpers) => {
          handleSubmit(values, formikHelpers, setOpen);
        }}>
        {(props: FormikProps<any>) => (
          <Form className={"flex flex-col gap-4"}>
            <SelectForm
              formikProps={props}
              name={"GroupType"}
              title={t("ChatPage.SelectGroupType")}
              placeholder={t("ChatPage.select-GroupType")}
              options={[
                { label: t("ChatPage.teacherGroup"), value: "teacherGroup" },
                { label: t("ChatPage.studentGroup"), value: "studentGroup" },
                { label: t("ChatPage.parentGroup"), value: "parentGroup" },
                { label: t("ChatPage.otherGroup"), value: "otherGroup" },
              ]}
            />

            {/* Student Group */}
            {props.values.GroupType === "studentGroup" && (
              <>
                <InputForm formikProps={props} name={"groupName"} title={t("ChatPage.group-name")} placeholder={t("ChatPage.enter-group-name")} />
                <SelectForm
                  formikProps={props}
                  name={"stageId"}
                  title={t("StudentEnrollmentPage.StageName")}
                  placeholder={t("StudentEnrollmentPage.enter-StageName")}
                  options={
                    stage?.map((item) => ({
                      label: t(item.name as any),
                      value: item.id,
                    })) ?? []
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
                          ?.Class?.map((item) => ({
                            label: t(item.name as any),
                            value: item.id,
                          })) || []
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
                          ?.Section?.map((item) => ({
                            label: t(item.name as any),
                            value: item.id,
                          })) || []
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
              </>
            )}

            {/* Parent Group */}
            {props.values.GroupType === "parentGroup" && (
              <>
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
                    teachersData?.data.map((teacher) => ({
                      label: teacher.fullName,
                      value: teacher.id,
                    })) || []
                  }
                  props={{
                    isClearable: true,
                    isLoading: isFetchingTeachersData,
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
              </>
            )}

            {/* Teacher Group */}
            {props.values.GroupType === "teacherGroup" && (
              <>
                <SelectForm
                  formikProps={props}
                  name={"teacherIds"}
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
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 rounded-lg p-1.5 bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
                              <BookOpen className="size-4" aria-hidden />
                            </span>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{teacher.StageSubject.Subject.name}</h3>
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <User className="size-4 opacity-80" aria-hidden />
                            <span className="font-medium">{teacher.Teacher.fullName}</span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                            <span
                              className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 
                 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
                              title="Section">
                              <Rows3 className="size-4 opacity-70" aria-hidden />
                              {teacher?.Section?.name}
                            </span>

                            <span
                              className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 
                 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
                              title="Class">
                              <SquareStack className="size-4 opacity-70" aria-hidden />
                              {teacher.StageSubject.Class.name}
                            </span>

                            <span
                              className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 
                 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
                              title="Stage">
                              <GraduationCap className="size-4 opacity-70" aria-hidden />
                              {t(teacher.StageSubject.Stage.name as any)}
                            </span>
                          </div>

                          <div className="pointer-events-none absolute inset-y-0 right-2 hidden items-center opacity-0 transition-all duration-200 group-hover:flex group-hover:opacity-40">
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
                      props.setFieldValue("teacherIds", option?.value ? [option.value] : []);
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
              </>
            )}

            {/* Other Group - Using MultiSelectDropdown */}
            {props.values.GroupType === "otherGroup" && (
              <>
                <MultiSelectDropdown
                  formikProps={props}
                  name="teacherIds"
                  title={t("ChatPage.select-teachers") || "Select Teachers"}
                  placeholder={t("ChatPage.select-teachers") || "Select teachers"}
                  options={
                    teachersData?.data?.map((item) => ({
                      label: item.fullName,
                      value: item.id,
                    })) || []
                  }
                  isLoading={isFetchingTeachersData}
                  outputFormat="ids" // Returns ["id1", "id2", "id3"]
                  onSelectionChange={(selectedIds) => {
                    console.log("Selected teacher IDs:", selectedIds);
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
              </>
            )}

            <div className="flex flex-row-reverse gap-2">
              <ButtonForm
                props={{
                  type: "submit",
                  className: `w-full !bg-[#2C6E91] border-[#2C6E91] rounded-md py-2`,
                }}
                title={t("common.sendMessage")}
                isLoading={
                  props.values.GroupType === "studentGroup"
                    ? isLoadingChatCreateSchoolStudentsGroup
                    : props.values.GroupType === "staffGroup"
                    ? isLoadingChatCreateSchoolStaffGroup
                    : props.values.GroupType === "teacherGroup"
                    ? isLoadingChatCreateSupervisorTeachersGroup
                    : props.values.GroupType === "otherGroup"
                    ? isLoadingCreateCustomTeachersGroup
                    : props.values.GroupType === "parentGroup"
                    ? isLoadingCreateClassParentsGroup
                    : isLoadingChatDirect
                }
                btnIcon={<SendMessageIcon className="mx-2 w-5 h-5" />}
              />
            </div>
          </Form>
        )}
      </Formik>
    </Model>
  );
};

export default CreateNewGroupComponent;
