import { api } from "@/services/api";

export interface ISchoolYear {
  id: string;
  from: number;
  to: number;
}
export const SchoolYear = api.injectEndpoints({
  endpoints: (build) => ({
    SchoolYearGetData: build.query<ISchoolYear[], void>({
      query: (params) => ({
        url: `school-year`,
        params,
        method: "GET",
      }),
      providesTags: ["SchoolYearGetData"],
    }),
  }),
});
export const {
  useSchoolYearGetDataQuery,
  useLazySchoolYearGetDataQuery,

} = SchoolYear;
