import { BaseQueryFn, createApi } from "@reduxjs/toolkit/query/react";

export const BASE_URL = process.env.BASE_URL;
import UniversalCookie from "universal-cookie";
import type { AxiosRequestConfig } from "axios";

import customBaseFetch, { Authentication } from "@/app/customBaseFetch";
import { signOut } from "next-auth/react";

const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: "" }
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
      body?: any;
    },
    unknown,
    unknown
  > =>
  async (args) => {
    const { url, method, params, headers, body } = args;

    const result = await customBaseFetch({
      url: baseUrl + url,
      method,
      data: body,
      params,
      headers,
    });

    if (result && result.error && result.error.status == 401) {
      signOut();
    }

    if (
      result.data &&
      result.data.token &&
      (result.data.token as Authentication[]).length > 0
    ) {
      const cookies = new UniversalCookie();
      // cookies.
      result.data.token.forEach((token: any) => {
        cookies.set(token.name, token.value, {
          path: "/",
          // httpOnly: rest.includes(' HttpOnly')
          // secure: true,
          // httpOnly: true,
          // expires: new Date(jwtDecode(value.trim()).exp! * 1000),
        });
      });
      const results = await customBaseFetch({
        url: baseUrl + url,
        method,
        data: body,
        params,
        headers,
      });
      if (results && results.error && results.error.status == 401) {
        signOut();
      }

      return results;
    }

    return result;
  };

export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({
    baseUrl: BASE_URL as string,
  }),
  tagTypes: [
    // Admin Tag

    "AdminGetData",
    "AdminGetDataById",
    "AdminUpdate",
    "AdminRemove",

    // SupperAdmin Tag

    "SupperAdminGetData",
    "SupperAdminGetDataById",
    "SupperAdminUpdate",
    "SupperAdminRemove",
    "SupperAdminCreate",

    //  School  Tag
    "SchoolGetDataById",
    "SchoolGetData",
    "SchoolCreate",
    "SchoolUpdate",

    // Stage Tag
    "StageGetData",
    "StageGetDataById",
    "StageCreate",
    "StageRemove",

    // Class Tag
    "ClassGetData",
    "ClassGetDataById",
    "ClassCreate",
    "ClassRemove",
    "ClassUpdate",

    // Section Tag
    "SectionGetData",
    "SectionGetDataById",
    "SectionCreate",
    "SectionRemove",
    "SectionUpdate",

    // Student Tag
    "StudentGetData",
    "StudentGetDataById",
    "StudentCreate",
    "StudentUpdate",
    "StudentRemove",
    "StudentCreateMulti",

    // Student Enrollment Tag
    "StudentEnrollmentGetData",
    "StudentEnrollmentGetDataById",
    "StudentEnrollmentCreate",
    "StudentEnrollmentUpdate",
    "StudentEnrollmentRemove",

    // School Year Tag
    "SchoolYearGetData",

    // teacher Tag
    "TeacherGetData",
    "TeacherGetDataById",
    "TeacherCreate",
    "TeacherRemove",
    "TeacherUpdate",

    // bus Tag
    "BusGetData",
    "BusGetDataById",
    "BusCreate",
    "BusUpdate",
    "BusRemove",
    "BusConnectStudentBus",
    "BusDisconnectStudentBus",

    // Admin-Banner Tag

    "BannerGetData",
    "BannerGetDataById",
    "BannerCreate",
    "BannerUpdate",
    "BannerRemove",

    //ManagerBanner
    "ManagerBannerGetData",
    "ManagerBannerGetDataById",
    "ManagerBannerCreate",
    "ManagerBannerUpdate",
    "ManagerBannerRemove",

    // Guidance Tag
    "GuidanceGetData",
    "GuidanceGetDataById",
    "GuidanceCreate",
    "GuidanceUpdate",
    "GuidanceRemove",

    // Gallery Tag
    "GalleryGetData",
    "GalleryGetDataById",
    "GalleryCreate",
    "GalleryUpdate",
    "GalleryRemove",

    // Subject Tag
    "SubjectGetData",
    "SubjectGetDataById",
    "SubjectCreate",
    "SubjectUpdate",
    "SubjectRemove",

    //Stage Subject Tag
    "StageSubjectGetData",
    "StageSubjectGetDataById",
    "StageSubjectCreate",
    "StageSubjectUpdate",
    "StageSubjectRemove",

    //Teacher Subject Tag
    "TeacherSubjectGetData",
    "TeacherSubjectGetDataById",
    "TeacherSubjectCreate",
    "TeacherSubjectUpdate",
    "TeacherSubjectRemove",

    // Schedule Tag
    "ScheduleGetData",
    "ScheduleGetDataById",
    "ScheduleCreate",
    "ScheduleUpdate",
    "ScheduleRemove",

    //Section Schedule Tag
    "SectionScheduleGetData",
    "SectionScheduleGetDataById",
    "SectionScheduleCreate",
    "SectionScheduleUpdate",
    "SectionScheduleRemove",

    // setting tags
    "SettingGetData",
    "SettingUpdate",

    // SchoolGetDataAdmin
    "SchoolGetDataAdmin",
    "SchoolUpdateAdmin",

    //Exams
    "ExamsGetData",
    "ExamsGetDataById",
    "ExamsCreate",
    "ExamsUpdate",
    "ExamsCreateSections",
    "ExamsRemove",
    //ExamType
    "ExamTypeGetData",
    "ExamTypeGetDataById",
    "ExamTypeCreate",
    "ExamTypeUpdate",
    "ExamTypeCreateSections",
    "ExamTypeRemove",
    "ExamSectionsRemove",

    //Homeworks
    "HomeworksGetData",
    "HomeworksGetDataById",
    "HomeworksCreate",
    "HomeworksUpdate",
    "HomeworksRemove",

    // student-installment
    "StudentInstallmentGetData",
    "StudentInstallmentGetDataById",
    "StudentInstallmentCreate",
    "StudentInstallmentUpdate",
    "StudentInstallmentRemove",
    "StudentEnrollmentUpdatePrice",

    // Notification
    "NotificationGetDataForAdmin",
    "NotificationChangeStatusForAdmin",
    "NotificationSendToAllForAdmin",
    "NotificationSendToAllForManager",
    "NotificationSendForManyAllForAdmin",
    "NotificationSendForManyAllForManager",

    // Parent
    "ParentGetData",
    "ParentGetDataById",
    "ParentCreate",
    "ParentUpdate",
    "ParentRemove",

    // Complaint
    "ComplaintGetDataForManager",
    "ComplaintGetDataById", 
    "ComplaintChangeStatus",
    "ComplaintGetDataForAdmin",
  ],
  endpoints: (build) => ({}),
});
