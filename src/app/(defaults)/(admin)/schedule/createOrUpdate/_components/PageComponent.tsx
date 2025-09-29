"use client";

import React from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";

import { getTranslation } from "@/ni18n/i18n";
import {
  AddSchedulePayload,
  daysArray,
  UpdateSchedulePayload,
  useLazyScheduleGetDataByIdQuery,
  useScheduleCreateMutation,
  useScheduleUpdateMutation,
} from "@/services/admin/Schedule";
import { FieldArray, FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
export interface FormValues extends AddSchedulePayload, UpdateSchedulePayload {
  schoolYearId: string;
}
import { ButtonForm } from "@/components/Form/ButtonForm";
import { Form, Formik, FormikProps } from "formik";
import IconCaretsDown from "@/components/common/icons/sidebar/icon-carets-down";
import AnimateHeight from "react-animate-height";
import { SelectForm } from "@/components/Form/SelectForm";
import { listTime } from "@/utils/time";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import moment from "moment";
import { Days } from "@/services/types/BaseType";
import { useSettingGetDataQuery } from "@/services/Setting";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [ScheduleGetDataById, { currentData: data, isFetching }] = useLazyScheduleGetDataByIdQuery();
  const { currentData: SettingGetData, isFetching: isFetchingSettingGetData } = useSettingGetDataQuery();
  const { currentData: SchoolYear, isFetching: isFetchingSchoolYear } = useSchoolYearGetDataQuery();

  useEffect(() => {
    if (id) {
      ScheduleGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);
  const [ScheduleCreate, { isLoading: isLoadingScheduleCreate }] = useScheduleCreateMutation();
  const [ScheduleUpdate, { isLoading: isLoadingScheduleUpdate }] = useScheduleUpdateMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {
      if (id) {
        await ScheduleUpdate({
          body: {
            timeFrom: moment.utc(values.timeFrom, "hh:mm a").format("HH:mm:ss"),
            timeTo: moment.utc(values.timeTo, "hh:mm a").format("HH:mm:ss"),
          },
          id: String(id),
        }).unwrap();
      } else {
        await ScheduleCreate({
          schedules: values.schedules.map((schedules) => {
            return {
              ...schedules,
              timeFrom: moment.utc(schedules.timeFrom, "hh:mm a").format("HH:mm:ss"),
              timeTo: moment.utc(schedules.timeTo, "hh:mm a").format("HH:mm:ss"),
              schoolYearId: values.schoolYearId,
            };
          }),
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
        if (error.message && error.message == "A schedule with the same details already exists.") {
          return toast.error(t("SchedulePage.A-schedule-with-the-same-details-already-exists"), { autoClose: 30000 });
        }
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const scheduleSchema = Yup.object().shape({
    ...(id
      ? {
          timeFrom: Yup.string().required(t("common.this-field-is-required")),
          timeTo: Yup.string().required(t("common.this-field-is-required")),
        }
      : {
          schedules: Yup.array().of(
            Yup.object().shape({
              day: Yup.string().required(t("common.this-field-is-required")),
              timeFrom: Yup.string().required(t("common.this-field-is-required")),
              timeTo: Yup.string().required(t("common.this-field-is-required")),
            })
          ),
          schoolYearId: Yup.string().required(t("common.this-field-is-required")),
        }),
  });

  const schedules = {
    day: daysArray[0]?.value as Days,
    timeFrom: "",
    timeTo: "",
    schoolYearId: SettingGetData?.CurrentSchoolYear?.id ?? "",
  };

  const [active, setActive] = useState<number>(-1);
  const togglePara = (value: number) => {
    setActive((oldValue) => {
      return oldValue === value ? -1 : value;
    });
  };

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "SchedulePage.update-info" : "common.add")} />

        {isFetching || isFetchingSettingGetData || isFetchingSchoolYear ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              schedules: [schedules],
              schoolYearId: schedules.schoolYearId,
              timeFrom: data?.timeFrom ? moment.utc(data?.timeFrom).format("hh:mm a") : "",
              timeTo: data?.timeTo ? moment.utc(data?.timeTo).format("hh:mm a") : "",
            }}
            validationSchema={scheduleSchema}
            onSubmit={handleSubmit}>
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <SelectForm
                    formikProps={props}
                    name={`schoolYearId`}
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
                        props.setFieldValue(`schoolYearId`, (e as any)?.value ?? "");
                      },
                    }}
                  />
                </div>
                {!id ? (
                  <FieldArray name="schedules">
                    {({ insert, remove, push, replace }) => (
                      <div className={"flex flex-col gap-4 "}>
                        {props.values.schedules?.map((_: any, index: number) => {
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

                                  <p>
                                    {t(_.day)} {" / "}
                                  </p>
                                  <p>
                                    {`${_.timeFrom} `} {" - "}
                                  </p>
                                  <p>{_.timeTo}</p>
                                </bdi>
                                <div className={`ltr:ml-auto rtl:mr-auto ${active === index ? "rotate-180" : ""}`}>
                                  <IconCaretsDown />
                                </div>
                              </button>

                              <AnimateHeight duration={300} height={active === index ? "auto" : 0}>
                                <div className={"flex flex-col gap-4  mt-3 p-2 "}>
                                  <div className={" Card"}>
                                    <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("SchedulePage.ScheduleInformation")}</div>
                                    <SelectForm
                                      formikProps={props}
                                      name={`schedules.${index}.day`}
                                      title={t("SchedulePage.day")}
                                      placeholder={t("SchedulePage.select-day")}
                                      options={daysArray.map((day) => {
                                        return {
                                          value: day.value,
                                          label: t(day.label as any),
                                        };
                                      })}
                                      props={{
                                        isClearable: true,
                                        onChange: (e) => {
                                          props.setFieldValue(`schedules.${index}.day`, (e as any)?.value ?? "");
                                        },
                                      }}
                                    />
                                    <SelectForm
                                      formikProps={props}
                                      name={`schedules.${index}.timeFrom`}
                                      title={t("SchedulePage.timeFrom")}
                                      placeholder={t("SchedulePage.select-timeFrom")}
                                      options={listTime}
                                      props={{
                                        isClearable: true,
                                        onChange: (e) => {
                                          props.setFieldValue(`schedules.${index}.timeFrom`, (e as any)?.value ?? "");
                                        },
                                      }}
                                    />
                                    <SelectForm
                                      formikProps={props}
                                      name={`schedules.${index}.timeTo`}
                                      title={t("SchedulePage.timeTo")}
                                      placeholder={t("SchedulePage.select-timeTo")}
                                      options={listTime}
                                      props={{
                                        isClearable: true,
                                        onChange: (e) => {
                                          props.setFieldValue(`schedules.${index}.timeTo`, (e as any)?.value ?? "");
                                        },
                                      }}
                                    />
                                  </div>

                                  {props.values.schedules?.length - 1 != 0 && (
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
                        {
                          // index == props.values.targets.length - 1 &&
                          <button
                            type="button"
                            className=" w-fit mr-auto bg-secondary/10 hover:bg-secondary/20 border-secondary/70 text-secondary/70 hover:scale-[1.01] transition-transform py-1 px-2   rounded border"
                            onClick={() => push(schedules)}>
                            {t("common.add")}
                          </button>
                        }
                      </div>
                    )}
                  </FieldArray>
                ) : (
                  <div className="Card flex flex-col gap-1">
                    <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("SchedulePage.ScheduleInformation")}</div>
                    <SelectForm
                      formikProps={props}
                      name={`timeFrom`}
                      title={t("SchedulePage.timeFrom")}
                      placeholder={t("SchedulePage.select-timeFrom")}
                      options={listTime}
                      props={{
                        isClearable: true,
                        onChange: (e) => {
                          props.setFieldValue(`timeFrom`, (e as any)?.value ?? "");
                        },
                      }}
                    />
                    <SelectForm
                      formikProps={props}
                      name={`timeTo`}
                      title={t("SchedulePage.timeTo")}
                      placeholder={t("SchedulePage.select-timeTo")}
                      options={listTime}
                      props={{
                        isClearable: true,
                        onChange: (e) => {
                          props.setFieldValue(`timeTo`, (e as any)?.value ?? "");
                        },
                      }}
                    />
                  </div>
                )}

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
                    isLoading={isLoadingScheduleUpdate || isLoadingScheduleCreate}
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
