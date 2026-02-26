import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";
import { IStudent } from "./student";

export interface ITeacherHomeworks {
  id: string;
  title: string;
  dueDate: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  teacherSubjectId: string;
  schoolYearId: string;
  schoolId: string;
  isSeen: string;
  teacherSubject: {
    Teacher: {
      id: string;
      fullName: string;
    };
    StageSubject: {
      Stage: {
        name: string;
      };
      Subject: {
        name: string;
      };
      Class: {
        name: string;
      };
    };
  };
  StudentHomework: {
    Student: {
      StudentEnrollment: {
        Section: {
          id: string;
          name: string;
        };
        id: string;
      }[];
    } & IStudent;
    id: string;
    studentId: string;
    HomeworkStatus: string;
    completedAt: null;
    Homework: {
      id: string;
      title: string;
      dueDate: string;
      content: string;
      createdAt: string;
      updatedAt: string;
      teacherSubjectId: string;
      schoolYearId: string;
      schoolId: string;
    };
    homeworkId: string;
  }[];
  SchoolYear: {
    from: number;
    to: number;
  };
  HomeworkAttachment: {
    id: string;
    url: string;
    createdAt: string;
    updatedAt: string;
    homeworkId: string;
  }[];
}

export interface AddTeacherHomeworksPayload {
  teacherId?: string;
  title: string;
  content: string;
  dueDate: string;
  teacherSubjectId: string;
  attachments?: string[];
  studentIds: string | string[];
}

export const TeacherHomeworks = api.injectEndpoints({
  endpoints: (build) => ({
    TeacherHomeworksGetData: build.query<BaseGetDataResponse<ITeacherHomeworks>, GetDataRequestParams>({
      query: (params) => ({
        url: `admin/homeworks`,
        params,
        method: "GET",
      }),
      providesTags: ["TeacherHomeworksGetData"],
    }),

    TeacherHomeworksGetDataById: build.query<ITeacherHomeworks, { id: string }>({
      query: ({ id }) => ({
        url: `supper/teacher/homeworks/${id}`,
        method: "GET",
      }),
      providesTags: ["TeacherHomeworksGetDataById"],
      transformResponse: (response: ITeacherHomeworks) => {
        if (response.HomeworkAttachment.length > 0) {
          response.HomeworkAttachment = response.HomeworkAttachment.map((item) => {
            return {
              ...item,
              url: BASE_URL + "uploads/" + item.url,
            };
          });
        }
        return response;
      },
    }),

    TeacherHomeworksCreate: build.mutation<ITeacherHomeworks, { teacherId: string; body: AddTeacherHomeworksPayload | FormData }>({
      query: ({ teacherId, body }) => ({
        url: `supper/teacher/homeworks/${teacherId}`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["TeacherHomeworksCreate", "TeacherHomeworksGetDataById", "TeacherHomeworksGetData"],
    }),

    TeacherHomeworksUpdate: build.mutation<ITeacherHomeworks, { id: string; teacherId: string; body: AddTeacherHomeworksPayload }>({
      query: ({ body, id, teacherId }) => ({
        url: `supper/teacher/homeworks/${id}/${teacherId}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: (res) => (res ? ["TeacherHomeworksUpdate", "TeacherHomeworksGetDataById", "TeacherHomeworksGetData"] : []),
    }),

    TeacherHomeworksIsSeenUpdate: build.mutation<ITeacherHomeworks, { id: string; status: "TRUE" | "FALSE" }>({
      query: ({ status, id }) => ({
        url: `admin/homeworks/isSeen/${id}/${status}`,
        method: "PATCH",
      }),
      invalidatesTags: (res) => (res ? ["TeacherHomeworksUpdate", "TeacherHomeworksGetDataById", "TeacherHomeworksGetData"] : []),
    }),

    TeacherHomeworksRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `supper/teacher/homeworks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (res) => (res ? ["TeacherHomeworksRemove", "TeacherHomeworksGetDataById", "TeacherHomeworksGetData"] : []),
    }),
    TeacherHomeworksAttachmentsCreate: build.mutation<
      void,
      {
        homeworkId: string;
        teacherId: string;
        body: { attachments: string[] } | FormData;
      }
    >({
      query: ({ homeworkId, teacherId, body }) => ({
        url: `supper/teacher/homeworks/${homeworkId}/attachments/${teacherId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (res) => (res ? ["TeacherHomeworksAttachmentsCreate", "TeacherHomeworksGetDataById", "TeacherHomeworksGetData"] : []),
    }),
    TeacherHomeworksAttachmentsRemove: build.mutation<
      void,
      {
        teacherId: string;
        body: { attachmentIds: string[] };
      }
    >({
      query: ({ teacherId, body }) => ({
        url: `supper/teacher/homeworks/{homeworkId}/attachments/${teacherId}`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: (res) => (res ? ["TeacherHomeworksAttachmentsRemove", "TeacherHomeworksGetDataById", "TeacherHomeworksGetData"] : []),
    }),
  }),
});
export const {
  useTeacherHomeworksGetDataQuery,
  useLazyTeacherHomeworksGetDataQuery,
  useTeacherHomeworksGetDataByIdQuery,
  useLazyTeacherHomeworksGetDataByIdQuery,
  useTeacherHomeworksCreateMutation,
  useTeacherHomeworksRemoveMutation,
  useTeacherHomeworksUpdateMutation,
  useTeacherHomeworksIsSeenUpdateMutation,
  useTeacherHomeworksAttachmentsCreateMutation,
  useTeacherHomeworksAttachmentsRemoveMutation,
} = TeacherHomeworks;
