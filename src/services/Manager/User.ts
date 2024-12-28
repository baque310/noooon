import { api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface IUser {

    id: string
    username: string
    isActive: string
    isDeleted: string
    School: {
        id: string
        name: string
        address: string
        email: string
        phone1: string
        phone2: string
        hasBanner: string
        isActive: string
        createdAt: string
        updatedAt: string
    },
    createdAt: string
    updatedAt: string

}

export const User = api.injectEndpoints({
    endpoints: (build) => ({
        UserGetData: build.query<BaseGetDataResponse<IUser>, GetDataRequestParams>({
            query: (params) => ({
                url: `user/forManager`,
                params,
                method: "GET",
            }),
            // providesTags: ["UserGetData"], 
        }),

    }),
});
export const {
    useUserGetDataQuery,
    useLazyUserGetDataQuery
} = User;
