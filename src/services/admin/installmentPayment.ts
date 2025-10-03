import { api } from "@/services/api";
import { IAdminDiscount } from "./discount";
import { IInstallment } from "./Installment";

export interface IInstallmentPayment {
  installment: IInstallment & {
    InstallmentPayments: IInstallmentPayments[];
    Discount: IAdminDiscount;
  };
}

export interface IInstallmentPayments {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  isPaid: Status;
  paymentMethod: PaymentMethod;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  installmentId: string;
  schoolId: string;
}

export interface InstallmentPaymentPayload {
  isPaid: boolean;
  paidDate: string;
  paymentMethod: PaymentMethod;
  notes: string;
}
export enum PaymentMethod {
  ZainCash = "ZainCash",
  QiCard = "QiCard",
  Cash = "Cash",
}

export interface InstallmentPaymentStatusPayload {
  paidAmount?: number;
  paymentMethod?: string;
  notes?: string;
}

export enum Status {
  Paid = "paid",
  Unpaid = "unpaid",
  Partial = "partial",
}

export const InstallmentPaymentPayment = api.injectEndpoints({
  endpoints: (build) => ({
    InstallmentPaymentGetDataByStudentEnrollmentId: build.query<IInstallmentPayment, { studentEnrollmentId: string }>({
      query: ({ studentEnrollmentId }) => ({
        url: `installment-payment/installment/${studentEnrollmentId}`,
        method: "GET",
      }),
      providesTags: ["InstallmentPaymentGetDataByStudentEnrollmentId"],
    }),

    InstallmentPaymentCreate: build.mutation<IInstallmentPayment, { installmentId: string; body: InstallmentPaymentPayload }>({
      query: ({ installmentId, body }) => ({
        url: `installment-payment/pay-outstanding/${installmentId}`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["InstallmentPaymentCreate", "InstallmentPaymentUpdate", "InstallmentPaymentGetDataByStudentEnrollmentId"],
    }),

    InstallmentPaymentUpdate: build.mutation<IInstallmentPayment, { id: string; body: InstallmentPaymentPayload }>({
      query: ({ body, id }) => ({
        url: `installment-payment/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: (res) => (res ? ["InstallmentPaymentUpdate", "InstallmentPaymentGetDataByStudentEnrollmentId"] : []),
    }),
    InstallmentPaymentUpdateStatus: build.mutation<IInstallmentPayment, { id: string; status: Status; body: InstallmentPaymentStatusPayload }>({
      query: ({ status, id, body }) => ({
        url: `installment-payment/paidStatus/${id}/${status}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (res) => (res ? ["InstallmentPaymentUpdateStatus", "InstallmentPaymentGetDataByStudentEnrollmentId"] : []),
    }),
  }),
});
export const {
  useInstallmentPaymentUpdateMutation,
  useInstallmentPaymentGetDataByStudentEnrollmentIdQuery,
  useInstallmentPaymentUpdateStatusMutation,
  useInstallmentPaymentCreateMutation,
  useLazyInstallmentPaymentGetDataByStudentEnrollmentIdQuery,
} = InstallmentPaymentPayment;
