import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface IBanner {
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

export interface AddBannerPayload {
    title: string
    description: string
    url: string | null
}


export const Banner = api.injectEndpoints({
    endpoints: (build) => ({
        BannerGetData: build.query<BaseGetDataResponse<IBanner>, GetDataRequestParams>({
            query: (params) => ({
                url: `admin/banner`,
                params,
                method: "GET",
            }),
            providesTags: ["BannerGetData"],

        }),

        BannerGetDataById: build.query<IBanner, { id: string }>({
            query: ({ id }) => ({
                url: `admin/banner/${id}`,
                method: "GET",
            }),
            providesTags: ["BannerGetDataById"],
            transformResponse: (response: IBanner) => {
                if (response.url) {
                    response.url = BASE_URL + "uploads/" + response.url
                }
                return response
            }

        }),

        BannerCreate: build.mutation<IBanner, AddBannerPayload | FormData >({
            query: (body) => ({
                url: `admin/banner`,
                body,
                method: "POST",
            }),
            invalidatesTags: ["BannerCreate", "BannerGetDataById", "BannerGetData"],
        }),

        BannerUpdate: build.mutation<IBanner, { id: string, body: AddBannerPayload | FormData }>({
            query: ({ body, id }) => ({
                url: `admin/banner/${id}`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["BannerUpdate", "BannerGetDataById", "BannerGetData"],
        }),

        BannerRemove: build.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `admin/banner/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["BannerRemove", "BannerGetDataById", "BannerGetData"],
        }), 

    }),
});
export const {
    useBannerGetDataQuery,
    useLazyBannerGetDataQuery,
    useBannerGetDataByIdQuery,
    useLazyBannerGetDataByIdQuery,
    useBannerCreateMutation,
    useBannerRemoveMutation,
    useBannerUpdateMutation, 
} = Banner;
