import { api } from "@/services/api";
import { GetDataRequestParams } from "../types/BaseType";
import { ITeacher } from "./teacher";

export interface ITeacherSubject {

    id: string
    createdAt: string
    updatedAt: string
    teacherId: string
    stageSubjectId: string
    schoolYearId: string
    StageSubject: {
        id: string
        createdAt: string
        updatedAt: string
        stageId: string
        subjectId: string
        classId: string
        Stage: {
            id: string
            name: string
            createdAt: string
            updatedAt: string
            schoolId: string
        },
        Class: {
            id: string
            name: string
            createdAt: string
            updatedAt: string
            stageId: string
        },
        Subject: {
            id: string
            name: string
            createdAt: string
            updatedAt: string
            schoolId: string
        }
    },
    Teacher: ITeacher
}

export interface AddTeacherSubjectPayload {
    teacherId: string
    stageSubjectId: string
    schoolYearId: string
}

export interface GetTeacherSubjectDataRequestParams extends GetDataRequestParams {
    classId?: string
    stageId?: string
    teacherId?: string
    schoolYearId?: string
}


export const TeacherSubject = api.injectEndpoints({
    endpoints: (build) => ({
        TeacherSubjectGetData: build.query<ITeacherSubject[], GetTeacherSubjectDataRequestParams>({
            query: (params) => ({
                url: `admin/teacher-subject`,
                params,
                method: "GET",
            }),
            providesTags: ["TeacherSubjectGetData"],

        }),

        TeacherSubjectGetDataById: build.query<ITeacherSubject, { id: string }>({
            query: ({ id }) => ({
                url: `admin/teacher-subject/${id}`,
                method: "GET",
            }),
            providesTags: ["TeacherSubjectGetDataById"],
        }),

        TeacherSubjectCreate: build.mutation<ITeacherSubject, AddTeacherSubjectPayload>({
            query: (body) => ({
                url: `admin/teacher-subject`,
                body,
                method: "POST",
            }),
            invalidatesTags: ["TeacherSubjectCreate", "TeacherSubjectGetDataById", "TeacherSubjectGetData"],
        }),

        TeacherSubjectUpdate: build.mutation<ITeacherSubject, { id: string, body: AddTeacherSubjectPayload }>({
            query: ({ body, id }) => ({
                url: `admin/teacher-subject/${id}`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["TeacherSubjectUpdate", "TeacherSubjectGetDataById", "TeacherSubjectGetData"],
        }),

        TeacherSubjectRemove: build.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `admin/teacher-subject/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["TeacherSubjectRemove", "TeacherSubjectGetDataById", "TeacherSubjectGetData"],
        }),

    }),
});
export const {
    useTeacherSubjectGetDataQuery,
    useLazyTeacherSubjectGetDataQuery,
    useTeacherSubjectGetDataByIdQuery,
    useLazyTeacherSubjectGetDataByIdQuery,
    useTeacherSubjectCreateMutation,
    useTeacherSubjectRemoveMutation,
    useTeacherSubjectUpdateMutation,
} = TeacherSubject;
