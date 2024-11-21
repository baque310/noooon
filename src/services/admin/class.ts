import { api } from "@/services/api";
import { User } from "next-auth";
import { GetDataRequestParams } from "../types/BaseType";

export interface ClassDataResponse extends User { }

export interface IClass {
    id: string
    name: string
    createdAt: string
    updatedAt: string
    stageId: string
    Stage: {
        id: string
        name: string
        createdAt: string
        updatedAt: string
        schoolId: string
    },
    Section: {
        id: string
        name: string
        isActive: string
        createdAt: string
        updatedAt: string
        classId: string
    }[]
}




export interface AddClassPayload {
    name: string
    stageId: string
}
export interface UpdateClassPayload {
    name: string
}









export const Class = api.injectEndpoints({
    endpoints: (build) => ({
        ClassGetData: build.query<IClass[], GetDataRequestParams>({
            query: (params) => ({
                url: `admin/class`,
                params,
                method: "GET",
            }),
            providesTags: ["ClassGetData"],

        }),

        ClassGetDataById: build.query<IClass, { id: string }>({
            query: ({ id }) => ({
                url: `admin/class/${id}`,
                method: "GET",
            }),
            providesTags: ["ClassGetDataById"],

        }),

        ClassCreate: build.mutation<ClassDataResponse, AddClassPayload>({
            query: (body) => ({
                url: `admin/class`,
                body,
                method: "POST",
            }),
            invalidatesTags: ["ClassCreate", "ClassGetDataById", "ClassGetData"],
        }),
        ClassUpdate: build.mutation<ClassDataResponse, { id: string, body: UpdateClassPayload }>({
            query: ({ body, id }) => ({
                url: `admin/class/${id}`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["ClassUpdate", "ClassGetDataById", "ClassGetData"],
        }),

        ClassRemove: build.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `admin/class/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ClassRemove", "ClassGetDataById", "ClassGetData"],
        }),



    }),
});
export const {
    useClassGetDataQuery,
    useLazyClassGetDataQuery,
    useClassGetDataByIdQuery,
    useLazyClassGetDataByIdQuery,
    useClassCreateMutation,
    useClassRemoveMutation,
    useClassUpdateMutation,

} = Class;
