import { api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface ExamPeriod {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  schoolId: string;
}

export interface PaginatedExamPeriodData {
  data: ExamPeriod[];
  totalCount: number;
  pageCount: number;
}

export interface ExamPeriodResponse {
  data: PaginatedExamPeriodData;
}

export interface IExamType {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  schoolId?: string;
  School?: {
    id: string;
    name: string;
  };
  subjectId?: string;
  Subject?: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    schoolId: string;
  };
}

export interface AddExamTypePayload {
  name: string;
}

export const ExamType = api.injectEndpoints({
  endpoints: (build) => ({
    ExamTypeGetData: build.query<PaginatedExamPeriodData, GetDataRequestParams>({
      query: (params) => ({
        url: `admin/examType`,
        params,
        method: "GET",
      }),
      // transformResponse: (response: BaseGetDataResponse<IExamType>) => response.data,
      providesTags: ["ExamTypeGetData"],
    }),

    ExamTypeGetDataById: build.query<IExamType, { id: string }>({
      query: ({ id }) => ({
        url: `admin/examType/${id}`,
        method: "GET",
      }),
      providesTags: ["ExamTypeGetDataById"],
    }),

    ExamTypeCreate: build.mutation<IExamType, AddExamTypePayload>({
      query: (body) => ({
        url: `admin/examType`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["ExamTypeCreate", "ExamTypeGetDataById", "ExamTypeGetData"],
    }),

    ExamTypeUpdate: build.mutation<IExamType, { id: string; body: AddExamTypePayload }>({
      query: ({ body, id }) => ({
        url: `admin/examType/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["ExamTypeUpdate", "ExamTypeGetDataById", "ExamTypeGetData"],
    }),

    ExamTypeRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `admin/examType/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ExamTypeRemove", "ExamTypeGetDataById", "ExamTypeGetData"],
    }),
  }),
});
export const {
  useExamTypeGetDataQuery,
  useLazyExamTypeGetDataQuery,
  useExamTypeGetDataByIdQuery,
  useLazyExamTypeGetDataByIdQuery,
  useExamTypeCreateMutation,
  useExamTypeRemoveMutation,
  useExamTypeUpdateMutation,
} = ExamType;
