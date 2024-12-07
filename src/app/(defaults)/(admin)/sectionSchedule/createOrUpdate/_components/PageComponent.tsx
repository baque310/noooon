"use client"

import React from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';

import { getTranslation } from "@/ni18n/i18n";
import { AddSectionSchedulePayload, UpdateSectionSchedulePayload, useLazySectionScheduleGetDataByIdQuery, useSectionScheduleCreateMutation, useSectionScheduleUpdateMutation } from "@/services/admin/SectionSchedule";
import { FieldArray, FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
export interface FormValues extends AddSectionSchedulePayload, UpdateSectionSchedulePayload {
  schoolYearId: string;
  // stageId: string;
}
import { ButtonForm } from '@/components/Form/ButtonForm';
import { Form, Formik, FormikProps } from 'formik';
import IconCaretsDown from '@/components/common/icons/sidebar/icon-carets-down';
import AnimateHeight from 'react-animate-height';
import { SelectForm } from '@/components/Form/SelectForm';
import { listTime } from '@/utils/time';
import { useSchoolYearGetDataQuery } from '@/services/SchoolYear';
import moment from 'moment';
import { useLazyTeacherSubjectGetDataQuery } from '@/services/admin/TeacherSubject';
import { useStageGetDataQuery } from '@/services/admin/stage';
import { useSettingGetDataQuery } from '@/services/Setting';
import { daysArray, useLazyScheduleGetDataQuery } from '@/services/admin/Schedule';
import { Days } from '@/services/types/BaseType';
import { useTeacherGetDataQuery } from '@/services/admin/teacher';

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [searchTeacher, setSearchTeacher] = useState<string | undefined>()
  const [SectionScheduleGetDataById, { currentData: data, isFetching }] = useLazySectionScheduleGetDataByIdQuery()
  const { currentData: SchoolYear, isFetching: isFetchingSchoolYear } = useSchoolYearGetDataQuery();
  const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();
  const { currentData: Setting, isFetching: isFetchingSetting } = useSettingGetDataQuery();
  const { currentData: teacher, isFetching: isFetchingTeacher } = useTeacherGetDataQuery({
    search: searchTeacher,
    skip: 1,
    take: 30,
  });
  const [getSchedule, { currentData: Schedule, isFetching: isFetchingSchedule }] = useLazyScheduleGetDataQuery();

  const [getTeacherSubject, { isFetching: isFetchingTeacherSubject, currentData: TeacherSubject }] = useLazyTeacherSubjectGetDataQuery();
  useEffect(() => {
    if (id) {
      SectionScheduleGetDataById({ id: String(id) })
        .then((data) => {
          if (!data.data) {
            router.back();
          }
        });
    }
  }, [id])
  const [SectionScheduleCreate, { isLoading: isLoadingSectionScheduleCreate }] = useSectionScheduleCreateMutation();
  const [SectionScheduleUpdate, { isLoading: isLoadingSectionScheduleUpdate }] = useSectionScheduleUpdateMutation();

  const handleSubmit = async (
    values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {

      console.log(values);


      if (id) {
        await SectionScheduleUpdate({
          body: {
            // timeFrom: moment.utc(values.timeFrom, "hh:mm a").format("HH:mm:ss"),
            // timeTo: moment.utc(values.timeTo, "hh:mm a").format("HH:mm:ss"),
            ...values
          },
          id: String(id),
        }
        ).unwrap()

      } else {
        await SectionScheduleCreate({
          SectionSchedules: values.SectionSchedules.map(SectionSchedules => {
            return {
              scheduleId: SectionSchedules.scheduleId,
              schoolYearId: SectionSchedules.schoolYearId,
              sectionId: SectionSchedules.sectionId,
              teacherSubjectId: SectionSchedules.teacherSubjectId
            }
          })

        }).unwrap()
      }
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

  const sectionScheduleSchema = Yup.object().shape({
    ...id ? {
      teacherSubjectId: Yup.string().required(t('common.this-field-is-required')),
    } : {
      SectionSchedules: Yup.array().of(
        Yup.object().shape({
          day: Yup.string().required(t('common.this-field-is-required')),
          teacherSubjectId: Yup.string().required(t('common.this-field-is-required')),
          sectionId: Yup.string().required(t('common.this-field-is-required')),
          scheduleId: Yup.string().required(t('common.this-field-is-required')),
          schoolYearId: Yup.string().required(t('common.this-field-is-required')),
        }))
    }
  })

  const [SectionSchedules, setSectionSchedules] = useState({
    "teacherSubjectId": "",
    "sectionId": "",
    "scheduleId": "",
    "schoolYearId": Setting?.CurrentSchoolYear.id,

  })

  useEffect(() => {
    if (Setting?.CurrentSchoolYear.id) {
      setSectionSchedules({
        ...SectionSchedules,
        "schoolYearId": Setting?.CurrentSchoolYear.id,
      })
    }
  }, [Setting?.CurrentSchoolYear.id])


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
              SectionSchedules: [],
              teacherSubjectId: data?.teacherSubjectId || "",
              schoolYearId: data?.schoolYearId || "",
              // stageId: data?.stageId || "",
            }}
            validationSchema={sectionScheduleSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                {!id ? <FieldArray name="SectionSchedules">
                  {({ insert, remove, push, replace }) => (
                    <div className={'flex flex-col gap-4 '}>
                      {props.values.SectionSchedules?.map((_: any, index: number) => {
                        return (
                          <div key={index} className="">
                            <button
                              type="button"
                              className={` Card w-full  flex items-center text-white-dark dark:bg-[#1b2e4b] ${active === index ? '!text-primary' : ''}`}
                              onClick={() => togglePara(index)}
                            >
                              <bdi className=' flex gap-1'>
                                <p>
                                  {index + 1} {")"}
                                </p>
                                <p>
                                  {t(_.day ?? "")}
                                </p>

                              </bdi>
                              <div
                                className={`ltr:ml-auto rtl:mr-auto ${active === index ? 'rotate-180' : ''}`}>
                                <IconCaretsDown />
                              </div>

                            </button>

                            <AnimateHeight duration={300}
                              height={active === index ? 'auto' : 0}>

                              <div className={'flex flex-col gap-4  mt-3 p-2 '}
                              >
                                <div
                                  className={' Card'}

                                >
                                  <div
                                    className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                                    {t('SectionSchedulePage.SectionScheduleInformation')}
                                  </div>


                                  <SelectForm
                                    formikProps={props}
                                    name={`SectionSchedules.${index}.day`}
                                    title={t('SectionSchedulePage.day')}
                                    placeholder={t('SectionSchedulePage.select-day')}
                                    options={daysArray.map(day => {
                                      return {
                                        label: t(day.value),
                                        value: day.value
                                      }
                                    })}
                                    props={{
                                      isClearable: true,
                                      onChange: (e) => {
                                        const value = (e as any)?.value ?? ""
                                        props.setFieldValue(`SectionSchedules.${index}.day`, value)
                                        getSchedule({
                                          day: value
                                        })
                                      },
                                      // onInputChange: (e) => {
                                      //   
                                      // }
                                    }}
                                  />
                                  <SelectForm
                                    formikProps={props}
                                    name={`SectionSchedules.${index}.schoolYearId`}
                                    title={t("SectionSchedulePage.SchoolYear")}
                                    placeholder={t("SectionSchedulePage.select-SchoolYear")}
                                    options={SchoolYear?.map((item) => {
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
                                        props.setFieldValue(`SectionSchedules.${index}.schoolYearId`, (e as any)?.value ?? "")
                                        props.setFieldValue(`SectionSchedules.${index}.stageId`, undefined)
                                        props.setFieldValue(`SectionSchedules.${index}.classId`, undefined)
                                        props.setFieldValue(`SectionSchedules.${index}.sectionId`, undefined)
                                      }
                                    }}
                                  />

                                  <SelectForm
                                    formikProps={props}
                                    name={`SectionSchedules.${index}.stageId`}
                                    title={t("StageSubjectPage.StageName")}
                                    placeholder={t("SectionSchedulePage.select-StageName")}
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
                                        props.setFieldValue(`SectionSchedules.${index}.stageId`, (e as any)?.value ?? "")
                                        props.setFieldValue(`SectionSchedules.${index}.classId`, undefined)
                                        props.setFieldValue(`SectionSchedules.${index}.sectionId`, undefined)

                                      }
                                    }}
                                  />

                                  {props.values.SectionSchedules[index].stageId && <SelectForm
                                    formikProps={props}
                                    name={`SectionSchedules.${index}.classId`}
                                    title={t("SectionSchedulePage.ClassName")}
                                    placeholder={t("SectionSchedulePage.select-ClassName")}
                                    options={stage ? stage
                                      .find((item) => item.id === props.values.SectionSchedules[index].stageId)?.Class?.map((item) => {
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
                                        const value = (e as any)?.value ?? ""
                                        props.setFieldValue(`SectionSchedules.${index}.classId`, value)
                                        props.setFieldValue(`SectionSchedules.${index}.sectionId`, undefined)
                                        getTeacherSubject({
                                          classId: value,
                                          stageId: props.values.SectionSchedules[index].stageId,
                                          schoolYearId: props.values.SectionSchedules[index].schoolYearId
                                        })

                                      }
                                    }}
                                  />}
                                  {props?.values?.SectionSchedules[index]?.classId && <SelectForm
                                    formikProps={props}
                                    name={`SectionSchedules.${index}.sectionId`}
                                    title={t("SectionSchedulePage.SectionName")}
                                    placeholder={t("SectionSchedulePage.select-SectionName")}
                                    options={stage ? stage
                                      .find((item) => item.id === props?.values?.SectionSchedules[index]?.stageId)?.Class
                                      ?.find((item) => item.id === props?.values?.SectionSchedules[index]?.classId)?.Section?.map((item) => {
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
                                        props.setFieldValue(`SectionSchedules.${index}.sectionId`, (e as any)?.value ?? "")
                                      }
                                    }}
                                  />}

                                  <SelectForm
                                    formikProps={props}
                                    name={`SectionSchedules.${index}.teacherSubjectId`}
                                    title={t('SectionSchedulePage.teacherSubject')}
                                    placeholder={t('SectionSchedulePage.select-teacherSubject')}
                                    options={TeacherSubject?.map((item, index) => {
                                      return {
                                        label: <div className='flex gap-1'>
                                          <div>
                                            {item.StageSubject.Subject.name}
                                          </div>
                                          <div>
                                            {"( "}
                                          </div>
                                          <div>
                                            {item.Teacher.fullName}
                                          </div>
                                          <div>
                                            {' )'}
                                          </div>
                                        </div>,
                                        value: item.id
                                      }
                                    }) || []
                                    }
                                    props={{
                                      isClearable: true,
                                      onChange: (e) => {
                                        props.setFieldValue(`SectionSchedules.${index}.teacherSubjectId`, (e as any)?.value ?? "")
                                      }
                                    }}
                                  />
                                  <SelectForm
                                    formikProps={props}
                                    name={`SectionSchedules.${index}.scheduleId`}
                                    title={t('SectionSchedulePage.schedule')}
                                    placeholder={t('SectionSchedulePage.select-schedule')}
                                    options={
                                      Schedule && Schedule[props?.values?.SectionSchedules[index].day as Days]?.map((item) => {
                                        return {
                                          value: item.id,
                                          label: <div className='flex gap-1'>
                                            <div>
                                              {moment.utc(item.timeFrom).format("HH:mm A")}
                                            </div>
                                            <div>
                                              {" - "}
                                            </div>
                                            <div>
                                              {moment.utc(item.timeTo).format("HH:mm A")}
                                            </div>
                                          </div>
                                        }
                                      })
                                      || []

                                    }
                                    props={{
                                      isClearable: true,
                                      onChange: (e) => {
                                        props.setFieldValue(`SectionSchedules.${index}.scheduleId`, (e as any)?.value ?? "")
                                      }
                                    }}
                                  />


                                </div>

                                {
                                  props.values.SectionSchedules?.length - 1 != 0 && <div
                                    className="flex justify-end gap-2 mt-2">
                                    <button type="button"
                                      className=" hover:bg-danger/10 border-danger/70 text-danger/70  hover:scale-[1.01] transition-transform py-[2px] px-2  rounded border"
                                      onClick={() => remove(index)}>
                                      {t('common.delete')}
                                    </button>
                                  </div>
                                }
                              </div>
                            </AnimateHeight>
                          </div>
                        );
                      })}
                      {
                        // index == props.values.targets.length - 1 &&
                        <button type="button"
                          className=" w-fit mr-auto bg-secondary/10 hover:bg-secondary/20 border-secondary/70 text-secondary/70 hover:scale-[1.01] transition-transform py-1 px-2   rounded border"
                          onClick={() => push(SectionSchedules)}>
                          {t('common.add')}
                        </button>}
                    </div>

                  )}
                </FieldArray>
                  :
                  <div className="Card flex flex-col gap-1">
                    <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                      {t("SectionSchedulePage.SectionScheduleInformation")}
                    </div>

                    <SelectForm
                      formikProps={props}
                      name={`stageId`}
                      title={t("StageSubjectPage.StageName")}
                      placeholder={t("SectionSchedulePage.select-StageName")}
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
                          props.setFieldValue(`stageId`, (e as any)?.value ?? "")
                          props.setFieldValue(`classId`, undefined)

                        }
                      }}
                    />

                    {props.values.stageId && <SelectForm
                      formikProps={props}
                      name={`classId`}
                      title={t("SectionSchedulePage.ClassName")}
                      placeholder={t("SectionSchedulePage.select-ClassName")}
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
                          const value = (e as any)?.value ?? ""
                          props.setFieldValue(`classId`, value)
                          getTeacherSubject({
                            classId: value,
                            stageId: props.values.stageId,
                            schoolYearId: props.values.schoolYearId
                          })

                        }
                      }}
                    />}
                    <SelectForm
                      formikProps={props}
                      name={`teacherSubjectId`}
                      title={t('SectionSchedulePage.teacherSubject')}
                      placeholder={t('SectionSchedulePage.select-teacherSubject')}
                      options={TeacherSubject?.map((item, index) => {
                        return {
                          label: <div className='flex gap-1'>
                            <div>
                              {item.StageSubject.Subject.name}
                            </div>
                            <div>
                              {"( "}
                            </div>
                            <div>
                              {item.Teacher.fullName}
                            </div>
                            <div>
                              {' )'}
                            </div>
                          </div>,
                          value: item.id
                        }
                      }) || []
                      }
                      props={{
                        isClearable: true,
                        onChange: (e) => {
                          props.setFieldValue(`teacherSubjectId`, (e as any)?.value ?? "")
                        }
                      }}
                    />

                  </div>
                }

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

export default PageComponent

