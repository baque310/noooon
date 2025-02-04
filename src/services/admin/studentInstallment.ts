import { api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";
export interface IStudentInstallment {
  id: string;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  studentEnrollmentId: string;
  schoolYearId: string;
  schoolId: string;
  SchoolYear: {
    id: string;
    from: number;
    to: number;
  };
  StudentEnrollment: {
    id: string;
    amount: number;
    Student: {
      fullName: string;
      phone1: string;
      User: {
        id: string;
        username: string;
      };
    };
  };
}

export interface GetStudentDataRequestParams extends GetDataRequestParams {
  schoolYearId?: string;
  studentEnrollmentId?: string;
}

export interface AddStudentInstallmentPayload {
  date: string;
  amount: number;
  studentEnrollmentId?: string;
}

export const StudentInstallment = api.injectEndpoints({
  endpoints: (build) => ({
    StudentInstallmentGetData: build.query<
      BaseGetDataResponse<IStudentInstallment>,
      GetDataRequestParams
    >({
      query: (params) => ({
        url: `admin/student-installment`,
        params,
        method: "GET",
      }),
      providesTags: ["StudentInstallmentGetData"],
    }),

    StudentInstallmentGetDataById: build.query<
      IStudentInstallment,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `admin/student-installment/${id}`,
        method: "GET",
      }),
      providesTags: ["StudentInstallmentGetDataById"],
    }),

    StudentInstallmentCreate: build.mutation<
      IStudentInstallment,
      AddStudentInstallmentPayload
    >({
      query: (body) => ({
        url: `admin/student-installment`,
        body,
        method: "POST",
      }),
      invalidatesTags: [
        "StudentInstallmentCreate",
        "StudentInstallmentGetDataById",
        "StudentInstallmentGetData",
      ],
    }),

    StudentInstallmentUpdate: build.mutation<
      IStudentInstallment,
      { id: string; body: AddStudentInstallmentPayload }
    >({
      query: ({ id, body }) => ({
        url: `admin/student-installment/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: [
        "StudentInstallmentUpdate",
        "StudentInstallmentGetDataById",
        "StudentInstallmentGetData",
      ],
    }),

    StudentInstallmentRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `admin/student-installment/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "StudentInstallmentRemove",
        "StudentInstallmentGetDataById",
        "StudentInstallmentGetData",
      ],
    }),
  }),
});
export const {
  useStudentInstallmentGetDataQuery,
  useLazyStudentInstallmentGetDataQuery,
  useStudentInstallmentGetDataByIdQuery,
  useLazyStudentInstallmentGetDataByIdQuery,
  useStudentInstallmentCreateMutation,
  useStudentInstallmentRemoveMutation,
  useStudentInstallmentUpdateMutation,
  
} = StudentInstallment;
