import { api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";
import { IClass } from "./class";
import { IStage } from "./stage";
import { ISection } from "./section";
import { IStudent } from "./student";



export interface IStudentEnrollment {
    id: string
    createdAt: string
    updatedAt: string
    studentId: string
    schoolId: string
    stageId: string
    classId: string
    sectionId: string
    schoolYearId: string
    SchoolYear: {
        id: string
        from: number
        to: number
    },
    Stage: IStage
    Class: IClass
    Section: ISection
    Student: IStudent
}

export interface GetStudentDataRequestParams extends GetDataRequestParams {
    schoolYearId?: string
    stageId?: string
    classId?: string
    sectionId?: string
}




export interface AddStudentEnrollmentPayload {
    schoolYearId: string
    stageId: string
    classId: string
    sectionId: string
    studentIds: string[]
}
export interface UpdateStudentEnrollmentPayload {
    schoolYearId: string
    stageId: string
    classId: string
    sectionId: string
    studentEnrollmentIds: string[]
}



export const StudentEnrollment = api.injectEndpoints({
    endpoints: (build) => ({
        StudentEnrollmentGetData: build.query<BaseGetDataResponse<IStudentEnrollment>, GetDataRequestParams>({
            query: (params) => ({
                url: `admin/student-enrollment`,
                params,
                method: "GET",
            }),
            providesTags: ["StudentEnrollmentGetData"],

        }),

        StudentEnrollmentGetDataById: build.query<IStudentEnrollment, { id: string }>({
            query: ({ id }) => ({
                url: `admin/student-enrollment/${id}`,
                method: "GET",
            }),
            providesTags: ["StudentEnrollmentGetDataById"],
        }),

        StudentEnrollmentCreate: build.mutation<IStudentEnrollment, AddStudentEnrollmentPayload>({
            query: (body) => ({
                url: `admin/student-enrollment`,
                body,
                method: "POST",
            }),
            invalidatesTags: ["StudentEnrollmentCreate", "StudentEnrollmentGetDataById", "StudentEnrollmentGetData"],
        }),

        StudentEnrollmentUpdate: build.mutation<IStudentEnrollment, UpdateStudentEnrollmentPayload>({
            query: (  body ) => ({
                url: `admin/student-enrollment/{id}`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["StudentEnrollmentUpdate", "StudentEnrollmentGetDataById", "StudentEnrollmentGetData"],
        }),

        StudentEnrollmentRemove: build.mutation<void, { studentEnrollmentIds: string[] }>({
            query: (body) => ({
                url: `admin/student-enrollment/{id}`,
                method: "DELETE",
                body
            }),
            invalidatesTags: ["StudentEnrollmentRemove", "StudentEnrollmentGetDataById", "StudentEnrollmentGetData"],
        }),



    }),
});
export const {
    useStudentEnrollmentGetDataQuery,
    useLazyStudentEnrollmentGetDataQuery,
    useStudentEnrollmentGetDataByIdQuery,
    useLazyStudentEnrollmentGetDataByIdQuery,
    useStudentEnrollmentCreateMutation,
    useStudentEnrollmentRemoveMutation,
    useStudentEnrollmentUpdateMutation
} = StudentEnrollment;
