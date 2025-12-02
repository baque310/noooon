import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";
export interface IComplaint {
  id: string;
  title: string;
  description: string;
  approval_status: string; // TODO: Change to enum
  reason: null | string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  ComplAttachment: {
    id: string;
    url: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    complaintId: string;
  }[];
  user: {
    id: string;
    username: string;
    Student: {
      id: string;
      fullName: string;
      grade: string;
      section: string;
    } | null;
    Parent: {
      id: string;
      fullName: string;
    } | null;
    School: {
      id: string;
      name: string;
    };
  };
}

export interface ComplaintChangeStatusPayload {
  id: string;
  status: string;
  reason: string;
}
export const Complaint = api.injectEndpoints({
  endpoints: (build) => ({
    ComplaintGetDataForManager: build.query<BaseGetDataResponse<IComplaint>, GetDataRequestParams>({
      query: (params) => ({
        url: `complaint/forManager`,
        params,
        method: "GET",
      }),
      providesTags: ["ComplaintGetDataForManager"],
      transformResponse: (response: BaseGetDataResponse<IComplaint>) => {
        response.data.forEach((complaint) => {
          if (complaint.ComplAttachment.length > 0) {
            complaint.ComplAttachment.forEach((attachment) => {
              attachment.url = BASE_URL + "uploads/" + attachment.url;
            });
          }
        });
        return response;
      },
    }),
    ComplaintGetDataForAdmin: build.query<BaseGetDataResponse<IComplaint>, GetDataRequestParams>({
      query: (params) => ({
        url: `complaint/forAdmin`,
        params,
        method: "GET",
      }),
      providesTags: ["ComplaintGetDataForAdmin"],
      transformResponse: (response: BaseGetDataResponse<IComplaint>) => {
        response.data.forEach((complaint) => {
          if (complaint.ComplAttachment.length > 0) {
            complaint.ComplAttachment.forEach((attachment) => {
              attachment.url = BASE_URL + "uploads/" + attachment.url;
            });
          }
        });
        return response;
      },
    }),

    ComplaintGetDataById: build.query<IComplaint, { id: string }>({
      query: ({ id }) => ({
        url: `complaint/forAdmin/${id}`,
        method: "GET",
      }),
      providesTags: ["ComplaintGetDataById"],
      transformResponse: (response: IComplaint) => {
        if (response.ComplAttachment.length > 0) {
          response.ComplAttachment.forEach((attachment) => {
            attachment.url = BASE_URL + "uploads/" + attachment.url;
          });
        }
        return response;
      },
    }),

    ComplaintChangeStatus: build.mutation<void, ComplaintChangeStatusPayload>({
      query: ({ id, status, reason }) => ({
        url: `complaint/forAdmin/${id}/${status}`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["ComplaintChangeStatus", "ComplaintGetDataForAdmin"],
    }),
    ComplaintRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `complaint/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ComplaintRemove", "ComplaintGetDataById"],
    }),
  }),
});
export const {
  useComplaintGetDataForManagerQuery,
  useLazyComplaintGetDataForManagerQuery,
  useComplaintGetDataForAdminQuery,
  useLazyComplaintGetDataForAdminQuery,
  useComplaintGetDataByIdQuery,
  useLazyComplaintGetDataByIdQuery,
  useComplaintChangeStatusMutation,
  useComplaintRemoveMutation,
} = Complaint;
