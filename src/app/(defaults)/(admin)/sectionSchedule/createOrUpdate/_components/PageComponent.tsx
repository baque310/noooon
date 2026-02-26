"use client";

import React, { FC } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";

import { getTranslation, TranslationKeys } from "@/ni18n/i18n";
import { useLazySectionScheduleGetDataByIdQuery, useSectionScheduleCreateMutation, useSectionScheduleUpdateMutation } from "@/services/admin/SectionSchedule";
import { FieldArray, FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

export interface FormValues {
  teacherSubjectId: string;
  classId: string;
  schoolYearId: string;
  stageId: string;
  sectionId: string;
  days: {
    value: Days;
    label: Days;
    SectionSchedules: {
      teacherSubjectId: string;
      scheduleId: string;
    }[];
  }[];
}

import { ButtonForm } from "@/components/Form/ButtonForm";
import { Form, Formik, FormikProps } from "formik";
import IconCaretsDown from "@/components/common/icons/sidebar/icon-carets-down";
import AnimateHeight from "react-animate-height";
import { SelectForm } from "@/components/Form/SelectForm";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";

import { useTeacherSubjectGetDataQuery } from "@/services/admin/TeacherSubject";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { useSettingGetDataQuery } from "@/services/Setting";
import { daysArray } from "@/services/admin/Schedule";
import { Days } from "@/services/types/BaseType";
import TeacherSubjectAndSchedule from "./TeacherSubjectAndSchedule";
import { isArray } from "lodash";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [SectionScheduleGetDataById, { currentData: data, isFetching }] = useLazySectionScheduleGetDataByIdQuery();
  const { currentData: SchoolYear, isFetching: isFetchingSchoolYear } = useSchoolYearGetDataQuery();
  const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();
  const { currentData: Setting, isFetching: isFetchingSetting } = useSettingGetDataQuery();
  const [classId, setClassId] = useState<string | undefined>();
  const [stageId, setStageId] = useState<string | undefined>();
  const [sectionId, setSectionId] = useState<string | undefined>();

  useEffect(() => {
    if (id) {
      SectionScheduleGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        } else {
          setSectionId(data.data.sectionId);
        }
      });
    }
  }, [id]);

  const { isFetching: isFetchingTeacherSubject, currentData: TeacherSubject } = useTeacherSubjectGetDataQuery(
    {
      stageId: stageId,
      classId: classId,
      sectionId: sectionId,
      schoolYearId: data?.schoolYearId || Setting?.CurrentSchoolYear.id || "",
    },
    {
      skip: !sectionId && !data?.schoolYearId,
    }
  );

  const [SectionScheduleCreate, { isLoading: isLoadingSectionScheduleCreate }] = useSectionScheduleCreateMutation();
  const [SectionScheduleUpdate, { isLoading: isLoadingSectionScheduleUpdate }] = useSectionScheduleUpdateMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {
      if (id) {
        await SectionScheduleUpdate({
          body: {
            teacherSubjectId: values.teacherSubjectId,
          },
          id: String(id),
        }).unwrap();
      } else {
        const SectionSchedules = values.days?.map((it) => {
          if (it?.SectionSchedules) {
            it.SectionSchedules = it.SectionSchedules.map((section) => {
              return {
                scheduleId: section.scheduleId,
                teacherSubjectId: section.teacherSubjectId,
                schoolYearId: values.schoolYearId,
                sectionId: values.sectionId,
              };
            });
            return it;
          }
        });

        await SectionScheduleCreate({
          SectionSchedules: SectionSchedules?.filter((day): day is any => day !== null) // Filter out null values
            .flatMap((day) => day?.SectionSchedules)
            .filter((it) => !!it),
        }).unwrap();
      }
      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000 });
      resetForm();
      if (id) {
        router.back();
      }
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message == "A section schedule with the same details already exists.") {
          return toast.error(t("SectionSchedulePage.A-section-schedule-with-the-same-details-already-exists"), { autoClose: 30000 });
        }
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const sectionScheduleSchema = Yup.object().shape({
    ...(id
      ? {
          teacherSubjectId: Yup.string().required(t("common.this-field-is-required")),
        }
      : {
          days: Yup.array()
            .of(
              Yup.object()
                .shape({
                  SectionSchedules: Yup.array().of(
                    Yup.object().shape({
                      teacherSubjectId: Yup.string().required(t("common.this-field-is-required")),
                      scheduleId: Yup.string().required(t("common.this-field-is-required")),
                    })
                  ),
                })
                .nullable() // Allow null values in the array
            )
            .test("at-least-one", t("common.at-least-oneDay-required-content-subject"), (value) =>
              value?.some((item) => item !== null && item.SectionSchedules && item.SectionSchedules.length > 0)
            ),
          schoolYearId: Yup.string().required(t("common.this-field-is-required")),
          stageId: Yup.string().required(t("common.this-field-is-required")),
          classId: Yup.string().required(t("common.this-field-is-required")),
          sectionId: Yup.string().required(t("common.this-field-is-required")),
        }),
  });

  const [SectionSchedules, setSectionSchedules] = useState({
    teacherSubjectId: "",
    sectionId: "",
    scheduleId: "",
    schoolYearId: Setting?.CurrentSchoolYear.id,
  });

  useEffect(() => {
    if (Setting?.CurrentSchoolYear.id) {
      setSectionSchedules({
        ...SectionSchedules,
        schoolYearId: Setting?.CurrentSchoolYear.id,
      });
    }
  }, [Setting?.CurrentSchoolYear.id]);

  const [active, setActive] = useState<number>(-1);
  const togglePara = (value: number) => {
    setActive((oldValue) => {
      return oldValue === value ? -1 : value;
    });
  };

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "SectionSchedulePage.update-info" : "common.add")} />
        {isFetching || isFetchingSetting ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              teacherSubjectId: data?.teacherSubjectId || "",
              schoolYearId: data?.schoolYearId || Setting?.CurrentSchoolYear.id || "",
              stageId: data?.section?.Class?.Stage?.id || "",
              classId: data?.section?.Class?.id || "",
              sectionId: "",
              days: daysArray as any,
            }}
            validationSchema={sectionScheduleSchema}
            onSubmit={handleSubmit}
            enableReinitialize>
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("SectionSchedulePage.SectionScheduleInformation")}</div>
                  <SelectForm
                    formikProps={props}
                    name={`schoolYearId`}
                    title={t("SectionSchedulePage.SchoolYear")}
                    placeholder={t("SectionSchedulePage.select-SchoolYear")}
                    options={
                      SchoolYear?.map((item) => {
                        return {
                          label: item.from + " - " + item.to,
                          value: item.id,
                        };
                      }) ?? []
                    }
                    props={{
                      isLoading: isFetchingSchoolYear || isFetchingSetting,
                      isClearable: true,
                      onChange: (e) => {
                        props.setFieldValue(`schoolYearId`, (e as any)?.value ?? "");
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
                        props.setFieldValue(`stageId`, (e as any)?.value ?? "");
                        setStageId((e as any)?.value ?? "");
                        props.setFieldValue(`classId`, undefined);
                        props.setFieldValue(`sectionId`, undefined);
                        props.setFieldValue(`SectionSchedules`, undefined);
                      },
                    }}
                  />

                  {props.values?.stageId && (
                    <SelectForm
                      formikProps={props}
                      name={`classId`}
                      title={t("SectionSchedulePage.ClassName")}
                      placeholder={t("SectionSchedulePage.select-ClassName")}
                      options={
                        stage
                          ? stage
                              .find((item) => item.id === props.values?.stageId)
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
                          setClassId(value);
                          props.setFieldValue(`sectionId`, undefined);
                          props.setFieldValue(`SectionSchedules`, undefined);
                        },
                      }}
                    />
                  )}
                  {props?.values?.classId && (
                    <SelectForm
                      formikProps={props}
                      name={`sectionId`}
                      title={t("SectionSchedulePage.SectionName")}
                      placeholder={t("SectionSchedulePage.select-SectionName")}
                      options={
                        stage
                          ? stage
                              .find((item) => item.id === props?.values?.stageId)
                              ?.Class?.find((item) => item.id === props?.values?.classId)
                              ?.Section?.map((item) => {
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
                          props.setFieldValue(`sectionId`, (e as any)?.value ?? "");
                          setSectionId((e as any)?.value ?? "");
                          props.setFieldValue(`SectionSchedules`, undefined);
                        },
                      }}
                    />
                  )}
                </div>

                {!id ? (
                  <>
                    {!isArray(props.errors.days) && <div className="mt-[2px] w-full p-1 text-sm text-danger">{t((props.errors.days ?? "") as any)}</div>}
                    <FieldArray name="days">
                      {({ insert, remove, push, replace }) => (
                        <div className={"flex flex-col gap-4 "}>
                          {props.values.days?.map((_: any, index: number) => {
                            return (
                              <div key={index} className="">
                                <button
                                  type="button"
                                  className={` Card w-full  flex items-center text-white-dark dark:bg-[#1b2e4b] ${active === index ? "!text-primary" : ""}`}
                                  onClick={() => togglePara(index)}>
                                  <bdi className=" flex gap-1">
                                    <p>
                                      {index + 1} {")"}
                                    </p>
                                    <p>{t(_.value)}</p>
                                  </bdi>

                                  <div className={`ltr:ml-auto rtl:mr-auto ${active === index ? "rotate-180" : ""}`}>
                                    <IconCaretsDown />
                                  </div>
                                </button>

                                <AnimateHeight duration={300} height={active === index ? "auto" : 0}>
                                  <div className={"flex flex-col gap-4  mt-3 p-2 "}>
                                    <div>
                                      <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("SectionSchedulePage.SectionScheduleInformation")}</div>
                                      {props?.values?.sectionId && (
                                        <TeacherSubjectAndSchedule
                                          index={index}
                                          props={props}
                                          TeacherSubject={TeacherSubject}
                                          isFetchingTeacherSubject={isFetchingTeacherSubject}
                                        />
                                      )}
                                    </div>

                                    {props.values.SectionSchedules?.length - 1 != 0 && (
                                      <div className="flex justify-end gap-2 mt-2">
                                        <button
                                          type="button"
                                          className=" hover:bg-danger/10 border-danger/70 text-danger/70  hover:scale-[1.01] transition-transform py-[2px] px-2  rounded border"
                                          onClick={() => remove(index)}>
                                          {t("common.delete")}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </AnimateHeight>
                              </div>
                            );
                          })}
                          {props.values.days.length < 7 && (
                            <button
                              type="button"
                              className=" w-fit mr-auto bg-secondary/10 hover:bg-secondary/20 border-secondary/70 text-secondary/70 hover:scale-[1.01] transition-transform py-1 px-2   rounded border"
                              onClick={() => {
                                const remainingDays = daysArray.filter((day) => !props.values.days.some((matrixDay: any) => matrixDay.value === day.value));
                                if (remainingDays.length > 0) {
                                  push(remainingDays[0]);
                                }
                              }}>
                              {t("common.add")}
                            </button>
                          )}
                        </div>
                      )}
                    </FieldArray>
                  </>
                ) : (
                  <div className="Card flex flex-col gap-1">
                    <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("SectionSchedulePage.SectionScheduleInformation")}</div>
                    <SelectForm
                      formikProps={props}
                      name={`teacherSubjectId`}
                      title={t("SectionSchedulePage.teacherSubject")}
                      placeholder={t("SectionSchedulePage.select-teacherSubject")}
                      options={
                        TeacherSubject?.map((item, index) => {
                          return {
                            label: (
                              <div className="flex gap-1">
                                <div>{item.StageSubject.Subject.name}</div>
                                <div>{"( "}</div>
                                <div>{item.Teacher.fullName}</div>
                                <div>{" )"}</div>
                              </div>
                            ),
                            value: item.id,
                          };
                        }) || []
                      }
                      props={{
                        isClearable: true,
                        onChange: (e) => {
                          props.setFieldValue(`teacherSubjectId`, (e as any)?.value ?? "");
                        },
                      }}
                    />
                  </div>
                )}

                {/* <MessageErrorComponent
                  errors={props.errors}
                  data={
                    [
                      {
                        name: 'stageId',
                        title: 'SectionSchedulePage.StageName'
                      },
                      {
                        name: 'days',
                        title: 'SectionSchedulePage.days'
                      },

                    ]}
                /> */}

                {props.errors && Object.keys(props?.errors)?.length > 0 && (
                  <div className="Card !dark:bg-danger-dark-light !bg-danger-light">
                    <div className="flex flex-col  rounded bg-danger-light p-3.5 text-danger dark:bg-danger-dark-light">
                      {Object.keys(props?.errors ?? {})?.map((item: any, index) => {
                        return (
                          <span key={index} className="ltr:pr-2 rtl:pl-2">
                            <strong className="ltr:mr-1 rtl:ml-1">{t(item)}</strong>:
                            {typeof props?.errors[item] === "string"
                              ? (JSON.stringify(props?.errors[item]) as any)
                              : props?.errors &&
                                props?.errors[item] &&
                                Object.keys(props?.errors[item] as any)?.map((item2: any, index) => {
                                  return (
                                    <span key={index} className="flex flex-col ltr:pr-2 rtl:pl-2">
                                      <strong className="ltr:mr-1 rtl:ml-1">{Number(item2.split(".")[0]) + 1 + t(item2.split(".")[1])}</strong>
                                      {props?.errors &&
                                        (props?.errors as any)[item][item2] &&
                                        Object.keys((props?.errors as any)[item][item2]).map((item3: any, index) => {
                                          return (
                                            <span key={index} className="ltr:pr-2 rtl:pl-2">
                                              <strong className="ltr:mr-1 rtl:ml-1">{t(item3)}</strong>:{JSON.stringify((props?.errors as any)[item][item2][item3])}
                                            </span>
                                          );
                                        })}
                                    </span>
                                  );
                                })}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",
                    }}
                    title={t("common.save")}
                    isLoading={isLoadingSectionScheduleUpdate || isLoadingSectionScheduleCreate}
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

interface MessageComponentProps {
  errors: any;
  data: {
    name: string;
    title: TranslationKeys;
  }[];
}
export const MessageErrorComponent: FC<MessageComponentProps> = ({ errors, data }) => {
  const { t } = getTranslation();
  return (
    <>
      {errors && (
        <div className="Card flex flex-col gap-1 bg-danger-light border-danger">
          {data.map((item, index) => {
            return (
              <div key={index} className="mt-[2px] w-full p-1 text-sm text-danger">
                <span className="font-bold">{t(item.title as any)} :</span>
                {errors[item.name]}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
