import { api } from "@/services/api";
import { User } from "next-auth";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface BehaviorSectionDataResponse extends User {}

export interface IBehaviorSection {
  id: string;
  name: string;
  status: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddBehaviorSectionPayload {
  name: string;
}

export const BehaviorSection = api.injectEndpoints({
  endpoints: (build) => ({
    BehaviorSectionGetData: build.query<BaseGetDataResponse<IBehaviorSection>, GetDataRequestParams>({
      query: (params) => ({
        url: `admin/BehaviorSection`,
        params,
        method: "GET",
      }),
      providesTags: ["BehaviorSectionGetData"],
    }),

    BehaviorSectionGetDataById: build.query<IBehaviorSection, { id: string }>({
      query: ({ id }) => ({
        url: `admin/BehaviorSection/${id}`,
        method: "GET",
      }),
      providesTags: ["BehaviorSectionGetDataById"],
    }),

    BehaviorSectionCreate: build.mutation<BehaviorSectionDataResponse, AddBehaviorSectionPayload>({
      query: (body) => ({
        url: `admin/BehaviorSection`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["BehaviorSectionCreate", "BehaviorSectionGetDataById", "BehaviorSectionGetData"],
    }),
    BehaviorSectionUpdate: build.mutation<BehaviorSectionDataResponse, { id: string; body: AddBehaviorSectionPayload }>({
      query: ({ body, id }) => ({
        url: `admin/BehaviorSection/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["BehaviorSectionUpdate", "BehaviorSectionGetDataById", "BehaviorSectionGetData"],
    }),

    BehaviorSectionRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `admin/BehaviorSection/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BehaviorSectionRemove", "BehaviorSectionGetDataById", "BehaviorSectionGetData"],
    }),
  }),
});
export const {
  useBehaviorSectionGetDataQuery,
  useLazyBehaviorSectionGetDataQuery,
  useBehaviorSectionGetDataByIdQuery,
  useLazyBehaviorSectionGetDataByIdQuery,
  useBehaviorSectionCreateMutation,
  useBehaviorSectionRemoveMutation,
  useBehaviorSectionUpdateMutation,
} = BehaviorSection;
