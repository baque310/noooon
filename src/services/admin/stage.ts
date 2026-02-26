import { BASE_URL, api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";
import { User } from "next-auth";
import { ISchool } from "../Manager/School";

export interface StageDataResponse extends User { }

export interface IStage {

    id: string
    name: string
    createdAt: string
    updatedAt: string
    schoolId: string
    School: ISchool
    Class: {
        id: string
        name: string
        createdAt: string
        updatedAt: string
        stageId: string
        Section: {
            id: string
            name: string
            isActive: string
            createdAt: string
            updatedAt: string
            classId: string
        }[]
    }[]
}


export interface AddStagePayload {
    name: string 
}









export const Stage = api.injectEndpoints({
    endpoints: (build) => ({
        StageGetData: build.query<IStage[], void>({
            query: (params) => ({
                url: `admin/stage`,
                params,
                method: "GET",
            }),
            providesTags: ["StageGetData"],

        }),

        StageGetDataById: build.query<IStage, { id: string }>({
            query: ({ id }) => ({
                url: `admin/stage/${id}`,
                method: "GET",
            }),
            providesTags: ["StageGetDataById"],

        }),

        StageCreate: build.mutation<StageDataResponse, AddStagePayload>({
            query: (body) => ({
                url: `admin/stage`,
                body,
                method: "POST",
            }),
            invalidatesTags: ["StageCreate", "StageGetDataById", "StageGetData"],
        }),

        StageRemove: build.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `admin/stage/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["StageRemove", "StageGetDataById", "StageGetData"],
        }),



    }),
});
export const {
    useStageGetDataQuery,
    useLazyStageGetDataQuery,
    useStageGetDataByIdQuery,
    useLazyStageGetDataByIdQuery,
    useStageCreateMutation,
    useStageRemoveMutation

} = Stage;
