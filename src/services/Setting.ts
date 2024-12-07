import { BASE_URL, api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "./types/BaseType";
import { User } from "next-auth";

export interface SettingDataResponse extends User { }

export interface ISetting {

  id: string
  createdAt: string
  updatedAt: string
  currentSchoolYearId: string
  CurrentSchoolYear: {
    id: string
    from: number
    to: number
  }
}


export const Setting = api.injectEndpoints({
  endpoints: (build) => ({
    SettingGetData: build.query<ISetting, void>({
      query: (params) => ({
        url: `setting`,
        params,
        method: "GET",
      }),
      providesTags: ["SettingGetData"],
    }),
  }),
});
export const {
  useSettingGetDataQuery,
  useLazySettingGetDataQuery,
} = Setting;
