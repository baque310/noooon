import { api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface IAdminDiscount {
  id: string;
  title: string;
  percentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddAdminDiscountPayload {
  title: string;
  percentage: number;
}

export const AdminDiscount = api.injectEndpoints({
  endpoints: (build) => ({
    AdminDiscountGetData: build.query<BaseGetDataResponse<IAdminDiscount>, GetDataRequestParams>({
      query: (params) => ({
        url: `admin/discount`,
        params,
        method: "GET",
      }),
      providesTags: ["AdminDiscountGetData"],
    }),

    AdminDiscountGetDataById: build.query<IAdminDiscount, { id: string }>({
      query: ({ id }) => ({
        url: `admin/discount/${id}`,
        method: "GET",
      }),
      providesTags: ["AdminDiscountGetDataById"],
    }),

    AdminDiscountCreate: build.mutation<IAdminDiscount, AddAdminDiscountPayload | FormData>({
      query: (body) => ({
        url: `admin/discount`,
        body,
        method: "POST",
      }),
      invalidatesTags: (res) => (res ? ["AdminDiscountCreate", "AdminDiscountGetDataById", "AdminDiscountGetData"] : []),
    }),

    AdminDiscountUpdate: build.mutation<IAdminDiscount, { id: string; body: AddAdminDiscountPayload }>({
      query: ({ body, id }) => ({
        url: `admin/discount/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: (res) => (res ? ["AdminDiscountUpdate", "AdminDiscountGetDataById", "AdminDiscountGetData"] : []),
    }),

    AdminDiscountRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `admin/discount/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (res) => (res ? ["AdminDiscountRemove", "AdminDiscountGetDataById", "AdminDiscountGetData"] : []),
    }),
  }),
});
export const {
  useAdminDiscountGetDataQuery,
  useLazyAdminDiscountGetDataQuery,
  useAdminDiscountGetDataByIdQuery,
  useLazyAdminDiscountGetDataByIdQuery,
  useAdminDiscountCreateMutation,
  useAdminDiscountRemoveMutation,
  useAdminDiscountUpdateMutation,
} = AdminDiscount;
