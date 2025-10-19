import { api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";
import { Status } from "./installmentPayment";

export interface IOtherPayment {
  id: string;
  title: string;
  amount?: number;
  studentEnrollmentIds?: string[];
  StudentEnrollment?: any;
  notes?: string;
  isPaid: Status;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddOtherPaymentPayload {
  title: string;
  amount?: number;
  studentEnrollmentIds?: string[];
  notes?: string;
  paymentMethod?: string;
}

export interface OtherPaymentStatusPayload {
  paidAmount?: number;
  paymentMethod?: string;
  notes?: string;
}

export const OtherPayment = api.injectEndpoints({
  endpoints: (build) => ({
    OtherPaymentGetData: build.query<BaseGetDataResponse<IOtherPayment>, GetDataRequestParams>({
      query: (params) => ({
        url: `other-payment`,
        params,
        method: "GET",
      }),
      providesTags: ["OtherPaymentGetData"],
    }),

    OtherPaymentGetDataById: build.query<IOtherPayment, { id: string }>({
      query: ({ id }) => ({
        url: `other-payment/${id}`,
        method: "GET",
      }),
      providesTags: ["OtherPaymentGetDataById"],
    }),

    OtherPaymentCreate: build.mutation<IOtherPayment, AddOtherPaymentPayload | FormData>({
      query: (body) => ({
        url: `other-payment`,
        body,
        method: "POST",
      }),
      invalidatesTags: (res) => (res ? ["OtherPaymentCreate", "OtherPaymentGetDataById", "OtherPaymentGetData"] : []),
    }),

    OtherPaymentUpdate: build.mutation<IOtherPayment, { id: string; body: AddOtherPaymentPayload }>({
      query: ({ body, id }) => ({
        url: `other-payment/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: (res) => (res ? ["OtherPaymentUpdate", "OtherPaymentGetDataById", "OtherPaymentGetData"] : []),
    }),
    OtherPaymentChangeStatus: build.mutation<IOtherPayment, { id: string; order_status: string }>({
      query: ({ order_status, id }) => ({
        url: `/other-payment/paidStatus/${id}/${order_status}`,
        method: "PATCH",
      }),
      invalidatesTags: (res) => (res ? ["OtherPaymentUpdate", "OtherPaymentGetDataById", "OtherPaymentGetData"] : []),
    }),

    OtherPaymentRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `other-payment/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (res) => (res ? ["OtherPaymentRemove", "OtherPaymentGetDataById", "OtherPaymentGetData"] : []),
    }),
  }),
});
export const {
  useOtherPaymentGetDataQuery,
  useLazyOtherPaymentGetDataQuery,
  useOtherPaymentGetDataByIdQuery,
  useLazyOtherPaymentGetDataByIdQuery,
  useOtherPaymentCreateMutation,
  useOtherPaymentRemoveMutation,
  useOtherPaymentUpdateMutation,
  useOtherPaymentChangeStatusMutation,
} = OtherPayment;
