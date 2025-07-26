import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface IComplaint {
  id: string;
  fullName: string;
  birth: string;
  Gender: Gender;
  hiringDate: string;
  address: string;
  email: string;
  phone1: string;
  phone2: string;
  photo: null | string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  schoolId: string;
  schoolBusId: null | string;
  User: {
    id: string;
    username: string;
  };
}

export interface AddComplaintPayload {
  fullName: string;
  phone1: string;
  birth?: string;
  hiringDate?: string;
  address?: string;
  email?: string;
  phone2?: string;
  photo?: null | string;
  Gender: Gender;
}

export type Gender = "Male" | "Female";

export const Complaint = api.injectEndpoints({
  endpoints: (build) => ({
    ComplaintGetDataForManager: build.query<
      BaseGetDataResponse<IComplaint>,
      GetDataRequestParams
    >({
      query: (params) => ({
        url: `complaint/forManager`,
        params,
        method: "GET",
      }),
      providesTags: ["ComplaintGetDataForManager"],
      transformResponse: (response: BaseGetDataResponse<IComplaint>) => {
        if (response.data.length > 0) {
          response.data.map((data) => {
            if (data.photo) {
              data.photo = BASE_URL + "uploads/" + data.photo;
            }
            return data;
          });
        }
        return response;
      },
    }),

    ComplaintGetDataById: build.query<IComplaint, { id: string }>({
      query: ({ id }) => ({
        url: `complaint/${id}`,
        method: "GET",
      }),
      providesTags: ["ComplaintGetDataById"],
      transformResponse: (response: IComplaint) => {
        if (response.photo) {
          response.photo = BASE_URL + "uploads/" + response.photo;
        }
        return response;
      },
    }),

    ComplaintCreate: build.mutation<IComplaint, AddComplaintPayload>({
      query: (body) => ({
        url: `complaint`,
        body,
        method: "POST",
      }),
      invalidatesTags: [
        "ComplaintCreate",
        "ComplaintGetDataById",
        "ComplaintGetDataForManager",
      ],
    }),

    ComplaintUpdate: build.mutation<
      IComplaint,
      { id: string; body: AddComplaintPayload | FormData }
    >({
      query: ({ body, id }) => ({
        url: `complaint/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: [
        "ComplaintUpdate",
        "ComplaintGetDataById",
        "ComplaintGetDataForManager",
      ],
    }),

    ComplaintRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `complaint/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "ComplaintRemove",
        "ComplaintGetDataById",
        "ComplaintGetDataForManager",
      ],
    }),
  }),
});
export const {
  useComplaintGetDataForManagerQuery,
  useLazyComplaintGetDataForManagerQuery,
  useComplaintGetDataByIdQuery,
  useLazyComplaintGetDataByIdQuery,
  useComplaintCreateMutation,
  useComplaintRemoveMutation,
  useComplaintUpdateMutation,
} = Complaint;
