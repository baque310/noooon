"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";

import { getTranslation } from "@/ni18n/i18n";

import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import * as Yup from "yup";
export interface FormValues {
  stageId: string;
  classId: string;
  sectionId: string;
  date: string;
  sectionScheduleId: string;
  attendanceRecords: {
    studentEnrollmentId: string;
    status: string;
    data: string;
    sectionScheduleId: string;
  }[];
}
import { ButtonForm } from "@/components/Form/ButtonForm";
import { Form, Formik, FormikProps } from "formik";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { SelectForm } from "@/components/Form/SelectForm";
import { useSectionScheduleGetDataQuery } from "@/services/admin/SectionSchedule";
import { useStudentListQuery } from "@/services/admin/studentEnrollment";
import { useSettingGetDataQuery } from "@/services/Setting";
import { DateTimeForm } from "@/components/Form/DateTimeForm";
import moment from "moment";
import { Days } from "@/services/types/BaseType";
import { useSuperTeacherAttendancesCreateMutation } from "@/services/admin/Super-Teacher-attendances";

const AttendanceButton = ({
  status,
  isSelected,
  onClick,
  icon,
}: {
  status: string;
  isSelected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) => {
  const { t } = getTranslation();
  const colorMap = {
    Present: isSelected
      ? "bg-green-500 text-white"
      : "bg-gray-50 hover:bg-green-50 text-gray-700 border border-gray-200 hover:border-green-300",
    Absent: isSelected
      ? "bg-red-500 text-white"
      : "bg-gray-50 hover:bg-red-50 text-gray-700 border border-gray-200 hover:border-red-300",
    Vacation: isSelected
      ? "bg-blue-500 text-white"
      : "bg-gray-50 hover:bg-blue-50 text-gray-700 border border-gray-200 hover:border-blue-300",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium 
        transition-all duration-200 min-h-[40px]
        ${colorMap[status as keyof typeof colorMap]}
        focus:outline-none focus:ring-2 focus:ring-primary/20
      `}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">
        {t(`SuperTeacherAttendancesPage.${status}` as any)}
      </span>
    </button>
  );
};

// Simplified student card component
const StudentCard = ({
  student,
  attendanceRecord,
  onStatusChange,
  index,
}: {
  student: any;
  attendanceRecord: any;
  onStatusChange: (status: string) => void;
  index: number;
}) => {
  const currentStatus = attendanceRecord?.status;
  const { t } = getTranslation();
  const statusColors = {
    Present: "bg-green-50 border-green-200",
    Absent: "bg-red-50 border-red-200",
    Vacation: "bg-blue-50 border-blue-200",
  };

  return (
    <div
      className={`
      p-4 rounded-lg border transition-all duration-200
      ${
        currentStatus
          ? statusColors[currentStatus as keyof typeof statusColors]
          : "bg-white border-gray-200"
      }
      hover:shadow-sm
    `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
            {student.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-sm">
              {student.fullName}
            </h3>
            <p className="text-xs text-gray-500">#{index + 1}</p>
          </div>
        </div>

        {currentStatus && (
          <span className="px-2 py-1 bg-white rounded-full text-xs font-medium border">
            {t(`SuperTeacherAttendancesPage.${currentStatus}` as any)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <AttendanceButton
          status="Present"
          isSelected={currentStatus === "Present"}
          onClick={() => onStatusChange("Present")}
          icon="✓"
        />
        <AttendanceButton
          status="Absent"
          isSelected={currentStatus === "Absent"}
          onClick={() => onStatusChange("Absent")}
          icon="✗"
        />
        <AttendanceButton
          status="Vacation"
          isSelected={currentStatus === "Vacation"}
          onClick={() => onStatusChange("Vacation")}
          icon="🏖️"
        />
      </div>
    </div>
  );
};

// Simplified Progress Indicator
const StatsCard = ({
  count,
  label,
  color,
}: {
  count: number;
  label: string;
  color: string;
}) => (
  <div className="text-center p-3 bg-white rounded-lg border">
    <div className={`text-xl font-bold ${color}`}>{count}</div>
    <div className="text-xs text-gray-600 mt-1">{label}</div>
  </div>
);

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [
    SuperTeacherAttendanceCreate,
    { isLoading: isLoadingSuperTeacherAttendanceCreate },
  ] = useSuperTeacherAttendancesCreateMutation();

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    try {
      await SuperTeacherAttendanceCreate({
        attendanceRecords: values.attendanceRecords.map((student) => ({
          date: values.date,
          Status: student.status as "Present" | "Absent" | "Vacation",
          studentEnrollmentId: student.studentEnrollmentId,
          sectionScheduleId: student.sectionScheduleId,
        })),
      }).unwrap();

      toast.success(t("common.added-successfully"), { autoClose: 30000 });
      resetForm();
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error && error.message==`A attendance with the same details already exists.`) {
          return toast.error(t("SuperTeacherAttendancesPage.duplicate-attendance"), { autoClose: 30000 });
        }
        if (error && error.message) {
          return toast.error(error.message, { autoClose: 30000 });
        }
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  // Fetching data
  const { currentData: settings, isFetching: isFetchingSettings } =
    useSettingGetDataQuery();
  const { currentData: stages, isFetching: isFetchingStages } =
    useStageGetDataQuery();

  // States
  const [stageId, setStageId] = useState<string>();
  const [classId, setClassId] = useState<string>();
  const [sectionId, setSectionId] = useState<string>();
  const [schoolYearId, setSchoolYearId] = useState<string>();

  const {
    currentData: SectionSchedule,
    isFetching: isFetchingSectionSchedule,
  } = useSectionScheduleGetDataQuery({
    ...({ sectionId: sectionId } as any),
  });
  const { currentData: students, isFetching: isFetchingStudents } =
    useStudentListQuery({ schoolYearId, stageId, classId, sectionId });

  const bannerSchema = Yup.object().shape({
    stageId: Yup.string().required(t("common.this-field-is-required")),
    classId: Yup.string().required(t("common.this-field-is-required")),
    sectionId: Yup.string().required(t("common.this-field-is-required")),

    attendanceRecords: Yup.array()
      .of(
        Yup.object().shape({
          studentEnrollmentId: Yup.string().required(
            t("common.this-field-is-required")
          ),
          status: Yup.string().required(t("common.this-field-is-required")),
          date: Yup.string().required(t("common.this-field-is-required")),
          sectionScheduleId: Yup.string().required(
            t("common.this-field-is-required")
          ),
        })
      )
      // must be length ==  students.length ?
      .min(
        !!students ? students.length : 1,
        t(
          "SuperTeacherAttendancesPage.register-Attendances-number-count-students-must-be-equal"
        ) + ` ${students?.length ?? 0}`
      )
      .required(t("common.this-field-is-required")),
  });
  useEffect(() => {
    if (settings?.CurrentSchoolYear?.id) {
      setSchoolYearId(settings.CurrentSchoolYear.id);
    }
  }, [settings]);

  // Utility functions for attendance management
  const updateStudentAttendance = useCallback(
    (props: FormikProps<FormValues>, studentId: string, status: string) => {
      const updatedRecords = [
        ...props.values.attendanceRecords.filter(
          (item) => item.studentEnrollmentId !== studentId
        ),
        {
          studentEnrollmentId: studentId,
          status,
          date: props.values.date,
          sectionScheduleId: props.values.sectionScheduleId,
        },
      ];
      props.setFieldValue("attendanceRecords", updatedRecords);
    },
    []
  );

  const setAllStudentsStatus = useCallback(
    (props: FormikProps<FormValues>, status: string) => {
      if (!students) return;

      const allRecords = students.map((student) => ({
        studentEnrollmentId: student.studentEnrollmentId,
        status,
        date: props.values.date,
        sectionScheduleId: props.values.sectionScheduleId,
      }));
      props.setFieldValue("attendanceRecords", allRecords);
    },
    [students]
  );

  // Statistics calculation
  const attendanceStats = useMemo(() => {
    if (!students) return { present: 0, absent: 0, vacation: 0, unmarked: 0 };

    const marked = new Map();
    // Get current attendance records and create a map for quick lookup
    const currentRecords = new Map();

    return students.reduce(
      (stats, student) => {
        // Find attendance record for this student
        const record = currentRecords.get(student.studentEnrollmentId);

        if (!record) {
          stats.unmarked++;
        } else {
          switch (record.status) {
            case "Present":
              stats.present++;
              break;
            case "Absent":
              stats.absent++;
              break;
            case "Vacation":
              stats.vacation++;
              break;
            default:
              stats.unmarked++;
          }
        }
        return stats;
      },
      { present: 0, absent: 0, vacation: 0, unmarked: 0 }
    );
  }, [students]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Simple Header */}
        <div className="mb-6">
          <BackButton title={t("SuperTeacherAttendancesPage.add")} />
        </div>

        {isFetchingSettings ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Formik<FormValues>
            initialValues={{
              attendanceRecords: [],
              stageId: "",
              classId: "",
              sectionId: "",
              date: "",
              sectionScheduleId: "",
            }}
            validationSchema={bannerSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<FormValues>) => (
              <Form className="space-y-6">
                {/* Simple Information Card */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center">
                      <span>📋</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {t("SuperTeacherAttendancesPage.Information")}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {t(
                          "SuperTeacherAttendancesPage.Select class details to mark attendance"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectForm
                      formikProps={props}
                      name="stageId"
                      title={t("StageSubjectPage.StageName")}
                      placeholder={t(
                        "SuperTeacherAttendancesPage.select-StageName"
                      )}
                      options={
                        stages?.map((item) => ({
                          label: t(item.name as any),
                          value: item.id,
                        })) ?? []
                      }
                      props={{
                        isLoading: isFetchingStages,
                        isClearable: true,
                        onChange: (e) => {
                          props.setFieldValue(
                            "stageId",
                            (e as any)?.value ?? ""
                          );
                          props.setFieldValue("classId", undefined);
                          setStageId((e as any)?.value ?? "");
                          setClassId(undefined);
                          setSectionId(undefined);
                        },
                      }}
                    />

                    {props.values?.stageId && (
                      <SelectForm
                        formikProps={props}
                        name="classId"
                        title={t("SuperTeacherAttendancesPage.className")}
                        placeholder={t(
                          "SuperTeacherAttendancesPage.select-ClassName"
                        )}
                        options={
                          stages
                            ? stages
                                .find(
                                  (item) => item.id === props.values?.stageId
                                )
                                ?.Class?.map((item) => ({
                                  label: t(item.name as any),
                                  value: item.id,
                                })) || []
                            : []
                        }
                        props={{
                          isLoading: isFetchingStages,
                          isClearable: true,
                          onChange: (e) => {
                            const value = (e as any)?.value ?? "";
                            props.setFieldValue("classId", value);
                            props.setFieldValue("sectionId", undefined);
                            setClassId(value);
                            setSectionId(undefined);
                          },
                        }}
                      />
                    )}

                    {props?.values?.classId && (
                      <SelectForm
                        formikProps={props}
                        name="sectionId"
                        title={t("SuperTeacherAttendancesPage.sectionName")}
                        placeholder={t(
                          "SuperTeacherAttendancesPage.select-SectionName"
                        )}
                        options={
                          stages
                            ? stages
                                .find(
                                  (item) => item.id === props?.values?.stageId
                                )
                                ?.Class?.find(
                                  (item) => item.id === props?.values?.classId
                                )
                                ?.Section?.map((item) => ({
                                  label: t(item.name as any),
                                  value: item.id,
                                })) || []
                            : []
                        }
                        props={{
                          isLoading: isFetchingStages,
                          isClearable: true,
                          onChange: (e) => {
                            props.setFieldValue(
                              "sectionId",
                              (e as any)?.value ?? ""
                            );
                            setSectionId((e as any)?.value ?? "");
                          },
                        }}
                      />
                    )}

                    <DateTimeForm
                      formikProps={props}
                      name="date"
                      title={t("SuperTeacherAttendancesPage.date")}
                      placeholder={t("SuperTeacherAttendancesPage.select-date")}
                    />

                    {props.values.date && (
                      <div className="md:col-span-2">
                        <SelectForm
                          formikProps={props}
                          name="sectionScheduleId"
                          title={t(
                            "SuperTeacherAttendancesPage.sectionSchedule"
                          )}
                          placeholder={t(
                            "SuperTeacherAttendancesPage.select-sectionSchedule"
                          )}
                          options={(() => {
                            const weekday = moment(props.values.date)
                              .format("dddd")
                              .toUpperCase() as keyof typeof Days;
                            return (
                              SectionSchedule?.data[weekday]?.map((item) => ({
                                label: (
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">
                                      {t(item.Schedule.day as any)} -{" "}
                                      {
                                        item.teacherSubject.StageSubject.Subject
                                          .name
                                      }{" "}
                                      -
                                      {moment
                                        .utc(item.Schedule.timeFrom)
                                        .format("hh:mm:ss A") + " "}
                                      -
                                      {moment
                                        .utc(item.Schedule.timeTo)
                                        .format("hh:mm:ss A")}
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                      ({item.teacherSubject.Teacher.fullName})
                                    </span>
                                  </div>
                                ),
                                value: item.id,
                              })) || []
                            );
                          })()}
                          props={{
                            isClearable: true,
                            isLoading: isFetchingSectionSchedule,
                            onChange: (e) => {
                              props.setFieldValue(
                                "sectionScheduleId",
                                (e as any)?.value ?? ""
                              );
                              props.setFieldValue("attendanceRecords", []);
                            },
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Simple Students Card */}
                {props.values.sectionScheduleId && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    {/* Header with Stats */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center">
                          <span>👥</span>
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            {t("SuperTeacherAttendancesPage.Students")}(
                            {students?.length || 0})
                          </h2>
                          <p className="text-sm text-gray-600">
                            {t(
                              "SuperTeacherAttendancesPage.Mark attendance for all students"
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Simple Stats */}
                      <div className="flex gap-3">
                        <StatsCard
                          count={
                            props.values.attendanceRecords.filter(
                              (r) => r.status === "Present"
                            ).length
                          }
                          label="Present"
                          color="text-green-600"
                        />
                        <StatsCard
                          count={
                            props.values.attendanceRecords.filter(
                              (r) => r.status === "Absent"
                            ).length
                          }
                          label="Absent"
                          color="text-red-600"
                        />
                        <StatsCard
                          count={
                            props.values.attendanceRecords.filter(
                              (r) => r.status === "Vacation"
                            ).length
                          }
                          label="Vacation"
                          color="text-blue-600"
                        />
                      </div>
                    </div>

                    {/* Simple Quick Actions */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        {t("SuperTeacherAttendancesPage.Quick Actions")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setAllStudentsStatus(props, "Present")}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                          ✓{t("SuperTeacherAttendancesPage.All Present")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAllStudentsStatus(props, "Absent")}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          ✗ {t("SuperTeacherAttendancesPage.All Absent")}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setAllStudentsStatus(props, "Vacation")
                          }
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                        >
                          🏖️ {t("SuperTeacherAttendancesPage.All Vacation")}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            props.setFieldValue("attendanceRecords", [])
                          }
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                        >
                          {t("SuperTeacherAttendancesPage.Clear All")}
                        </button>
                      </div>
                    </div>

                    {/* Simple Students Grid */}
                    {isFetchingStudents ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="ml-2 text-gray-600">
                          {t("SuperTeacherAttendancesPage.Loading students")}
                        </span>
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        {students && students.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {students.map((student, index) => {
                              const attendanceRecord =
                                props.values.attendanceRecords.find(
                                  (item) =>
                                    item.studentEnrollmentId ===
                                    student.studentEnrollmentId
                                );

                              return (
                                <StudentCard
                                  key={student.id}
                                  student={student}
                                  attendanceRecord={attendanceRecord}
                                  index={index}
                                  onStatusChange={(status) =>
                                    updateStudentAttendance(
                                      props,
                                      student.studentEnrollmentId,
                                      status
                                    )
                                  }
                                />
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl">👥</span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {t(
                                "SuperTeacherAttendancesPage.No Students Found"
                              )}
                            </h3>
                            <p className="text-gray-600">
                              {t(
                                "SuperTeacherAttendancesPage.Please select a section to view students"
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Simple Error Display */}
                {props.errors.attendanceRecords && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">⚠️</span>
                      <span className="font-medium text-red-800">
                        {t("SuperTeacherAttendancesPage.Validation Error")}
                      </span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      {typeof props.errors.attendanceRecords === "string"
                        ? props.errors.attendanceRecords
                        : t(
                            "SuperTeacherAttendancesPage.Please mark attendance for all students"
                          )}
                    </p>
                  </div>
                )}

                {/* Simple Submit Button */}
                <div className="flex justify-end">
                  <ButtonForm
                    props={{ type: "submit" }}
                    title={t("common.save")}
                    isLoading={isLoadingSuperTeacherAttendanceCreate}
                  />
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default PageComponent;
