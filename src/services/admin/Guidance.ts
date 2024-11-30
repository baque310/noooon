import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface IGuidance {
    id: string
    title: string
    description: string
    url: string
    Status: string
    createdAt: string
    updatedAt: string
    schoolId: string
    School: {
        id: string
        name: string
    } 
} 

export interface AddGuidancePayload {
    title: string
    description: string
    url: string | null
}


export const Guidance = api.injectEndpoints({
    endpoints: (build) => ({
        GuidanceGetData: build.query<BaseGetDataResponse<IGuidance>, GetDataRequestParams>({
            query: (params) => ({
                url: `admin/guidance`,
                params,
                method: "GET",
            }),
            providesTags: ["GuidanceGetData"],

        }),

        GuidanceGetDataById: build.query<IGuidance, { id: string }>({
            query: ({ id }) => ({
                url: `admin/guidance/${id}`,
                method: "GET",
            }),
            providesTags: ["GuidanceGetDataById"],
            transformResponse: (response: IGuidance) => {
                if (response.url) {
                    response.url = BASE_URL + "uploads/" + response.url
                }
                return response
            }

        }),

        GuidanceCreate: build.mutation<IGuidance, AddGuidancePayload | FormData >({
            query: (body) => ({
                url: `admin/guidance`,
                body,
                method: "POST",
            }),
            invalidatesTags: ["GuidanceCreate", "GuidanceGetDataById", "GuidanceGetData"],
        }),

        GuidanceUpdate: build.mutation<IGuidance, { id: string, body: AddGuidancePayload | FormData }>({
            query: ({ body, id }) => ({
                url: `admin/guidance/${id}`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["GuidanceUpdate", "GuidanceGetDataById", "GuidanceGetData"],
        }),

        GuidanceRemove: build.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `admin/guidance/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["GuidanceRemove", "GuidanceGetDataById", "GuidanceGetData"],
        }), 

    }),
});
export const {
    useGuidanceGetDataQuery,
    useLazyGuidanceGetDataQuery,
    useGuidanceGetDataByIdQuery,
    useLazyGuidanceGetDataByIdQuery,
    useGuidanceCreateMutation,
    useGuidanceRemoveMutation,
    useGuidanceUpdateMutation, 
} = Guidance;
