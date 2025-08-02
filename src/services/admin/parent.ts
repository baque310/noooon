import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface IParent {
  id: string;
  fullName: string;
  birth: string;
  gender: Gender;
  hiringDate: string;
  address: string;
  email: string;
  phone1: string;
  phone2: string;
  photo: null | string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  schoolId: string;
  schoolBusId: null | string;
  User: {
    id: string;
    username: string;
  };

  Student: {
    id: string;
    fullName: string;
    phone1: string;
  };
}

export interface AddParentPayload {
  fullName: string;
  phone1: string;
  birth?: string;
  hiringDate?: string;
  address?: string;
  email?: string;
  phone2?: string;
  photo?: null | string;
  gender: Gender;
  studentId: string; // Assuming a parent is linked to a student
}

export type Gender = "Male" | "Female";

export const Parent = api.injectEndpoints({
  endpoints: (build) => ({
    ParentGetData: build.query<
      BaseGetDataResponse<IParent>,
      GetDataRequestParams
    >({
      query: (params) => ({
        url: `admin/parent`,
        params,
        method: "GET",
      }),
      providesTags: ["ParentGetData"],
      transformResponse: (response: BaseGetDataResponse<IParent>) => {
        if (response.data.length > 0) {
          response.data.map((data) => {
            if (data.photo) {
              data.photo = BASE_URL + "uploads/" + data.photo;
            }
            return data;
          });
        }
        return response;
      },
    }),

    ParentGetDataById: build.query<IParent, { id: string }>({
      query: ({ id }) => ({
        url: `admin/parent/${id}`,
        method: "GET",
      }),
      providesTags: ["ParentGetDataById"],
      transformResponse: (response: IParent) => {
        if (response.photo) {
          response.photo = BASE_URL + "uploads/" + response.photo;
        }
        return response;
      },
    }),

    ParentCreate: build.mutation<IParent, AddParentPayload>({
      query: (body) => ({
        url: `admin/parent`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["ParentCreate", "ParentGetDataById", "ParentGetData"],
    }),
    ParentMultipleForExcel: build.mutation<
      IParent,
      {
        parents: AddParentPayload[];
      }
    >({
      query: (body) => ({
        url: `admin/parent/multipleForExcel`,
        body,
        method: "POST",
      }),
      invalidatesTags: [
        "ParentMultipleForExcel",
        "ParentGetDataById",
        "ParentGetData",
      ],
    }),

    ParentUpdate: build.mutation<
      IParent,
      { id: string; body: AddParentPayload | FormData }
    >({
      query: ({ body, id }) => ({
        url: `admin/parent/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["ParentUpdate", "ParentGetDataById", "ParentGetData"],
    }),

    ParentRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `admin/parent/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ParentRemove", "ParentGetDataById", "ParentGetData"],
    }),
  }),
});
export const {
  useParentGetDataQuery,
  useLazyParentGetDataQuery,
  useParentGetDataByIdQuery,
  useLazyParentGetDataByIdQuery,
  useParentCreateMutation,
  useParentRemoveMutation,
  useParentUpdateMutation,
  useParentMultipleForExcelMutation,
} = Parent;
