"use client";

import React from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";

import { getTranslation } from "@/ni18n/i18n";
import {
  useLazyExamsGetDataByIdQuery,
  useExamsCreateMutation,
  useExamsUpdateMutation,
  AddExamsPayload,
  UpdateExamsPayload,
} from "@/services/admin/Exams";
import { FieldArray, FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
export interface FormValues extends AddExamsPayload, UpdateExamsPayload {}

import { ButtonForm } from "@/components/Form/ButtonForm";
import { Form, Formik, FormikProps } from "formik";
import IconCaretsDown from "@/components/common/icons/sidebar/icon-carets-down";
import AnimateHeight from "react-animate-height";
import { SelectForm } from "@/components/Form/SelectForm";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { isArray } from "lodash";
import { InputForm } from "@/components/Form/inputForm";
import { useExamTypeGetDataQuery } from "@/services/admin/ExamType";
import { useLazyStageSubjectGetDataQuery } from "@/services/admin/StageSubject";
import { DateTimeForm } from "@/components/Form/DateTimeForm";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [ExamsGetDataById, { currentData: data, isFetching }] =
    useLazyExamsGetDataByIdQuery();
  const [
    getStageSubject,
    { currentData: StageSubject, isFetching: isFetchingStageSubject },
  ] = useLazyStageSubjectGetDataQuery();
  const { currentData: stage, isFetching: isFetchingStage } =
    useStageGetDataQuery();
  const { currentData: ExamType, isFetching: isFetchingExamType } =
    useExamTypeGetDataQuery({});

  useEffect(() => {
    if (id) {
      ExamsGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);

  const [ExamsCreate, { isLoading: isLoadingExamsCreate }] =
    useExamsCreateMutation();
  const [ExamsUpdate, { isLoading: isLoadingExamsUpdate }] =
    useExamsUpdateMutation();

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    try {
      if (id) {
        await ExamsUpdate({
          body: {
            content: values.content,
          },
          id: String(id),
        }).unwrap();
      } else {
        await ExamsCreate({
          content: values.content,
          ExamSection: values.ExamSection.map((x) => {
            return {
              sectionId: x.sectionId,
              examDate: x.examDate,
            };
          }),
          examTypeId: values.examTypeId,
          stageSubjectId: values.stageSubjectId,
          score: Number(values.score),
        }).unwrap();
      }
      toast.success(
        t(id ? "common.updated-successfully" : "common.added-successfully"),
        { autoClose: 30000 }
      );
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

  const sectionScheduleSchema = Yup.object().shape({
    ...(id
      ? {
          content: Yup.string().required(t("common.this-field-is-required")),
        }
      : {
          ExamSection: Yup.array()
            .of(
              Yup.object()
                .shape({
                  examDate: Yup.string().required(
                    t("common.this-field-is-required")
                  ),
                  sectionId: Yup.string().required(
                    t("common.this-field-is-required")
                  ),
                })
                .nullable() // Allow null values in the array
            )
            .test(
              "at-least-one",
              t("common.at-least-oneDay-required-content-subject"),
              (value) =>
                value?.some(
                  (item) => item !== null && item.sectionId && item.examDate
                )
            ),
          stageId: Yup.string().required(t("common.this-field-is-required")),
          classId: Yup.string().required(t("common.this-field-is-required")),
          content: Yup.string().required(t("common.this-field-is-required")),
          stageSubjectId: Yup.string().required(
            t("common.this-field-is-required")
          ),
          examTypeId: Yup.string().required(t("common.this-field-is-required")),
          score: Yup.number()
            .max(100, t("ExamsPage.score-must-be-less-than-100"))
            .min(0, t("ExamsPage.score-must-be-more-than-0"))
            .required(t("common.this-field-is-required")),
        }),
  });

  const [active, setActive] = useState<number>(-1);
  const togglePara = (value: number) => {
    setActive((oldValue) => {
      return oldValue === value ? -1 : value;
    });
  };

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "ExamsPage.update-info" : "common.add")} />

        {isFetching ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              // data
              content: data?.content ?? "",
              ExamSection: [],
              examTypeId: "",
              stageSubjectId: "",
              score: data?.score ?? 0,
            }}
            validationSchema={sectionScheduleSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                {!id ? (
                  <>
                    <div className="Card flex flex-col gap-1">
                      <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                        {t("ExamsPage.ExamsInformation")}
                      </div>

                      <InputForm
                        formikProps={props}
                        name={`content`}
                        title={t("ExamsPage.content")}
                        placeholder={t("ExamsPage.enter-content")}
                        props={{
                          ...({ as: "textarea" } as any),
                        }}
                      />
                      <InputForm
                        formikProps={props}
                        name={`score`}
                        title={t("ExamsPage.score")}
                        placeholder={t("ExamsPage.enter-score")}
                        props={{
                          max: 100,
                          min: 0,
                          type: "number",
                        }}
                      />

                      <SelectForm
                        formikProps={props}
                        name={`examTypeId`}
                        title={t("ExamsPage.examTypName")}
                        placeholder={t("ExamsPage.select-examTypName")}
                        options={
                          ExamType?.map((item) => {
                            return {
                              label: item.name,
                              value: item.id,
                            };
                          }) ?? []
                        }
                        props={{
                          isLoading: isFetchingExamType,
                          isClearable: true,
                          onChange: (e) => {
                            props.setFieldValue(
                              `examTypeId`,
                              (e as any)?.value ?? ""
                            );
                          },
                        }}
                      />

                      <SelectForm
                        formikProps={props}
                        name={`stageId`}
                        title={t("StageSubjectPage.StageName")}
                        placeholder={t("SectionSchedulePage.select-StageName")}
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
                            props.setFieldValue(
                              `stageId`,
                              (e as any)?.value ?? ""
                            );
                            props.setFieldValue(`classId`, undefined);
                            props.setFieldValue(`stageSubjectId`, undefined);
                          },
                        }}
                      />
                      {props.values?.stageId && (
                        <SelectForm
                          formikProps={props}
                          name={`classId`}
                          title={t("SectionSchedulePage.ClassName")}
                          placeholder={t(
                            "SectionSchedulePage.select-ClassName"
                          )}
                          options={
                            stage
                              ? stage
                                  .find(
                                    (item) => item.id === props.values?.stageId
                                  )
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
                              const value = (e as any)?.value ?? "";
                              props.setFieldValue(`classId`, value);
                              props.setFieldValue(`sectionId`, undefined);
                              props.setFieldValue(`stageSubjectId`, undefined);
                              getStageSubject({
                                classId: value,
                                stageId: props.values?.stageId,
                              });
                            },
                          }}
                        />
                      )}
                      <SelectForm
                        formikProps={props}
                        name={`stageSubjectId`}
                        title={t("ExamsPage.stageSubject")}
                        placeholder={t("ExamsPage.select-stageSubject")}
                        options={
                          StageSubject?.map((item, index) => {
                            return {
                              label: (
                                <div className="flex gap-1">
                                  <div>{item.Subject.name}</div>
                                  <div>{"( "}</div>
                                  <div>
                                    {item.Class.name} {" - "}{" "}
                                    {item.Stage.name &&
                                      t(item.Stage.name as any)}
                                  </div>
                                  <div>{" )"}</div>
                                </div>
                              ),
                              value: item.id,
                            };
                          }) || []
                        }
                        props={{
                          isLoading: isFetchingStageSubject,
                          isClearable: true,
                          onChange: (e) => {
                            props.setFieldValue(
                              `stageSubjectId`,
                              (e as any)?.value ?? ""
                            );
                          },
                        }}
                      />
                    </div>
                    {!isArray(props?.errors?.ExamSection) && (
                      <div className="mt-[2px] w-full p-1 text-sm text-danger">
                        {t((props?.errors?.ExamSection ?? "") as any)}
                      </div>
                    )}
                    <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                      {t("ExamsPage.ExamsInformationAndDate")}
                    </div>
                    <FieldArray name="ExamSection">
                      {({ insert, remove, push, replace }) => (
                        <div className={"flex flex-col gap-4 "}>
                          {props.values.ExamSection?.map(
                            (_: any, index: number) => {
                              return (
                                <div key={index} className="">
                                  <button
                                    type="button"
                                    className={` Card w-full  flex items-center text-white-dark dark:bg-[#1b2e4b] ${
                                      active === index ? "!text-primary" : ""
                                    }`}
                                    onClick={() => togglePara(index)}
                                  >
                                    {_.examDate || _.sectionValue ? (
                                      <bdi className=" flex gap-1">
                                        <bdi>{t(_.examDate)}</bdi>
                                        {_.sectionValue && (
                                          <>
                                            <bdi>{"( "}</bdi>

                                            <bdi>{t(_.sectionValue)}</bdi>
                                            <bdi>{" )"}</bdi>
                                          </>
                                        )}
                                      </bdi>
                                    ) : (
                                      <bdi>
                                        {t("ExamsPage.selectSectionAndDate")}
                                      </bdi>
                                    )}

                                    <div
                                      className={`ltr:ml-auto rtl:mr-auto ${
                                        active === index ? "rotate-180" : ""
                                      }`}
                                    >
                                      <IconCaretsDown />
                                    </div>
                                  </button>

                                  <AnimateHeight
                                    duration={300}
                                    height={active === index ? "auto" : 0}
                                  >
                                    <div
                                      className={
                                        "flex flex-col gap-4  mt-3 p-2 "
                                      }
                                    >
                                      <div className="Card">
                                        <div className="flex justify-end w-full relative mb-2">
                                          <button
                                            className="absolute top-0 hover:bg-danger/10 border-danger/70 text-danger/70  hover:scale-[1.01] transition-transform py-[2px] px-2  rounded  font-bold"
                                            type="button"
                                            onClick={() => {
                                              remove(index);
                                            }}
                                          >
                                            x
                                          </button>
                                        </div>

                                        <DateTimeForm
                                          formikProps={props}
                                          name={`ExamSection.${index}.examDate`}
                                          title={t("ExamsPage.examDate")}
                                          placeholder={t(
                                            "ExamsPage.enter-examDate"
                                          )}
                                        />
                                        <SelectForm
                                          formikProps={props}
                                          name={`ExamSection.${index}.sectionId`}
                                          title={t(
                                            "SectionSchedulePage.SectionName"
                                          )}
                                          placeholder={t(
                                            "SectionSchedulePage.select-SectionName"
                                          )}
                                          options={
                                            stage
                                              ? stage
                                                  .find(
                                                    (item) =>
                                                      item.id ===
                                                      props?.values?.stageId
                                                  )
                                                  ?.Class?.find(
                                                    (item) =>
                                                      item.id ===
                                                      props?.values?.classId
                                                  )
                                                  ?.Section?.map((item) => {
                                                    return {
                                                      label: t(
                                                        item.name as any
                                                      ),
                                                      value: item.id,
                                                    };
                                                  }) || []
                                              : []
                                          }
                                          props={{
                                            isLoading: isFetchingStage,
                                            isClearable: true,
                                            onChange: (e) => {
                                              props.setFieldValue(
                                                `ExamSection.${index}.sectionId`,
                                                (e as any)?.value ?? ""
                                              );
                                              props.setFieldValue(
                                                `ExamSection.${index}.sectionValue`,
                                                (e as any)?.label ?? ""
                                              );
                                            },
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </AnimateHeight>
                                </div>
                              );
                            }
                          )}
                          {props.values.ExamSection.length < 7 && (
                            <button
                              type="button"
                              className=" w-fit mr-auto bg-secondary/10 hover:bg-secondary/20 border-secondary/70 text-secondary/70 hover:scale-[1.01] transition-transform py-1 px-2   rounded border"
                              onClick={() => {
                                push({
                                  sectionId: "",
                                });
                              }}
                            >
                              {t("common.add")}
                            </button>
                          )}
                        </div>
                      )}
                    </FieldArray>
                  </>
                ) : (
                  <>
                    <div className="Card flex flex-col gap-1">
                      <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                        {t("ExamsPage.ExamsInformation")}
                      </div>

                      <InputForm
                        formikProps={props}
                        name={`content`}
                        title={t("ExamsPage.content")}
                        placeholder={t("ExamsPage.enter-content")}
                        props={{
                          ...({ as: "textarea" } as any),
                        }}
                      />
                    </div>
                  </>
                )}

                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",
                    }}
                    title={t("common.save")}
                    isLoading={isLoadingExamsUpdate || isLoadingExamsCreate}
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
