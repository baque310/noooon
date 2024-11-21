import { BASE_URL, api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";
import { User } from "next-auth";

export interface SchoolDataResponse extends User { }

export interface ISchool {

  id: string
  name: string
  address: string
  email: string
  phone1: string
  phone2: string
  hasBanner: string // TODO:
  isActive: string // TODO:
  createdAt: string
  updatedAt: string
  Admin: {
    photo: null | string
    isActive: boolean
    username: string
  }[]
}


export interface AddSchoolPayload {
  username: string
  password: string
  School: {
    name: string
    address: string
    email: string
    phone1: string
    phone2: string
    hasBanner: string // TODO:
    Stage: {
      name: IStage
      Class: {
        name: string
        Section: {
          name: string
        }[]
      }[]
    }[]
  }
}

export interface UpdateSchoolPayload {
  name: string
  address: string
  email: string
  phone1: string
  phone2: string
  hasBanner: string  // TODO:
  isActive: string // TODO:
}


export enum IStage {
  Primary = "Primary",
  Intermediate = "Intermediate",
  Preparatory = "Preparatory",
}





export const School = api.injectEndpoints({
  endpoints: (build) => ({
    SchoolGetData: build.query<BaseGetDataResponse<ISchool>, GetDataRequestParams>({
      query: (params) => ({
        url: `manager/school`,
        params,
        method: "GET",
      }),
      providesTags: ["SchoolGetData"],
      transformResponse: (response: BaseGetDataResponse<ISchool>) => {
        response.data = response.data.map((item) => {
          if (item.Admin.length > 0) {
            item.Admin = item.Admin.map((admin) => {
              if (admin.photo) {
                admin.photo = BASE_URL + "uploads/" + admin.photo;
              }
              return admin;
            });
          }
          return item;
        });
        return response;
      },
    }),

    SchoolGetDataById: build.query<ISchool, { id: string }>({
      query: ({ id }) => ({
        url: `manager/school/${id}`,
        method: "GET",
      }),
      providesTags: ["SchoolGetDataById"],
      transformResponse: (response: ISchool) => {
        if (response.Admin.length > 0) {
          response.Admin = response.Admin.map((admin) => {
            if (admin.photo) {
              admin.photo = BASE_URL + "uploads/" + admin.photo;
            }
            return admin;
          });
        }

        return response;
      },
    }),

    SchoolCreate: build.mutation<SchoolDataResponse, AddSchoolPayload>({
      query: (body) => ({
        url: `manager/school`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["SchoolCreate", "SchoolGetDataById", "SchoolGetData"],
    }),
    SchoolUpdate: build.mutation<SchoolDataResponse, { id: string; body: UpdateSchoolPayload }>({
      query: ({ id, body }) => ({
        url: `manager/school/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["SchoolCreate", "SchoolGetDataById", "SchoolGetData"],
    }),


  }),
});
export const {
  useSchoolGetDataQuery,
  useLazySchoolGetDataQuery,
  useSchoolGetDataByIdQuery,
  useLazySchoolGetDataByIdQuery,
  useSchoolUpdateMutation,
  useSchoolCreateMutation,

} = School;
