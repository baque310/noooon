"use client";

import React from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { Form, Formik, FormikProps } from "formik";
import { ButtonForm } from "@/components/Form/ButtonForm";
import { getTranslation } from "@/ni18n/i18n";
import { AddStudentEnrollmentPayload, useLazyStudentEnrollmentGetDataByIdQuery, useStudentEnrollmentCreateMutation } from "@/services/admin/studentEnrollment";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { SelectForm } from "@/components/Form/SelectForm";
import { InputCurrencyMaskForm, InputForm } from "@/components/Form/inputForm";
import { useStudentGetDataHasNoEnrollmentQuery } from "@/services/admin/student";
import { CheckBoxForm } from "@/components/Form/CheckBoxForm";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";

import { useSettingGetDataQuery } from "@/services/Setting";

export interface FormValues extends AddStudentEnrollmentPayload {
  amountStudent: string;
}

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [searchStudent, setSearchStudent] = useState("");
  const [StudentEnrollmentGetDataById, { currentData: data, isFetching }] = useLazyStudentEnrollmentGetDataByIdQuery();
  useEffect(() => {
    if (id) {
      StudentEnrollmentGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);

  const [StudentEnrollmentCreate, { isLoading: isLoadingStudentEnrollmentCreate }] = useStudentEnrollmentCreateMutation();
  const [SchoolYearId, setSchoolYearId] = useState<string | undefined>();
  const { currentData: StudentData, isFetching: isFetchingStudent } = useStudentGetDataHasNoEnrollmentQuery({
    search: searchStudent,
    skip: 1,
    take: 100,
    schoolYearId: SchoolYearId,
  });
  const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();
  const { currentData: SchoolYear, isFetching: isFetchingSchoolYear } = useSchoolYearGetDataQuery();
  const { currentData: Setting, isFetching: isFetchingSetting } = useSettingGetDataQuery();
  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {
      await StudentEnrollmentCreate({
        students: values.students
          .filter((i) => !!i?.studentId)
          .map((item: any) => {
            return {
              studentId: item?.studentId,
              // amount: Number(item.amount),
            };
          }),
        schoolYearId: values.schoolYearId,
        classId: values.classId,
        sectionId: values.sectionId,
        stageId: values.stageId,
      }).unwrap();

      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000 });
      resetForm();
      if (id) {
        router.back();
      }
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message == 'Resource already exists. More details: {"modelName":"StudentEnrollment","target":"student_enrollments_schoolYearId_studentId_key"}') {
          return toast.error(t("StudentEnrollmentPage.schoolYear-already-exists"), { autoClose: 30000 });
        }
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const studentSchema = Yup.object().shape({
    classId: Yup.string().required(t("common.this-field-is-required")),
    sectionId: Yup.string().required(t("common.this-field-is-required")),
    stageId: Yup.string().required(t("common.this-field-is-required")),
    schoolYearId: Yup.string().required(t("common.this-field-is-required")),
    students: Yup.array()
      // .of(
      //   Yup.object().shape({
      //     amount: Yup.string().required(t("common.this-field-is-required")),
      //   })
      // )
      .required(t("common.this-field-is-required")),
    amountStudent: Yup.string().required(t("common.this-field-is-required")),
  });

  useEffect(() => {
    if (Setting) {
      setSchoolYearId(Setting.currentSchoolYearId);
    }
  }, [Setting]);

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "StudentEnrollmentPage.update-info" : "StudentEnrollmentPage.add")} />

        {isFetching || isFetchingSchoolYear || isFetchingSetting ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              classId: data?.classId || "",
              sectionId: data?.sectionId || "",
              stageId: data?.stageId || "",
              schoolYearId: Setting?.currentSchoolYearId || "",
              students: [],
              amountStudent: "0",
            }}
            validationSchema={studentSchema}
            onSubmit={handleSubmit}>
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("StudentEnrollmentPage.infoStudentEnrollment")}</div>

                  <SelectForm
                    formikProps={props}
                    name={"schoolYearId"}
                    title={t("StudentEnrollmentPage.SchoolYear")}
                    placeholder={t("StudentEnrollmentPage.enter-SchoolYear")}
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
                        setSchoolYearId((e as any)?.value ?? "");
                        props.setFieldValue("schoolYearId", (e as any)?.value ?? "");
                      },
                    }}
                  />
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
                </div>

                <div className="Card flex flex-col gap-2">
                  <div className=" text-sm font-semibold text-black dark:text-white-dark  mb-2 ">{t("StudentEnrollmentPage.Students-and-Amount")}</div>
                  {/* <InputCurrencyMaskForm
                    formikProps={props}
                    name={"amountStudent"}
                    title={t("StudentEnrollmentPage.AmountStudent")}
                    placeholder={t("StudentEnrollmentPage.enter-AmountStudent")}
                    iconRight={
                      <span className="font-bold text-teal-500 bg-teal-500/20 h-full justify-center items-center rounded-md flex text-xs px-1">
                        {t("IQD")}
                      </span>
                    }
                    props={{
                      onChange: (e) => {
                        StudentData?.data.map((item, index) => {
                          props.setFieldValue(
                            `students.${index}.amount`,
                            e.target.value
                          );
                        });
                      },
                    }}
                  /> */}
                  <InputForm
                    formikProps={props}
                    name={"searchStudent"}
                    title={t("" as any)}
                    placeholder={t("common.search")}
                    props={{
                      onChange: (e) => {
                        setSearchStudent(e.target.value);
                        props.setFieldValue("searchStudent", e.target.value);
                      },
                    }}
                  />
                  <>
                    {isFetchingStudent ? (
                      <div className="flex justify-center my-2">
                        <div className="loader !bg-primary !w-10 !h-10" />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 py-2">
                        {StudentData?.data.map((item, index) => (
                          <div className="flex gap-3 items-center" key={item.id}>
                            <CheckBoxForm
                              key={index}
                              formikProps={props}
                              name={`students.${index}.studentId`}
                              title={`${item.fullName}`}
                              props={{
                                className: "rtl",
                                checked: props.values.students.some((it: any) => it?.studentId == item.id),
                                value: props.values.students.some((it: any) => it?.studentId == item.id),
                                onChange: (e) => {
                                  if (e.target.checked) {
                                    props.setFieldValue(`students.${index}.studentId`, item.id);
                                    props.setFieldValue(`students.${index}.amount`, props.values.amountStudent);
                                  } else {
                                    props.setFieldValue(`students.${index}.studentId`, "");
                                    props.setFieldValue(`students.${index}.amount`, "");
                                  }
                                },
                              }}
                            />

                            {/* <InputCurrencyMaskForm
                              formikProps={props}
                              name={`students.${index}.amount`}
                              title={""}
                              placeholder={t(
                                "StudentEnrollmentPage.enter-Amount"
                              )}
                              props={{
                                disabled: !props.values?.students?.some(
                                  (it: any) => it?.studentId == item?.id
                                ),
                              }}
                              iconRight={
                                <span className="font-bold text-teal-500 bg-teal-500/20 h-full justify-center items-center rounded-md flex text-xs px-1">
                                  {t("IQD")}
                                </span>
                              }
                            /> */}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                </div>

                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",
                    }}
                    title={t("common.save")}
                    isLoading={isLoadingStudentEnrollmentCreate}
                  />
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </>
  );
};

export default PageComponent;
