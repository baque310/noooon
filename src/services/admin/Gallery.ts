import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface IGallery {
    id: string
    title: string 
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

export interface AddGalleryPayload {
    title: string 
    url: string | null
}


export const Gallery = api.injectEndpoints({
    endpoints: (build) => ({
        GalleryGetData: build.query<BaseGetDataResponse<IGallery>, GetDataRequestParams>({
            query: (params) => ({
                url: `admin/gallery`,
                params,
                method: "GET",
            }),
            providesTags: ["GalleryGetData"],

        }),

        GalleryGetDataById: build.query<IGallery, { id: string }>({
            query: ({ id }) => ({
                url: `admin/gallery/${id}`,
                method: "GET",
            }),
            providesTags: ["GalleryGetDataById"],
            transformResponse: (response: IGallery) => {
                if (response.url) {
                    response.url = BASE_URL + "uploads/" + response.url
                }
                return response
            }

        }),

        GalleryCreate: build.mutation<IGallery, AddGalleryPayload | FormData >({
            query: (body) => ({
                url: `admin/gallery`,
                body,
                method: "POST",
            }),
            invalidatesTags: ["GalleryCreate", "GalleryGetDataById", "GalleryGetData"],
        }),

        GalleryUpdate: build.mutation<IGallery, { id: string, body: AddGalleryPayload | FormData }>({
            query: ({ body, id }) => ({
                url: `admin/gallery/${id}`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["GalleryUpdate", "GalleryGetDataById", "GalleryGetData"],
        }),

        GalleryRemove: build.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `admin/gallery/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["GalleryRemove", "GalleryGetDataById", "GalleryGetData"],
        }), 

    }),
});
export const {
    useGalleryGetDataQuery,
    useLazyGalleryGetDataQuery,
    useGalleryGetDataByIdQuery,
    useLazyGalleryGetDataByIdQuery,
    useGalleryCreateMutation,
    useGalleryRemoveMutation,
    useGalleryUpdateMutation, 
} = Gallery;
