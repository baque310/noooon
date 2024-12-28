import { api } from "@/services/api";
import { User } from "next-auth";
import { IStage } from "./stage";

export interface SchoolDataResponse extends User { }

export interface ISchool {
  id: string
  name: string
  address: string
  email: string
  phone1: string
  phone2: string
  hasBanner: string
  isActive: string
  createdAt: string
  updatedAt: string
  Stage: IStage[]
}


export interface UpdateSchoolPayload {
  name: string
  address: string
  email: string
  phone1: string
  phone2: string

}

export const School = api.injectEndpoints({
  endpoints: (build) => ({
    SchoolGetData: build.query<ISchool, void>({
      query: (params) => ({
        url: `admin/school`,
        params,
        method: "GET",
      }),
      providesTags: ["SchoolGetDataAdmin"],


    }),
    SchoolUpdate: build.mutation<SchoolDataResponse, UpdateSchoolPayload>({
      query: (body) => ({
        url: `admin/school`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["SchoolUpdateAdmin", "SchoolGetDataAdmin"],
    }),


  }),
});
export const {
  useSchoolGetDataQuery,
  useLazySchoolGetDataQuery,
  useSchoolUpdateMutation,

} = School;
