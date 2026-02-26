import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";
import { IStudent } from "./student";

export interface IBus {
    id: string
    fullName: string
    carType?: string
    carColor?: string
    carNumber?: string
    address: string
    phone1: string
    phone2: string
    photo: null | string
    createdAt: string
    updatedAt: string
    Student: IStudent[]
}


export interface AddBusPayload {
    fullName: string
    phone1: string
    carType: string
    carColor: string
    carNumber: string
    address?: string
    phone2?: string
    photo?: null | string
}

export interface BusConnectStudentBusPayload {
    busId: string
    studentIds: string[]
}


export const Bus = api.injectEndpoints({
    endpoints: (build) => ({
        BusGetData: build.query<BaseGetDataResponse<IBus>, GetDataRequestParams>({
            query: (params) => ({
                url: `admin/bus`,
                params,
                method: "GET",
            }),
            providesTags: ["BusGetData"],
            transformResponse: (response: BaseGetDataResponse<IBus>) => {
                if (response.data.length > 0) {
                    response.data.map((data) => {
                        if (data.photo) {
                            data.photo = BASE_URL + "uploads/" + data.photo
                        }
                        if (data.Student.length > 0) {
                            data.Student.map((student) => {
                                if (student.photo) {
                                    student.photo = BASE_URL + "uploads/" + student.photo
                                }
                            })
                        }
                        return data
                    })
                }
                return response
            }

        }),

        BusGetDataById: build.query<IBus, { id: string }>({
            query: ({ id }) => ({
                url: `admin/bus/${id}`,
                method: "GET",
            }),
            providesTags: ["BusGetDataById"],
            transformResponse: (response: IBus) => {
                if (response.photo) {
                    response.photo = BASE_URL + "uploads/" + response.photo
                }
                return response
            }

        }),

        BusCreate: build.mutation<IBus, AddBusPayload | FormData>({
            query: (body) => ({
                url: `admin/bus`,
                body,
                method: "POST",
            }),
            invalidatesTags: ["BusCreate", "BusGetDataById", "BusGetData"],
        }),

        BusUpdate: build.mutation<IBus, { id: string, body: AddBusPayload | FormData }>({
            query: ({ body, id }) => ({
                url: `admin/bus/${id}`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["BusUpdate", "BusGetDataById", "BusGetData"],
        }),
        BusConnectStudentBus: build.mutation<IBus, BusConnectStudentBusPayload>({
            query: (body) => ({
                url: `admin/bus/connectStudentBus`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["BusConnectStudentBus", "BusGetDataById", "BusGetData"],
        }),
        BusDisconnectStudentBus: build.mutation<IBus, BusConnectStudentBusPayload>({
            query: (body) => ({
                url: `admin/bus/disconnectStudentBus`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["BusDisconnectStudentBus", "BusGetDataById", "BusGetData"],
        }),

        BusRemove: build.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `admin/bus/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["BusRemove", "BusGetDataById", "BusGetData"],
        }),



    }),
});
export const {
    useBusGetDataQuery,
    useLazyBusGetDataQuery,
    useBusGetDataByIdQuery,
    useLazyBusGetDataByIdQuery,
    useBusCreateMutation,
    useBusRemoveMutation,
    useBusUpdateMutation,
    useBusConnectStudentBusMutation,
    useBusDisconnectStudentBusMutation,
} = Bus;
