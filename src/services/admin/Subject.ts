import { api } from "@/services/api";
import { GetDataRequestParams } from "../types/BaseType";

export interface ISubject {
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

export interface AddSubjectPayload {
    name: string
}


export const Subject = api.injectEndpoints({
    endpoints: (build) => ({
        SubjectGetData: build.query<ISubject[], GetDataRequestParams>({
            query: (params) => ({
                url: `admin/subject`,
                params,
                method: "GET",
            }),
            providesTags: ["SubjectGetData"],

        }),

        SubjectGetDataById: build.query<ISubject, { id: string }>({
            query: ({ id }) => ({
                url: `admin/subject/${id}`,
                method: "GET",
            }),
            providesTags: ["SubjectGetDataById"],
        }),

        SubjectCreate: build.mutation<ISubject, AddSubjectPayload>({
            query: (body) => ({
                url: `admin/subject`,
                body,
                method: "POST",
            }),
            invalidatesTags: ["SubjectCreate", "SubjectGetDataById", "SubjectGetData"],
        }),

        SubjectUpdate: build.mutation<ISubject, { id: string, body: AddSubjectPayload }>({
            query: ({ body, id }) => ({
                url: `admin/subject/${id}`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["SubjectUpdate", "SubjectGetDataById", "SubjectGetData"],
        }),

        SubjectRemove: build.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `admin/subject/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["SubjectRemove", "SubjectGetDataById", "SubjectGetData"],
        }),

    }),
});
export const {
    useSubjectGetDataQuery,
    useLazySubjectGetDataQuery,
    useSubjectGetDataByIdQuery,
    useLazySubjectGetDataByIdQuery,
    useSubjectCreateMutation,
    useSubjectRemoveMutation,
    useSubjectUpdateMutation,
} = Subject;
