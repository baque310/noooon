import { api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface IExamResults {
  id: string;
  score: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  examSectionId: string;
  Student: {
    id: string;
    fullName: string;
    photo: string;
  };
  ExamSection: {
    id: string;
    examDate: string;
    Exam: {
      id: string;
      ExamType: {
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        schoolId: string;
      };
      StageSubject: {
        Stage: {
          id: string;
          name: string;
        };
        Subject: {
          id: string;
          name: string;
        };
      };
    };
    Section: {
      id: string;
      name: string;
    };
  };
}

export interface GetExamResultsDataRequestParams extends GetDataRequestParams {
  examSectionId?: string;
  stageSubjectId?: string;
  sectionId?: string;
  classId?: string;
  schoolYearId?: string;
}

export const ExamResults = api.injectEndpoints({
  endpoints: (build) => ({
    ExamResultsGetData: build.query<BaseGetDataResponse<IExamResults[]>, GetExamResultsDataRequestParams>({
      query: (params) => ({
        url: `admin/examResults`,
        params,
        method: "GET",
      }),
      providesTags: ["ExamResultsGetData"],
    }),

    ExamResultsGetDataById: build.query<IExamResults, { id: string }>({
      query: ({ id }) => ({
        url: `admin/examResults/${id}`,
        method: "GET",
      }),
      // providesTags: ["ExamResultsGetDataById"],
    }),
    // ExamResultsUpdate: build.mutation<IExamResults, { id: string; body: { score: number; notes: string } }>({
    //   query: ({ id, body }) => ({
    //     url: `super/teacher/examResults/${id}`,
    //     body,
    //     method: "PATCH",
    //   }),
    //   providesTags: ["ExamResultsUpdate", "ExamResultsGetData"],
    // }),

    ExamResultsUpdate: build.mutation<IExamResults, { id: string; body: { score: number; notes: string } }>({
      query: ({ body, id }) => ({
        url: `super/teacher/examResults/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["ExamResultsUpdate", "ExamResultsGetData"],
    }),
  }),
});
export const { useExamResultsGetDataQuery, useLazyExamResultsGetDataQuery, useExamResultsUpdateMutation, useExamResultsGetDataByIdQuery, useLazyExamResultsGetDataByIdQuery } =
  ExamResults;
