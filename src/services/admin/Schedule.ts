import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, Days, GetDataRequestParams } from "../types/BaseType";



export type ISchedule = {
    [K in keyof typeof Days]: IScheduleData[];
}

interface IScheduleData {
    id: string
    day: string
    timeFrom: string
    timeTo: string
    schoolYearId: string
    schoolId: string
    updatedAt: string
    createdAt: string

}


export interface AddSchedulePayload {
    schedules: {
        day: Days
        timeFrom: string
        timeTo: string
        schoolYearId: string
    }[]


}
export interface UpdateSchedulePayload {
    timeFrom: string
    timeTo: string
}



// enum Days covert to array ?
export const daysArray = Object.values(Days).map(d => { return { value: d, label: d } })



export interface GetScheduleDataRequestParams extends GetDataRequestParams {
    day?: string
}

export const Schedule = api.injectEndpoints({
    endpoints: (build) => ({
        ScheduleGetData: build.query<ISchedule, GetScheduleDataRequestParams>({
            query: (params) => ({
                url: `admin/schedule`,
                params,
                method: "GET",
            }),
            providesTags: ["ScheduleGetData"],

        }),

        ScheduleGetDataById: build.query<IScheduleData, { id: string }>({
            query: ({ id }) => ({
                url: `admin/schedule/${id}`,
                method: "GET",
            }),
            providesTags: ["ScheduleGetDataById"],

        }),

        ScheduleCreate: build.mutation<ISchedule, AddSchedulePayload>({
            query: (body) => ({
                url: `admin/schedule`,
                body,
                method: "POST",
            }),
            invalidatesTags: ["ScheduleCreate", "ScheduleGetDataById", "ScheduleGetData"],
        }),

        ScheduleUpdate: build.mutation<ISchedule, { id: string, body: UpdateSchedulePayload }>({
            query: ({ body, id }) => ({
                url: `admin/schedule/${id}`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["ScheduleUpdate", "ScheduleGetDataById", "ScheduleGetData"],
        }),

        ScheduleRemove: build.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `admin/schedule/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ScheduleRemove", "ScheduleGetDataById", "ScheduleGetData"],
        }),



    }),
});
export const {
    useScheduleGetDataQuery,
    useLazyScheduleGetDataQuery,
    useScheduleGetDataByIdQuery,
    useLazyScheduleGetDataByIdQuery,
    useScheduleCreateMutation,
    useScheduleRemoveMutation,
    useScheduleUpdateMutation,

} = Schedule;
