import { api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";
// import { IExamType } from "./ExamType";
// import { IStageSubject } from "./StageSubject";
// import { ISchoolYear } from "../SchoolYear";
// import { ISection } from "./section";

export interface IExams {
  id: string;
  content: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  stageSubjectId: string;
  examTypeId: string;
  schoolYearId: string;
  subSubjectId: string | null;
  subSubject: {
    id: string;
    name: string;
  } | null;
  ExamType: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    schoolId: string;
  };
  ExamSection: {
    id: string;
    examDate: string;
    Section: {
      id: string;
      name: string;
    };
  }[];
  StageSubject: {
    Stage: {
      id: string;
      name: string;
    };
    Subject: {
      id: string;
      name: string;
    };
    Class: {
      id: string;
      name: string;
    };
  };
  SchoolYear: {
    from: number;
    to: number;
  };
}

export interface AddExamsPayload {
  content: string;
  stageSubjectId: string;
  examTypeId: string;
  score: number;
  ExamSection: {
    examDate: string;
    sectionId: string;
  }[];
}
export interface UpdateExamsPayload {
  content: string;
  score: number;
}

export interface AddExamsCreateSection {
  examDate: string;
  sectionId: string;
  score?: number;
}

export const Exams = api.injectEndpoints({
  endpoints: (build) => ({
    ExamsGetData: build.query<BaseGetDataResponse<IExams[]>, GetDataRequestParams>({
      query: (params) => ({
        url: `admin/exams`,
        params,
        method: "GET",
      }),
      providesTags: ["ExamsGetData"],
    }),

    ExamsGetDataById: build.query<IExams, { id: string }>({
      query: ({ id }) => ({
        url: `admin/exams/${id}`,
        method: "GET",
      }),
      providesTags: ["ExamsGetDataById"],
    }),

    ExamsCreate: build.mutation<IExams, AddExamsPayload>({
      query: (body) => ({
        url: `admin/exams`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["ExamsCreate", "ExamsGetDataById", "ExamsGetData"],
    }),
    ExamsCreateSections: build.mutation<IExams, { id: string; body: AddExamsCreateSection }>({
      query: ({ body, id }) => ({
        url: `admin/exams/${id}/sections`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["ExamsCreateSections", "ExamsGetDataById", "ExamsGetData"],
    }),

    ExamsUpdate: build.mutation<IExams, { id: string; body: UpdateExamsPayload }>({
      query: ({ body, id }) => ({
        url: `admin/exams/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["ExamsUpdate", "ExamsGetDataById", "ExamsGetData"],
    }),

    ExamsRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `admin/exams/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ExamsRemove", "ExamsGetDataById", "ExamsGetData"],
    }),
    ExamSectionsRemove: build.mutation<void, { examSectionIds: string[] }>({
      query: (body) => ({
        url: `admin/exams/examSections`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["ExamSectionsRemove", "ExamsGetDataById", "ExamsGetData"],
    }),
  }),
});
export const {
  useExamsGetDataQuery,
  useLazyExamsGetDataQuery,
  useExamsGetDataByIdQuery,
  useLazyExamsGetDataByIdQuery,
  useExamsCreateMutation,
  useExamsRemoveMutation,
  useExamsUpdateMutation,
  useExamsCreateSectionsMutation,
  useExamSectionsRemoveMutation,
} = Exams;
