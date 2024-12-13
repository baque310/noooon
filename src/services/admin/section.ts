import { api } from "@/services/api";
import { User } from "next-auth";
import { GetDataRequestParams } from "../types/BaseType";
import { IStage } from "./stage";

export interface SectionDataResponse extends User { }

export interface ISection {
    id: string
    name: string
    isActive: string
    createdAt: string
    updatedAt: string
    classId: string
    Class: {
        id: string
        name: string
        createdAt: string
        updatedAt: string
        stageId: string
        Stage: IStage
    }
}




export interface AddSectionPayload {
    name: string
    classId: string
}
export interface UpdateSectionPayload {
    name: string
    isActive: string
}









export const Section = api.injectEndpoints({
    endpoints: (build) => ({
        SectionGetData: build.query<ISection[], GetDataRequestParams>({
            query: (params) => ({
                url: `admin/section`,
                params,
                method: "GET",
            }),
            providesTags: ["SectionGetData"],

        }),

        SectionGetDataById: build.query<ISection, { id: string }>({
            query: ({ id }) => ({
                url: `admin/section/${id}`,
                method: "GET",
            }),
            providesTags: ["SectionGetDataById"],

        }),

        SectionCreate: build.mutation<SectionDataResponse, AddSectionPayload>({
            query: (body) => ({
                url: `admin/section`,
                body,
                method: "POST",
            }),
            invalidatesTags: ["SectionCreate", "SectionGetDataById", "SectionGetData"],
        }),
        SectionUpdate: build.mutation<SectionDataResponse, { id: string, body: UpdateSectionPayload }>({
            query: ({ body, id }) => ({
                url: `admin/section/${id}`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["SectionUpdate", "SectionGetDataById", "SectionGetData"],
        }),

        SectionRemove: build.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `admin/section/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["SectionRemove", "SectionGetDataById", "SectionGetData"],
        }),



    }),
});
export const {
    useSectionGetDataQuery,
    useLazySectionGetDataQuery,
    useSectionGetDataByIdQuery,
    useLazySectionGetDataByIdQuery,
    useSectionCreateMutation,
    useSectionRemoveMutation,
    useSectionUpdateMutation,

} = Section;
