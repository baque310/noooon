import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface IVideo {
  id: string;
  title: string;
  description: string;
  url: string;

  createdAt: string;
  updatedAt: string;
  schoolId: string;
  School: {
    id: string;
    name: string;
  };
}

export interface AddVideoPayload {
  title: string;
  description: string;
  url: string | null;
}

export const Video = api.injectEndpoints({
  endpoints: (build) => ({
    VideoGetData: build.query<
      BaseGetDataResponse<IVideo>,
      GetDataRequestParams
    >({
      query: (params) => ({
        url: `admin/video`,
        params,
        method: "GET",
      }),
      providesTags: ["VideoGetData"],
    }),

    VideoGetDataById: build.query<IVideo, { id: string }>({
      query: ({ id }) => ({
        url: `admin/video/${id}`,
        method: "GET",
      }),
      providesTags: ["VideoGetDataById"],
      transformResponse: (response: IVideo) => {
        if (response.url) {
          response.url = BASE_URL + "uploads/" + response.url;
        }
        return response;
      },
    }),

    VideoCreate: build.mutation<IVideo, AddVideoPayload | FormData>({
      query: (body) => ({
        url: `admin/video`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["VideoCreate", "VideoGetDataById", "VideoGetData"],
    }),

    VideoUpdate: build.mutation<
      IVideo,
      { id: string; body: AddVideoPayload | FormData }
    >({
      query: ({ body, id }) => ({
        url: `admin/video/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["VideoUpdate", "VideoGetDataById", "VideoGetData"],
    }),

    VideoRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `admin/video/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VideoRemove", "VideoGetDataById", "VideoGetData"],
    }),
  }),
});
export const {
  useVideoGetDataQuery,
  useLazyVideoGetDataQuery,
  useVideoGetDataByIdQuery,
  useLazyVideoGetDataByIdQuery,
  useVideoCreateMutation,
  useVideoRemoveMutation,
  useVideoUpdateMutation,
} = Video;
