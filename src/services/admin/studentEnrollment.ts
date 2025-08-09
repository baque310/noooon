import { api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";
import { IClass } from "./class";
import { IStage } from "./stage";
import { ISection } from "./section";
import { IStudent } from "./student";

export interface IStudentEnrollment {
  id: string;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  schoolId: string;
  stageId: string;
  classId: string;
  sectionId: string;
  schoolYearId: string;
  SchoolYear: {
    id: string;
    from: number;
    to: number;
  };
  Stage: IStage;
  Class: IClass;
  Section: ISection;
  Student: IStudent;
  amount: number;
}

export interface GetStudentDataRequestParams extends GetDataRequestParams {
  schoolYearId?: string;
  stageId?: string;
  classId?: string;
  sectionId?: string;
}

export interface AddStudentEnrollmentPayload {
  schoolYearId: string;
  stageId: string;
  classId: string;
  sectionId: string;
  students: {
    studentId: string;
    amount: number;
  }[];
}
export interface UpdateStudentEnrollmentPayload {
  schoolYearId: string;
  stageId: string;
  classId: string;
  sectionId: string;
  studentEnrollmentIds: string[];
}

export const StudentEnrollment = api.injectEndpoints({
  endpoints: (build) => ({
    StudentEnrollmentGetData: build.query<
      BaseGetDataResponse<IStudentEnrollment>,
      GetDataRequestParams
    >({
      query: (params) => ({
        url: `admin/student-enrollment`,
        params,
        method: "GET",
      }),
      providesTags: ["StudentEnrollmentGetData"],
    }),

    StudentEnrollmentGetDataById: build.query<
      IStudentEnrollment,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `admin/student-enrollment/${id}`,
        method: "GET",
      }),
      providesTags: ["StudentEnrollmentGetDataById"],
    }),

    StudentEnrollmentCreate: build.mutation<
      IStudentEnrollment,
      AddStudentEnrollmentPayload
    >({
      query: (body) => ({
        url: `admin/student-enrollment`,
        body,
        method: "POST",
      }),
      invalidatesTags: [
        "StudentGetDataHasNoEnrollment",
        "StudentEnrollmentCreate",
        "StudentEnrollmentGetDataById",
        "StudentEnrollmentGetData",
      ],
    }),

    StudentEnrollmentUpdate: build.mutation<
      IStudentEnrollment,
      UpdateStudentEnrollmentPayload
    >({
      query: (body) => ({
        url: `admin/student-enrollment`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: [
        "StudentEnrollmentUpdate",
        "StudentEnrollmentGetDataById",
        "StudentEnrollmentGetData",
      ],
    }),
    StudentEnrollmentUpdatePrice: build.mutation<
      IStudentEnrollment,
      {
        id: string;
        amount: number;
      }
    >({
      query: ({ id, amount }) => ({
        url: `admin/student-enrollment/${id}/price`,
        body: {
          amount,
        },
        method: "PATCH",
      }),
      invalidatesTags: [
        "StudentEnrollmentGetDataById",
        "StudentEnrollmentGetData",
        "StudentEnrollmentUpdatePrice",
      ],
    }),

    StudentEnrollmentRemove: build.mutation<
      void,
      { studentEnrollmentIds: string[] }
    >({
      query: (body) => ({
        url: `admin/student-enrollment`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: [
        "StudentEnrollmentRemove",
        "StudentEnrollmentGetDataById",
        "StudentEnrollmentGetData",
      ],
    }),
    StudentList: build.query<
      {
        userId: string;
        id: string;
        studentEnrollmentId: string;
        fullName: string;
      }[],
      {
        schoolYearId?: string;
        stageId?: string;
        classId?: string;
        sectionId?: string;
        search?: string;
      }
    >({
      query: (params) => ({
        url: `admin/student-enrollment/student/list`,
        params,
      }),
    }),
  }),
});
export const {
  useStudentEnrollmentGetDataQuery,
  useLazyStudentEnrollmentGetDataQuery,
  useStudentEnrollmentGetDataByIdQuery,
  useLazyStudentEnrollmentGetDataByIdQuery,
  useStudentEnrollmentCreateMutation,
  useStudentEnrollmentRemoveMutation,
  useStudentEnrollmentUpdateMutation,
  useStudentEnrollmentUpdatePriceMutation,
  useLazyStudentListQuery,
  useStudentListQuery,
} = StudentEnrollment;
