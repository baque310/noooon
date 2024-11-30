import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface IManagerBanner {
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

export interface AddManagerBannerPayload {
    title: string
    description: string
    url: string | null
}


export const ManagerBanner = api.injectEndpoints({
    endpoints: (build) => ({
        ManagerBannerGetData: build.query<BaseGetDataResponse<IManagerBanner>, GetDataRequestParams>({
            query: (params) => ({
                url: `manager/banner`,
                params,
                method: "GET",
            }),
            providesTags: ["ManagerBannerGetData"],

        }),

        ManagerBannerGetDataById: build.query<IManagerBanner, { id: string }>({
            query: ({ id }) => ({
                url: `manager/banner/${id}`,
                method: "GET",
            }),
            providesTags: ["ManagerBannerGetDataById"],
            transformResponse: (response: IManagerBanner) => {
                if (response.url) {
                    response.url = BASE_URL + "uploads/" + response.url
                }
                return response
            }

        }),

        ManagerBannerCreate: build.mutation<IManagerBanner, AddManagerBannerPayload | FormData >({
            query: (body) => ({
                url: `manager/banner`,
                body,
                method: "POST",
            }),
            invalidatesTags: ["ManagerBannerCreate", "ManagerBannerGetDataById", "ManagerBannerGetData"],
        }),

        ManagerBannerUpdate: build.mutation<IManagerBanner, { id: string, body: AddManagerBannerPayload | FormData }>({
            query: ({ body, id }) => ({
                url: `manager/banner/${id}`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["ManagerBannerUpdate", "ManagerBannerGetDataById", "ManagerBannerGetData"],
        }),

        ManagerBannerRemove: build.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `manager/banner/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ManagerBannerRemove", "ManagerBannerGetDataById", "ManagerBannerGetData"],
        }), 

    }),
});
export const {
    useManagerBannerGetDataQuery,
    useLazyManagerBannerGetDataQuery,
    useManagerBannerGetDataByIdQuery,
    useLazyManagerBannerGetDataByIdQuery,
    useManagerBannerCreateMutation,
    useManagerBannerRemoveMutation,
    useManagerBannerUpdateMutation, 
} = ManagerBanner;
