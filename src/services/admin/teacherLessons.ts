import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";
import { IStudent } from "./student";

export interface ITeacherLessons {
  id: string;
  title: string;
  dueDate: string;
  content: string;
  isSeen: string;
  createdAt: string;
  updatedAt: string;
  teacherSubjectId: string;
  schoolYearId: string;
  schoolId: string;
  User: {
    id: string;
    username: string;
  };
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
    };
  };
  StudentLesson: {
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
    Lesson: {
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
    lessonId: string;
  }[];
  SchoolYear: {
    from: number;
    to: number;
  };
  LessonAttachment: {
    id: string;
    url: string;
    createdAt: string;
    updatedAt: string;
    lessonId: string;
  }[];
}

export interface AddTeacherLessonsPayload {
  teacherId?: string;
  title: string;
  content: string;
  teacherSubjectId: string;
  attachments?: string[];
  studentIds: string | string[];
}

export const TeacherLessons = api.injectEndpoints({
  endpoints: (build) => ({
    TeacherLessonsGetData: build.query<BaseGetDataResponse<ITeacherLessons>, GetDataRequestParams>({
      query: (params) => ({
        url: `admin/lessons`,
        params,
        method: "GET",
      }),
      providesTags: ["TeacherLessonsGetData"],
    }),

    TeacherLessonsGetDataById: build.query<ITeacherLessons, { id: string }>({
      query: ({ id }) => ({
        url: `super/teacher/lessons/${id}`,
        method: "GET",
      }),
      providesTags: ["TeacherLessonsGetDataById"],
      transformResponse: (response: ITeacherLessons) => {
        if (response.LessonAttachment.length > 0) {
          response.LessonAttachment = response.LessonAttachment.map((item) => {
            return {
              ...item,
              url: BASE_URL + "uploads/" + item.url,
            };
          });
        }
        return response;
      },
    }),

    TeacherLessonsCreate: build.mutation<ITeacherLessons, { teacherId: string; body: AddTeacherLessonsPayload | FormData }>({
      query: ({ teacherId, body }) => ({
        url: `super/teacher/lessons/${teacherId}`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["TeacherLessonsCreate", "TeacherLessonsGetDataById", "TeacherLessonsGetData"],
    }),

    TeacherLessonsUpdate: build.mutation<ITeacherLessons, { id: string; teacherId: string; body: AddTeacherLessonsPayload }>({
      query: ({ body, id, teacherId }) => ({
        url: `super/teacher/lessons/${id}/${teacherId}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: (res) => (res ? ["TeacherLessonsUpdate", "TeacherLessonsGetDataById", "TeacherLessonsGetData"] : []),
    }),

    TeacherLessonsIsSeenUpdate: build.mutation<ITeacherLessons, { id: string; status: "TRUE" | "FALSE" }>({
      query: ({ status, id }) => ({
        url: `admin/lessons/isSeen/${id}/${status}`,
        method: "PATCH",
      }),
      invalidatesTags: (res) => (res ? ["TeacherLessonsUpdate", "TeacherLessonsGetDataById", "TeacherLessonsGetData"] : []),
    }),

    TeacherLessonsRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `super/teacher/lessons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (res) => (res ? ["TeacherLessonsRemove", "TeacherLessonsGetDataById", "TeacherLessonsGetData"] : []),
    }),
    TeacherLessonsAttachmentsCreate: build.mutation<
      void,
      {
        lessonId: string;
        teacherId: string;
        body: { attachments: string[] } | FormData;
      }
    >({
      query: ({ lessonId, teacherId, body }) => ({
        url: `super/teacher/lessons/${lessonId}/attachments/${teacherId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (res) => (res ? ["TeacherLessonsAttachmentsCreate", "TeacherLessonsGetDataById", "TeacherLessonsGetData"] : []),
    }),
    TeacherLessonsAttachmentsRemove: build.mutation<
      void,
      {
        teacherId: string;
        body: { attachmentIds: string[] };
      }
    >({
      query: ({ teacherId, body }) => ({
        url: `super/teacher/lessons/{lessonId}/attachments/${teacherId}`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: (res) => (res ? ["TeacherLessonsAttachmentsRemove", "TeacherLessonsGetDataById", "TeacherLessonsGetData"] : []),
    }),
  }),
});
export const {
  useTeacherLessonsGetDataQuery,
  useLazyTeacherLessonsGetDataQuery,
  useTeacherLessonsGetDataByIdQuery,
  useLazyTeacherLessonsGetDataByIdQuery,
  useTeacherLessonsCreateMutation,
  useTeacherLessonsIsSeenUpdateMutation,
  useTeacherLessonsRemoveMutation,
  useTeacherLessonsUpdateMutation,
  useTeacherLessonsAttachmentsCreateMutation,
  useTeacherLessonsAttachmentsRemoveMutation,
} = TeacherLessons;
