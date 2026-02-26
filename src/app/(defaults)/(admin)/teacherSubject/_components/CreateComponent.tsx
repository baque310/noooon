"use client";

import React from "react";
import { Form, Formik, FormikProps } from "formik";
import { ButtonForm } from "@/components/Form/ButtonForm";
import Model from "@/components/Model";
import { LoadingForm } from "@/components/Form/loadingForm";
import { getTranslation } from "@/ni18n/i18n";
import { useTeacherSubjectCreateMutation, useTeacherSubjectUpdateMutation, useLazyTeacherSubjectGetDataByIdQuery, AddTeacherSubjectPayload } from "@/services/admin/TeacherSubject";
import { FormikHelpers } from "formik";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { SelectForm } from "@/components/Form/SelectForm";
import { useStageSubjectGetDataQuery } from "@/services/admin/StageSubject";
import { useTeacherGetDataQuery } from "@/services/admin/teacher";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import { useSettingGetDataQuery } from "@/services/Setting";
import { useSectionGetDataByIdQuery, useSectionGetDataQuery } from "@/services/admin/section";
import { useStageGetDataByIdQuery } from "@/services/admin/stage";
import { CheckBoxForm } from "@/components/Form/CheckBoxForm";
export interface FormValues extends AddTeacherSubjectPayload {
  stageSubjectIds?: { label: string; value: string }[];
}
const CreateComponent = ({ open, setOpen }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const { t } = getTranslation();

  const params = useParams();
  const { id } = params;
  const [searchTeacher, setSearchTeacher] = React.useState<string>("");
  const [searchSubject, setSearchSubject] = React.useState<string>("");
  const [TeacherSubjectGetDataById, { currentData: data, isFetching }] = useLazyTeacherSubjectGetDataByIdQuery();
  const { currentData: stageSubject, isFetching: isFetchingStageSubject } = useStageSubjectGetDataQuery({
    search: searchSubject,
  });
  const [stageId, setStageId] = React.useState<string>();
  const [classId, setClassId] = React.useState<string>();
  const [shouldFetchStage, setShouldFetchStage] = React.useState(false);

  const { currentData: Stages, isFetching: isFetchingStage } = useStageGetDataByIdQuery(
    {
      id: stageId as string,
    },
    { skip: !stageId || !shouldFetchStage }
  );

  useEffect(() => {
    if (stageId && classId) {
      setShouldFetchStage(true);
    }
  }, [stageId, classId]);

  const { currentData: teacher, isFetching: isFetchingTeacher } = useTeacherGetDataQuery({
    search: searchTeacher,
    skip: 1,
    take: 100,
  });

  const { currentData: SchoolYear, isFetching: isFetchingSchoolYear } = useSchoolYearGetDataQuery();
  const { currentData: SettingGetData, isFetching: isFetchingSettingGetData } = useSettingGetDataQuery();

  useEffect(() => {
    if (id) {
      TeacherSubjectGetDataById({ id: String(id) });
    }
  }, [id]);

  useEffect(() => {
    if (data?.StageSubject) {
      setStageId(data.StageSubject.stageId);
      setClassId(data.StageSubject.classId);
      setShouldFetchStage(true);
    }
  }, [data]);

  const [TeacherSubjectCreate, { isLoading: isLoadingTeacherSubjectCreate }] = useTeacherSubjectCreateMutation();
  const [TeacherSubjectUpdate, { isLoading: isLoadingTeacherSubjectUpdate }] = useTeacherSubjectUpdateMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {
      if (id) {
        const selectedSection = values.sections.find((section) => !!section?.sectionId);
        if (selectedSection) {
          await TeacherSubjectUpdate({
            id: id as string,
            body: {
              sectionId: selectedSection.sectionId,
              teacherId: values.teacherId,
            },
          }).unwrap();
        } else {
          throw new Error(t("SectionPage.please-select-section"));
        }
      } else {
        if (values.stageSubjectIds && values.stageSubjectIds.length > 0) {
          const newSection = values.sections.filter((item) => !!item?.sectionId);
          await Promise.all(
            values.stageSubjectIds.map(async (item) => {
              await TeacherSubjectCreate({
                teacherId: values.teacherId,
                stageSubjectId: item.value,
                schoolYearId: values.schoolYearId,
                sections: newSection,
              }).unwrap();
            })
          );
        }
      }

      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000 });
      resetForm();
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message == "subject already exists for the specified teacher" || error.message == "TeacherSubject already exists") {
          return toast.error(t("TeacherSubjectPage.teacher-name-already-exist"), { autoClose: 30000 });
        }
        if (
          error.message == `"Resource already exists. More details: {\"modelName\":\"TeacherSubject\",\"target\":\"teacher_subjects_schoolYearId_stageSubjectId_teacherId_key\"}"`
        ) {
          return toast.error(t("TeacherSubjectPage.teacher-subject-already-exist"), {
            autoClose: 30000,
          });
        }
        if (error.message) {
          return toast.error(JSON.stringify(error.message), {
            autoClose: 30000,
          });
        }

        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };
  const schoolSchema = Yup.object().shape({
    teacherId: Yup.string().required(t("common.this-field-is-required")),
    // stageSubjectId: Yup.string().required(t("common.this-field-is-required")),
    schoolYearId: Yup.string().required(t("common.this-field-is-required")),
  });

  return (
    <Model title={t(id ? "TeacherSubjectPage.update" : "TeacherSubjectPage.add")} open={open} setOpen={setOpen}>
      {isFetching || isFetchingSettingGetData ? (
        <LoadingForm className="!h-36" />
      ) : (
        <Formik<FormValues>
          initialValues={{
            teacherId: data?.teacherId || "",
            stageSubjectId: data?.stageSubjectId || "",
            schoolYearId: data?.schoolYearId || SettingGetData?.currentSchoolYearId || "",
            sections: data?.Section ? [{ sectionId: data.Section.id }] : [],
            stageSubjectIds: data?.stageSubjectId
              ? [
                  {
                    label: `${data.StageSubject.Subject.name} - ${t(data.StageSubject.Stage.name as any)} - ${data.StageSubject.Class.name}`,
                    value: data.stageSubjectId,
                  },
                ]
              : [],
          }}
          validationSchema={schoolSchema}
          onSubmit={(values, formikHelpers) => {
            handleSubmit(values, formikHelpers, setOpen);
          }}>
          {(props: FormikProps<FormValues>) => (
            <Form className={"flex flex-col gap-4"}>
              {!id && (
                <>
                  <SelectForm
                    formikProps={props}
                    name={"schoolYearId"}
                    title={t("TeacherSubjectPage.SchoolYear")}
                    placeholder={t("TeacherSubjectPage.enter-SchoolYear")}
                    options={
                      SchoolYear?.map((item) => {
                        return {
                          label: item.from + " - " + item.to,
                          value: item.id,
                        };
                      }) ?? []
                    }
                    props={{
                      isLoading: isFetchingSchoolYear,
                      isClearable: true,
                      onChange: (e) => {
                        props.setFieldValue("schoolYearId", (e as any)?.value ?? "");
                      },
                    }}
                  />

                  <SelectForm
                    formikProps={props}
                    name={"stageSubjectIds"}
                    title={t("TeacherSubjectPage.StageSubjectName")}
                    placeholder={t("TeacherSubjectPage.enter-StageSubjectName")}
                    options={
                      stageSubject?.map((item) => ({
                        label: `${item.Subject.name} - ${t(item.Stage.name as any)} - ${item.Class.name}`,
                        value: item.id,
                      })) ?? []
                    }
                    props={{
                      isMulti: true,
                      isClearable: true,
                      onChange: (newValue: any) => {
                        props.setFieldValue("stageSubjectIds", newValue ?? []);

                        // Optionally use first selected for dependent UI
                        if (Array.isArray(newValue) && newValue.length > 0) {
                          const firstSelected = stageSubject?.find((item) => item.id === newValue[0].value);
                          setStageId(firstSelected?.stageId);
                          setClassId(firstSelected?.classId);
                        } else {
                          setStageId(undefined);
                          setClassId(undefined);
                        }

                        // Reset sections when selection changes
                        props.setFieldValue("sections", []);
                      },
                      onInputChange: (value) => {
                        setSearchSubject(value);
                      },
                    }}
                  />

                  <SelectForm
                    formikProps={props}
                    name={"teacherId"}
                    title={t("TeacherSubjectPage.TeacherName")}
                    placeholder={t("TeacherSubjectPage.enter-TeacherName")}
                    options={
                      teacher?.data.map((item) => {
                        return {
                          label: item.fullName,
                          value: item.id,
                        };
                      }) ?? []
                    }
                    props={{
                      isLoading: isFetchingTeacher,
                      isClearable: true,
                      onChange: (e) => {
                        props.setFieldValue("teacherId", (e as any)?.value ?? "");
                      },
                      onInputChange: (value) => {
                        setSearchTeacher(value);
                      },
                    }}
                  />
                </>
              )}

              <div>{t("SectionPage.Section")}</div>

              <div className="grid gap-4 grid-cols-4 items-center">
                {Stages?.Class.find((item) => item.id == classId)?.Section.map((item, index) => {
                  return (
                    <div key={index}>
                      <CheckBoxForm
                        key={index}
                        formikProps={props}
                        name={`sections.${index}.sectionId` as any}
                        title={`${item.name}`}
                        props={{
                          className: "rtl",
                          checked: props.values.sections.some((it: any) => it?.sectionId == item.id),
                          value: item.id,
                          onChange: (e) => {
                            if (e.target.checked) {
                              props.setFieldValue(`sections.${index}.sectionId`, item.id);
                            } else {
                              props.setFieldValue(`sections.${index}.sectionId`, "");
                            }
                          },
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {id && (
                <SelectForm
                  formikProps={props}
                  name={"teacherId"}
                  title={t("TeacherSubjectPage.TeacherName")}
                  placeholder={t("TeacherSubjectPage.enter-TeacherName")}
                  options={
                    teacher?.data.map((item) => {
                      return {
                        label: item.fullName,
                        value: item.id,
                      };
                    }) ?? []
                  }
                  props={{
                    isLoading: isFetchingTeacher,
                    isClearable: true,
                    onChange: (e) => {
                      props.setFieldValue("teacherId", (e as any)?.value ?? "");
                    },
                    onInputChange: (value) => {
                      setSearchTeacher(value);
                    },
                  }}
                />
              )}

              <div className="flex flex-row-reverse gap-2">
                <ButtonForm
                  props={{
                    type: "submit",
                    className: `w-full`,
                  }}
                  title={t("common.save")}
                  isLoading={isLoadingTeacherSubjectUpdate || isLoadingTeacherSubjectCreate}
                />
              </div>
            </Form>
          )}
        </Formik>
      )}
    </Model>
  );
};

export default CreateComponent;
