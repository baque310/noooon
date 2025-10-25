import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface IGallery {
  id: string;
  title: string;
  Status: string;
  createdAt: string;
  updatedAt: string;
  schoolId: string;
  description: string;
  classId: string;
  sectionId: string;
  School: {
    id: string;
    name: string;
  };
  GalleryAttachment: {
    id: string;
    url: string;
  }[];
}

export interface AddGalleryPayload {
  title: string;
  description: string;
  classId: string;
  sectionId: string;
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
        if (response.GalleryAttachment) {
          response.GalleryAttachment = response.GalleryAttachment.map((attachment) => {
            attachment.url = BASE_URL + "uploads/" + attachment.url;
            return attachment;
          });
        }
        return response;
      },
    }),

    GalleryCreate: build.mutation<IGallery, AddGalleryPayload | FormData>({
      query: (body) => ({
        url: `admin/gallery`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["GalleryCreate", "GalleryGetDataById", "GalleryGetData"],
    }),

    GalleryUpdate: build.mutation<IGallery, { id: string; body: AddGalleryPayload | FormData }>({
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
    GalleryRemoveImage: build.mutation<void, { id: string; body: { attachmentIds: string[] } }>({
      query: ({ id, body }) => ({
        url: `admin/gallery/attachments`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["GalleryRemoveImage", "GalleryGetDataById", "GalleryGetData"],
    }),
    GalleryCreateImage: build.mutation<
      void,
      {
        id: string;
        body:
          | {
              attachments: string[];
            }
          | FormData;
      }
    >({
      query: ({ id, body }) => ({
        url: `admin/gallery/${id}/attachments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["GalleryCreateImage", "GalleryGetDataById", "GalleryGetData"],
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
  useGalleryCreateImageMutation,
  useGalleryRemoveImageMutation,
} = Gallery;
