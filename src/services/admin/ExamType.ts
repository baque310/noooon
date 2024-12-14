import { api } from "@/services/api";
import { GetDataRequestParams } from "../types/BaseType";

export interface IExamType {
    id: string
    name: string
    createdAt: string
    updatedAt: string
    schoolId: string
    School: {
        id: string
        name: string
    }
}

export interface AddExamTypePayload {
    name: string
}


export const ExamType = api.injectEndpoints({
    endpoints: (build) => ({
        ExamTypeGetData: build.query<IExamType[], GetDataRequestParams>({
            query: (params) => ({
                url: `admin/examType`,
                params,
                method: "GET",
            }),
            providesTags: ["ExamTypeGetData"],

        }),

        ExamTypeGetDataById: build.query<IExamType, { id: string }>({
            query: ({ id }) => ({
                url: `admin/examType/${id}`,
                method: "GET",
            }),
            providesTags: ["ExamTypeGetDataById"],
        }),

        ExamTypeCreate: build.mutation<IExamType, AddExamTypePayload>({
            query: (body) => ({
                url: `admin/examType`,
                body,
                method: "POST",
            }),
            invalidatesTags: ["ExamTypeCreate", "ExamTypeGetDataById", "ExamTypeGetData"],
        }),

        ExamTypeUpdate: build.mutation<IExamType, { id: string, body: AddExamTypePayload }>({
            query: ({ body, id }) => ({
                url: `admin/examType/${id}`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["ExamTypeUpdate", "ExamTypeGetDataById", "ExamTypeGetData"],
        }),

        ExamTypeRemove: build.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `admin/examType/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ExamTypeRemove", "ExamTypeGetDataById", "ExamTypeGetData"],
        }),

    }),
});
export const {
    useExamTypeGetDataQuery,
    useLazyExamTypeGetDataQuery,
    useExamTypeGetDataByIdQuery,
    useLazyExamTypeGetDataByIdQuery,
    useExamTypeCreateMutation,
    useExamTypeRemoveMutation,
    useExamTypeUpdateMutation,
} = ExamType;
