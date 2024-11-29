"use client"

import React from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';
import { Form, Formik, FormikProps } from 'formik';
import { ButtonForm } from '@/components/Form/ButtonForm';
import { getTranslation } from "@/ni18n/i18n";
import { AddStudentEnrollmentPayload, useLazyStudentEnrollmentGetDataByIdQuery, useStudentEnrollmentCreateMutation, useStudentEnrollmentUpdateMutation } from "@/services/admin/studentEnrollment";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
import { useClassGetDataQuery } from '@/services/admin/class';
import { useStageGetDataQuery } from '@/services/admin/stage';
import { SelectForm } from '@/components/Form/SelectForm';
import { InputForm } from '@/components/Form/inputForm';
import { useStudentGetDataQuery } from '@/services/admin/student';
import { CheckBoxForm } from '@/components/Form/CheckBoxForm';
import { useSchoolYearGetDataQuery } from '@/services/SchoolYear';
import { sortBy } from 'lodash';
import moment from 'moment';

export interface FormValues extends AddStudentEnrollmentPayload {

}



const PageComponent = () => {

  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [searchStudent, setSearchStudent] = useState("");
  const [StudentEnrollmentGetDataById, { currentData: data, isFetching }] = useLazyStudentEnrollmentGetDataByIdQuery()
  useEffect(() => {
    if (id) {
      StudentEnrollmentGetDataById({ id: String(id) })
        .then((data) => {
          if (!data.data) {
            router.back();
          }
        });
    }
  }, [id])

  const [StudentEnrollmentCreate, { isLoading: isLoadingStudentEnrollmentCreate }] = useStudentEnrollmentCreateMutation();
  const { currentData: StudentData, isFetching: isFetchingStudent } = useStudentGetDataQuery({
    search: searchStudent,
    skip: 1,
    take: 100,

  });
  const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();
  const { currentData: SchoolYear, isFetching: isFetchingSchoolYear } = useSchoolYearGetDataQuery();
  const handleSubmit = async (
    values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {

      await StudentEnrollmentCreate({
        ...values

      }).unwrap()

      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000, });
      resetForm();
      if (id) {
        router.back();
      }
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
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
    studentIds: Yup.array().required(t("common.this-field-is-required")),
  })



  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "StudentEnrollmentPage.update-info" : "StudentEnrollmentPage.add")} />

        {isFetching || isFetchingSchoolYear? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              classId: data?.classId || "",
              sectionId: data?.sectionId || "",
              stageId: data?.stageId || "",
              schoolYearId:
                SchoolYear?.find(item =>
                  item.from === moment().year()
                )?.id || "",
              studentIds: [],
            }}
            validationSchema={studentSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("StudentEnrollmentPage.infoStudentEnrollment")}
                  </div>

                  <SelectForm
                    formikProps={props}
                    name={"schoolYearId"}
                    title={t("StudentEnrollmentPage.SchoolYear")}
                    placeholder={t("StudentEnrollmentPage.enter-SchoolYear")}
                    options={SchoolYear?.map((item) => {
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
                        props.setFieldValue("schoolYearId", (e as any)?.value ?? "")
                      }
                    }}
                  />
                  <SelectForm
                    formikProps={props}
                    name={"stageId"}
                    title={t("StudentEnrollmentPage.StageName")}
                    placeholder={t("StudentEnrollmentPage.enter-StageName")}
                    options={stage?.map((item) => {
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
                        props.setFieldValue("stageId", (e as any)?.value ?? "")
                        props.setFieldValue("classId", "")
                        props.setFieldValue("sectionId", "")
                      }
                    }}
                  />

                  <SelectForm
                    formikProps={props}
                    name={"classId"}
                    title={t("StudentEnrollmentPage.ClassName")}
                    placeholder={t("StudentEnrollmentPage.enter-ClassName")}
                    options={stage ? stage
                      .find((item) => item.id === props.values.stageId)?.Class?.map((item) => {
                        return {
                          label: t(item.name as any),
                          value: item.id,
                        };
                      }) || [] : []
                    }
                    props={{
                      isLoading: isFetchingStage,
                      isClearable: true,
                      onChange: (e) => {
                        props.setFieldValue("classId", (e as any)?.value ?? "")
                        props.setFieldValue("sectionId", "")
                      }
                    }}
                  />

                  <SelectForm
                    formikProps={props}
                    name={"sectionId"}
                    title={t("StudentEnrollmentPage.SectionName")}
                    placeholder={t("StudentEnrollmentPage.enter-SectionName")}
                    options={stage ? stage
                      .find((item) => item.id === props.values.stageId)?.Class?.find(item =>
                        item.id === props.values.classId
                      )?.Section?.map((item) => {
                        return {
                          label: t(item.name as any),
                          value: item.id,
                        };
                      }) || [] : []
                    }
                    props={{
                      isClearable: true,
                      isLoading: isFetchingStage,
                      onChange: (e) => {
                        props.setFieldValue("sectionId", (e as any)?.value ?? "")
                      }
                    }}
                  />

                </div>

                <div className="Card">
                  <div className=" text-sm font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("StudentEnrollmentPage.Students")}
                  </div>
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
                          <div className="" key={item.id}>
                            <CheckBoxForm
                              key={index}
                              formikProps={props}
                              name={`studentIds.${index}`}
                              title={`${item.fullName}`}
                              props={{
                                className: "rtl",
                                checked: props.values.studentIds.some((it: any) => it == item.id),
                                value: props.values.studentIds.some((it: any) => it == item.id),
                                onChange: (e) => {
                                  if (e.target.checked) {
                                    let newValues = props.values.studentIds.concat(item.id);
                                    props.setFieldValue(`studentIds`, newValues);
                                  } else {
                                    let newValues = props.values.studentIds.filter((it: any) => it != item.id);
                                    props.setFieldValue(`studentIds`, newValues);
                                  }
                                },
                              }}
                            />
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

export default PageComponent

