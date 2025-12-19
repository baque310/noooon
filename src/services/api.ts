import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
    const { url, method = "GET", params, headers, body } = args;

    // Log request details
    console.groupCollapsed(`%c[API REQUEST] ${method} ${baseUrl + url}`, "color:#1976d2;font-weight:bold;");
    console.log("📤 Request URL:", baseUrl + url);
    console.log("🔹 Method:", method);
    if (params) console.log("🔸 Params:", params);
    if (body) console.log("🧾 Body:", body);
    if (headers) console.log("📋 Headers:", headers);
    console.groupEnd();

    const result = await customBaseFetch({
      url: baseUrl + url,
      method,
      data: body,
      params,
      headers,
    });

    // Log response details
    console.groupCollapsed(`%c[API RESPONSE] ${method} ${baseUrl + url}`, "color:#2e7d32;font-weight:bold;");
    console.log("📦 Response:", result);
    console.groupEnd();

    if (result && result.error && result.error.status == 401) {
      console.warn("⚠️ Unauthorized (401) — triggering signOut()");
      signOut();
    }

    if (result.data && result.data.token && (result.data.token as Authentication[]).length > 0) {
      const cookies = new UniversalCookie();
      result.data.token.forEach((token: any) => {
        cookies.set(token.name, token.value, { path: "/" });
      });

      // Optional re-fetch after setting tokens
      const results = await customBaseFetch({
        url: baseUrl + url,
        method,
        data: body,
        params,
        headers,
      });

      console.groupCollapsed(`%c[API RE-FETCH RESPONSE] ${method} ${baseUrl + url}`, "color:#6a1b9a;font-weight:bold;");
      console.log("📦 Re-fetch response:", results);
      console.groupEnd();

      if (results && results.error && results.error.status == 401) {
        console.warn("⚠️ Unauthorized after re-fetch — triggering signOut()");
        signOut();
      }

      return results;
    }

    return result;
  };

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL, // Backend base API
  prepareHeaders: async (headers: any) => {
    // By default, if we have a token in the storage, add it to request Headers
    // const session = await getSession();
    let token: string | undefined;

    // token = session?.accessToken;
    // if (token) {
    //   headers.set("Authorization", `Bearer ${token}`);
    //   headers.set("x-api-key", X_API_KEY);
    // }
    return headers;
  },
});
const baseQueryWithReAuth = async (args: string | FetchArgs, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  if ((result?.error as any)?.originalStatus === 200 && ((args as any)?.method == "DELETE" || (args as any)?.method == "PATCH")) {
    return {
      meta: result.meta,
      data: [],
      error: undefined,
    };
  } else {
    return result;
  }
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({
    baseUrl: BASE_URL as string,
  }),
  // baseQuery: baseQueryWithReAuth as any,
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

    // SubSubject Tag
    "SubSubjectGetData",
    "SubSubjectGetDataById",
    "SubSubjectCreate",
    "SubSubjectRemove",
    "SubSubjectUpdate",

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
    "StudentMultiStudentsForExcel",
    "StudentConnectParent",
    "StudentDisconnectParent",
    "StudentGetDataHasNoEnrollment",

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
    "GalleryCreateImage",
    "GalleryRemoveImage",

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

    // ExamResults tags
    "ExamResultsGetData",
    "ExamResultsUpdate",
    "ExamResultsCreate",
    "ExamResultsGetDataById",

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
    "ParentMultipleForExcel",

    // Complaint
    "ComplaintGetDataForManager",
    "ComplaintGetDataById",
    "ComplaintChangeStatus",
    "ComplaintGetDataForAdmin",
    "ComplaintRemove",

    // Video
    "VideoGetData",
    "VideoGetDataById",
    "VideoCreate",
    "VideoUpdate",
    "VideoRemove",

    // TeacherHomeworks
    "TeacherHomeworksCreate",
    "TeacherHomeworksGetData",
    "TeacherHomeworksUpdate",
    "TeacherHomeworksGetDataById",
    "TeacherHomeworksRemove",
    "TeacherHomeworksAttachmentsCreate",
    "TeacherHomeworksAttachmentsRemove",

    // TeacherLessons
    "TeacherLessonsCreate",
    "TeacherLessonsGetData",
    "TeacherLessonsUpdate",
    "TeacherLessonsGetDataById",
    "TeacherLessonsRemove",
    "TeacherLessonsAttachmentsCreate",
    "TeacherLessonsAttachmentsRemove",

    // SuperTeacherAttendances
    "SuperTeacherAttendancesGetData",
    "SuperTeacherAttendancesGetDataById",
    "SuperTeacherAttendancesCreate",
    "SuperTeacherAttendancesUpdate",
    "SuperTeacherAttendancesRemove",

    // Chat
    "ChatGetData",
    "ChatDirect",
    "ChatMessage",
    "ChatCreateSchoolStaffGroup",
    "ChatCreateSubjectTeachersGroup",
    "ChatCreateClassParentsGroup",
    "ChatCreateClassStudentsGroup",
    "ChatToggleGroupChat",
    "ChatMessageRemoved",
    "ChatCreateCustomTeachersGroup",
    "ChatRemove",
    //Admin Discount
    "AdminDiscountGetData",
    "AdminDiscountGetDataById",
    "AdminDiscountCreate",
    "AdminDiscountUpdate",
    "AdminDiscountRemove",

    //Admin OtherPayment
    "OtherPaymentGetData",
    "OtherPaymentGetDataById",
    "OtherPaymentCreate",
    "OtherPaymentUpdate",
    "OtherPaymentRemove",

    // Installment
    "InstallmentGetData",
    "InstallmentGetDataById",
    "InstallmentCreate",
    "InstallmentUpdate",
    "InstallmentRemove",
    // Installment Payment
    "InstallmentPaymentGetDataByStudentEnrollmentId",
    "InstallmentPaymentCreate",
    "InstallmentPaymentUpdate",
    "InstallmentPaymentUpdateStatus",
  ],
  endpoints: (build) => ({}),
});
