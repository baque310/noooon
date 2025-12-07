import { api } from "@/services/api";
import { User } from "next-auth";
import { GetDataRequestParams } from "../types/BaseType";

export interface SubSubjectDataResponse extends User {}

export interface ISubSubject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
  School: {
    id: string;
    name: string;
    schoolId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface AddSubSubjectPayload {
  name: string;
  subjectId: string;
}
export interface UpdateSubSubjectPayload {
  name: string;
}

export const SubSubject = api.injectEndpoints({
  endpoints: (build) => ({
    SubSubjectGetData: build.query<ISubSubject[], GetDataRequestParams>({
      query: (params) => ({
        url: `admin/sub-subject`,
        params,
        method: "GET",
      }),
      providesTags: ["SubSubjectGetData"],
    }),

    SubSubjectGetDataById: build.query<ISubSubject, { id: string }>({
      query: ({ id }) => ({
        url: `admin/sub-subject/${id}`,
        method: "GET",
      }),
      providesTags: ["SubSubjectGetDataById"],
    }),

    SubSubjectCreate: build.mutation<SubSubjectDataResponse, AddSubSubjectPayload>({
      query: (body) => ({
        url: `admin/sub-subject`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["SubSubjectCreate", "SubSubjectGetDataById", "SubSubjectGetData"],
    }),
    SubSubjectUpdate: build.mutation<SubSubjectDataResponse, { id: string; body: UpdateSubSubjectPayload }>({
      query: ({ body, id }) => ({
        url: `admin/sub-subject/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["SubSubjectUpdate", "SubSubjectGetDataById", "SubSubjectGetData"],
    }),

    SubSubjectRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `admin/sub-subject/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SubSubjectRemove", "SubSubjectGetDataById", "SubSubjectGetData"],
    }),
  }),
});
export const {
  useSubSubjectGetDataQuery,
  useLazySubSubjectGetDataQuery,
  useSubSubjectGetDataByIdQuery,
  useLazySubSubjectGetDataByIdQuery,
  useSubSubjectCreateMutation,
  useSubSubjectRemoveMutation,
  useSubSubjectUpdateMutation,
} = SubSubject;
