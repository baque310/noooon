import { api } from "@/services/api";
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
    SettingUpdate: build.mutation<ISetting, { id: string, currentSchoolYearId: string }>({
      query: ({ id, currentSchoolYearId }) => ({
        url: `setting/${id}`,
        body: { currentSchoolYearId },
        method: "PATCH",
      }),
      invalidatesTags: ["SettingGetData", "SettingUpdate"],
    }),
  }),
});
export const {
  useSettingGetDataQuery,
  useLazySettingGetDataQuery,
  useSettingUpdateMutation,

} = Setting;
