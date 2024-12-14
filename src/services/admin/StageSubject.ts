import { api } from "@/services/api";
import { GetDataRequestParams } from "../types/BaseType";

export interface IStageSubject {
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
}

export interface AddStageSubjectPayload {
    stageId: string
    classId: string
    subjectId: string
}

export interface GetStageSubjectDataRequestParams extends GetDataRequestParams {
    stageId?: string
    classId?: string
    StageType?: string

}


export const StageSubject = api.injectEndpoints({
    endpoints: (build) => ({
        StageSubjectGetData: build.query<IStageSubject[], GetStageSubjectDataRequestParams>({
            query: (params) => ({
                url: `admin/stage-subject`,
                params,
                method: "GET",
            }),
            providesTags: ["StageSubjectGetData"],

        }),

        StageSubjectGetDataById: build.query<IStageSubject, { id: string }>({
            query: ({ id }) => ({
                url: `admin/stage-subject/${id}`,
                method: "GET",
            }),
            providesTags: ["StageSubjectGetDataById"],
        }),

        StageSubjectCreate: build.mutation<IStageSubject, AddStageSubjectPayload>({
            query: (body) => ({
                url: `admin/stage-subject`,
                body,
                method: "POST",
            }),
            invalidatesTags: ["StageSubjectCreate", "StageSubjectGetDataById", "StageSubjectGetData"],
        }),

        StageSubjectUpdate: build.mutation<IStageSubject, { id: string, body: AddStageSubjectPayload }>({
            query: ({ body, id }) => ({
                url: `admin/stage-subject/${id}`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["StageSubjectUpdate", "StageSubjectGetDataById", "StageSubjectGetData"],
        }),

        StageSubjectRemove: build.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `admin/stage-subject/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["StageSubjectRemove", "StageSubjectGetDataById", "StageSubjectGetData"],
        }),

    }),
});
export const {
    useStageSubjectGetDataQuery,
    useLazyStageSubjectGetDataQuery,
    useStageSubjectGetDataByIdQuery,
    useLazyStageSubjectGetDataByIdQuery,
    useStageSubjectCreateMutation,
    useStageSubjectRemoveMutation,
    useStageSubjectUpdateMutation,
} = StageSubject;
