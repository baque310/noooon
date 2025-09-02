import { api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";
import { IAdminDiscount } from "./discount";
import { IStudentEnrollment } from "./studentEnrollment";
import { ISchoolYear } from "../SchoolYear";
import { ISchool } from "./School";

export interface IInstallment {
  id: string;
  title: string;
  numberOfInstallments: number;
  totalAmount: number;
  installmentAmount: number;
  notes: string;
  discountId: string;
  daysBetweenInstallments: number;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  discountAmount: number;
  finalTotalAmount: number;
  isActive: boolean;
  studentEnrollmentId: string;
  schoolYearId: string;
  schoolId: string;
  School: ISchool;
  SchoolYear: ISchoolYear;
  StudentEnrollment: IStudentEnrollment;
  Discount: IAdminDiscount;
}

export interface AddInstallmentPayload {
  title: string;
  numberOfInstallments: number;
  totalAmount: number;
  installmentAmount: number;
  notes: string;
  studentEnrollmentIds?: string[];
  discountId: string;
  daysBetweenInstallments: number;
  startDate: string;
  isActive?: boolean;
}

export const Installment = api.injectEndpoints({
  endpoints: (build) => ({
    InstallmentGetData: build.query<
      BaseGetDataResponse<IInstallment>,
      GetDataRequestParams
    >({
      query: (params) => ({
        url: `installment`,
        params,
        method: "GET",
      }),
      providesTags: ["InstallmentGetData"],
    }),

    InstallmentGetDataById: build.query<IInstallment, { id: string }>({
      query: ({ id }) => ({
        url: `installment/${id}`,
        method: "GET",
      }),
      providesTags: ["InstallmentGetDataById"],
    }),

    InstallmentCreate: build.mutation<IInstallment, AddInstallmentPayload>({
      query: (body) => ({
        url: `installment`,
        body,
        method: "POST",
      }),
      invalidatesTags: (res) =>
        res
          ? [
              "InstallmentCreate",
              "InstallmentGetDataById",
              "InstallmentGetData",
            ]
          : [],
    }),

    InstallmentUpdate: build.mutation<
      IInstallment,
      { id: string; body: AddInstallmentPayload }
    >({
      query: ({ body, id }) => ({
        url: `installment/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: (res) =>
        res
          ? [
              "InstallmentUpdate",
              "InstallmentGetDataById",
              "InstallmentGetData",
            ]
          : [],
    }),

    InstallmentRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `installment/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (res) =>
        res
          ? [
              "InstallmentRemove",
              "InstallmentGetDataById",
              "InstallmentGetData",
            ]
          : [],
    }),
  }),
});
export const {
  useInstallmentGetDataQuery,
  useLazyInstallmentGetDataQuery,
  useInstallmentGetDataByIdQuery,
  useLazyInstallmentGetDataByIdQuery,
  useInstallmentCreateMutation,
  useInstallmentRemoveMutation,
  useInstallmentUpdateMutation,
} = Installment;
