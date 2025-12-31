import { api } from "@/services/api";
import { User } from "next-auth";
import { BaseGetDataResponse, GetDataRequestParams } from "./types/BaseType";

export interface NotificationDataResponse extends User {}

export interface INotification {
  id: string;
  title: string;
  body: string;
  isSeen: string;
  createdAt: string;
  updatedAt: string;
  adminId: string;
}

export interface NotificationToAll {
  title: string;
  body: string;
  imageUrl?: string | null;
  data?: {
    [key: string]: string | null;
  };
  userIds?: string[];
  isAlert?: "TRUE" | "FALSE";
  image?: string; // image only for report optional in form data
}

export const Notification = api.injectEndpoints({
  endpoints: (build) => ({
    //    For Admin
    NotificationGetDataForAdmin: build.query<BaseGetDataResponse<INotification>, GetDataRequestParams>({
      query: (params) => ({
        url: `notification/forAdmin/all`,
        params,
        method: "GET",
      }),
      providesTags: ["NotificationGetDataForAdmin"],
    }),

    NotificationChangeStatusForAdmin: build.mutation<INotification, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `notification/forAdmin/${id}/${status}`,
        method: "PATCH",
      }),
      invalidatesTags: ["NotificationGetDataForAdmin", "NotificationChangeStatusForAdmin"],
    }),

    NotificationSendToAllForManager: build.mutation<any, NotificationToAll>({
      query: (body) => ({
        url: "/notification/forManager/sendToAll",
        method: "POST",
        body,
      }),
      invalidatesTags: ["NotificationSendToAllForManager"],
    }),
    NotificationSendToAllForAdmin: build.mutation<any, NotificationToAll>({
      query: (body) => ({
        url: "notification/forAdmin/sendToAll",
        method: "POST",
        body,
      }),
      invalidatesTags: ["NotificationSendToAllForAdmin", "NotificationGetDataForAdmin"],
    }),
    NotificationSendForManyAllForAdmin: build.mutation<any, NotificationToAll>({
      query: (body) => ({
        url: "notification/forAdmin/sendForMany",
        method: "POST",
        body,
      }),
      invalidatesTags: ["NotificationSendForManyAllForAdmin", "NotificationGetDataForAdmin"],
    }),
    NotificationSendToAllForAdminReport: build.mutation<any, NotificationToAll | FormData>({
      query: (body) => ({
        url: "notification/report/forAdmin/sendToAll",
        method: "POST",
        body,
      }),
      invalidatesTags: ["NotificationSendToAllForAdmin", "NotificationGetDataForAdmin"],
    }),
    NotificationSendForManyAllForAdminReport: build.mutation<any, NotificationToAll | FormData>({
      query: (body) => ({
        url: "notification/report/forAdmin/sendForMany",
        method: "POST",
        body,
      }),
      invalidatesTags: ["NotificationSendForManyAllForAdmin", "NotificationGetDataForAdmin"],
    }),
  }),
});
export const {
  useNotificationGetDataForAdminQuery,
  useLazyNotificationGetDataForAdminQuery,
  useNotificationChangeStatusForAdminMutation,
  useNotificationSendToAllForManagerMutation,
  useNotificationSendToAllForAdminMutation,
  useNotificationSendForManyAllForAdminMutation,
  useNotificationSendToAllForAdminReportMutation,
  useNotificationSendForManyAllForAdminReportMutation,
} = Notification;
