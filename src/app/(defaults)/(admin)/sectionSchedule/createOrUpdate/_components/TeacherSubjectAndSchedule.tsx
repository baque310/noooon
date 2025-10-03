import { SelectForm } from "@/components/Form/SelectForm";
import { getTranslation } from "@/ni18n/i18n";
import { useLazyScheduleGetDataQuery } from "@/services/admin/Schedule";
import { ITeacherSubject } from "@/services/admin/TeacherSubject";
import { Days } from "@/services/types/BaseType";
import { FieldArray, FormikProps } from "formik";
import moment from "moment";
import React, { FC, useState } from "react";

export interface TeacherSubjectAndScheduleProps {
  props: FormikProps<any>;
  index: number;
  TeacherSubject: ITeacherSubject[] | undefined;
  isFetchingTeacherSubject: boolean;
}

const TeacherSubjectAndSchedule: FC<TeacherSubjectAndScheduleProps> = ({ props, index, TeacherSubject, isFetchingTeacherSubject }) => {
  const { t } = getTranslation();
  const [getSchedule, { currentData: Schedule, isFetching: isFetchingSchedule }] = useLazyScheduleGetDataQuery();
  const [searchSchedule, setSearchSchedule] = useState<string | undefined>();
  return (
    <>
      <FieldArray name={`days.${index}.SectionSchedules`}>
        {({ insert, remove, push, replace }) => (
          <div className={"flex flex-col gap-4 "}>
            {props.values.days[index].SectionSchedules?.map((_: any, idx: number) => {
              return (
                <div className={" Card"} key={idx}>
                  <div className="flex justify-end w-full relative mb-2">
                    <button
                      className="absolute top-0 hover:bg-danger/10 border-danger/70 text-danger/70  hover:scale-[1.01] transition-transform py-[2px] px-2  rounded  font-bold"
                      type="button"
                      onClick={() => {
                        remove(idx);
                      }}>
                      x
                    </button>
                  </div>

                  <SelectForm
                    formikProps={props}
                    name={`days.${index}.SectionSchedules.${idx}.teacherSubjectId`}
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
                      isLoading: isFetchingTeacherSubject,
                      onChange: (e) => {
                        props.setFieldValue(`days.${index}.SectionSchedules.${idx}.teacherSubjectId`, (e as any)?.value ?? "");
                        getSchedule({
                          day: props.values.days[index].value,
                          search: searchSchedule,
                        });
                      },
                      onInputChange: (value) => {
                        setSearchSchedule(value);
                      },
                    }}
                  />
                  <SelectForm
                    formikProps={props}
                    name={`days.${index}.SectionSchedules.${idx}.scheduleId`}
                    title={t("SectionSchedulePage.schedule")}
                    placeholder={t("SectionSchedulePage.select-schedule")}
                    options={
                      (Schedule &&
                        Schedule[props?.values?.days[index].value as Days]?.map((item) => {
                          return {
                            value: item.id,
                            label: (
                              <div className="flex gap-1">
                                <div>{moment.utc(item.timeFrom).format("HH:mm A")}</div>
                                <div>{" - "}</div>
                                <div>{moment.utc(item.timeTo).format("HH:mm A")}</div>
                              </div>
                            ),
                          };
                        })) ||
                      []
                    }
                    props={{
                      isClearable: true,
                      isLoading: isFetchingSchedule,
                      onChange: (e) => {
                        props.setFieldValue(`days.${index}.SectionSchedules.${idx}.scheduleId`, (e as any)?.value ?? "");
                      },
                    }}
                  />
                </div>
              );
            })}

            <button
              type="button"
              className=" w-fit mr-auto bg-secondary/10 hover:bg-secondary/20 border-secondary/70 text-secondary/70 hover:scale-[1.01] transition-transform py-1 px-2   rounded border"
              onClick={() => {
                push({
                  scheduleId: "",
                  teacherSubjectId: "",
                });
              }}>
              {t("common.add")}
            </button>
          </div>
        )}
      </FieldArray>
    </>
  );
};

export default TeacherSubjectAndSchedule;
