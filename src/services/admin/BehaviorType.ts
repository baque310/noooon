// no need for this page for now maybe in the future
import { api } from "@/services/api";
import { User } from "next-auth";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface BehaviorTypeDataResponse extends User {}

export interface IBehaviorType {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddBehaviorTypePayload {
  name: string;
}

export const BehaviorType = api.injectEndpoints({
  endpoints: (build) => ({
    BehaviorTypeGetData: build.query<BaseGetDataResponse<IBehaviorType>, GetDataRequestParams>({
      query: (params) => ({
        url: `admin/BehaviorType`,
        params,
        method: "GET",
      }),
      providesTags: ["BehaviorTypeGetData"],
    }),

    BehaviorTypeGetDataById: build.query<IBehaviorType, { id: string }>({
      query: ({ id }) => ({
        url: `admin/BehaviorType/${id}`,
        method: "GET",
      }),
      providesTags: ["BehaviorTypeGetDataById"],
    }),

    BehaviorTypeCreate: build.mutation<BehaviorTypeDataResponse, AddBehaviorTypePayload>({
      query: (body) => ({
        url: `admin/BehaviorType`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["BehaviorTypeCreate", "BehaviorTypeGetDataById", "BehaviorTypeGetData"],
    }),
    BehaviorTypeUpdate: build.mutation<BehaviorTypeDataResponse, { id: string; body: AddBehaviorTypePayload }>({
      query: ({ body, id }) => ({
        url: `admin/BehaviorType/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["BehaviorTypeUpdate", "BehaviorTypeGetDataById", "BehaviorTypeGetData"],
    }),

    BehaviorTypeRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `admin/BehaviorType/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BehaviorTypeRemove", "BehaviorTypeGetDataById", "BehaviorTypeGetData"],
    }),
  }),
});
export const {
  useBehaviorTypeGetDataQuery,
  useLazyBehaviorTypeGetDataQuery,
  useBehaviorTypeGetDataByIdQuery,
  useLazyBehaviorTypeGetDataByIdQuery,
  useBehaviorTypeCreateMutation,
  useBehaviorTypeRemoveMutation,
  useBehaviorTypeUpdateMutation,
} = BehaviorType;
