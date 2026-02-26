import { api, BASE_URL } from "@/services/api";
import { User } from "next-auth";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";
import { IClass } from "./class";

export interface SuperTeacherLibraryDataResponse extends User {}

export interface ISuperTeacherLibrary {
  id: string;
  title: string;
  description: string;
  url: string;
  classId: string;
  sectionId: string;
  createdAt: string;
  updatedAt: string;
  Class: IClass;
  Section: {
    id: string;
    name: string;
    isActive: string;
    createdAt: string;
    updatedAt: string;
    classId: string;
  }[];
}

export interface AddSuperTeacherLibraryPayload {
  title: string;
  description: string;
  url?: string;
  classId: string;
  sectionId: string;
}

export interface GetSuperTeacherLibraryDataRequestParams extends GetDataRequestParams {
  classId?: string;
  sectionId?: string;
}

export const SuperTeacherLibrary = api.injectEndpoints({
  endpoints: (build) => ({
    SuperTeacherLibraryGetData: build.query<BaseGetDataResponse<ISuperTeacherLibrary>, GetSuperTeacherLibraryDataRequestParams>({
      query: (params) => ({
        url: `super/teacher/library`,
        params,
        method: "GET",
      }),
      transformResponse: (response: BaseGetDataResponse<ISuperTeacherLibrary>) => {
        if (response.data.length > 0) {
          response.data.map((data) => {
            if (data.url) {
              data.url = BASE_URL + "uploads/" + data.url;
            }
            return data;
          });
        }
        return response;
      },
      providesTags: ["SuperTeacherLibraryGetData"],
    }),

    SuperTeacherLibraryGetDataById: build.query<ISuperTeacherLibrary, { id: string }>({
      query: ({ id }) => ({
        url: `super/teacher/library/${id}`,
        method: "GET",
      }),
      providesTags: ["SuperTeacherLibraryGetDataById"],
    }),

    SuperTeacherLibraryCreate: build.mutation<SuperTeacherLibraryDataResponse, FormData>({
      query: (body) => ({
        url: `super/teacher/library`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["SuperTeacherLibraryCreate", "SuperTeacherLibraryGetDataById", "SuperTeacherLibraryGetData"],
    }),
    SuperTeacherLibraryUpdate: build.mutation<SuperTeacherLibraryDataResponse, { id: string; body: FormData }>({
      query: ({ body, id }) => ({
        url: `super/teacher/library/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["SuperTeacherLibraryUpdate", "SuperTeacherLibraryGetDataById", "SuperTeacherLibraryGetData"],
    }),

    SuperTeacherLibraryRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `super/teacher/library/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SuperTeacherLibraryRemove", "SuperTeacherLibraryGetDataById", "SuperTeacherLibraryGetData"],
    }),
  }),
});
export const {
  useSuperTeacherLibraryGetDataQuery,
  useLazySuperTeacherLibraryGetDataQuery,
  useSuperTeacherLibraryGetDataByIdQuery,
  useLazySuperTeacherLibraryGetDataByIdQuery,
  useSuperTeacherLibraryCreateMutation,
  useSuperTeacherLibraryRemoveMutation,
  useSuperTeacherLibraryUpdateMutation,
} = SuperTeacherLibrary;
