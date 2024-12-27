import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";



export interface ITeacher {
    id: string
    fullName: string
    birth: string
    Gender: Gender
    hiringDate: string
    address: string
    email: string
    phone1: string
    phone2: string
    photo: null | string
    createdAt: string
    updatedAt: string
    userId: string
    schoolId: string
    schoolBusId: null | string
    User: {
        id: string
        username: string
    }

}




export interface AddTeacherPayload {
    fullName: string
    phone1: string
    birth?: string
    hiringDate?: string
    address?: string
    email?: string
    phone2?: string
    photo?: null | string
    Gender: Gender
}

export type Gender = "Male" | "Female"


export const Teacher = api.injectEndpoints({
    endpoints: (build) => ({
        TeacherGetData: build.query<BaseGetDataResponse<ITeacher>, GetDataRequestParams>({
            query: (params) => ({
                url: `admin/teacher`,
                params,
                method: "GET",
            }),
            providesTags: ["TeacherGetData"],
            transformResponse: (response: BaseGetDataResponse<ITeacher>) => {
                if (response.data.length > 0) {
                    response.data.map((data) => {
                        if (data.photo) {
                            data.photo = BASE_URL + "uploads/" + data.photo
                        }
                        return data
                    })
                }
                return response
            }

        }),

        TeacherGetDataById: build.query<ITeacher, { id: string }>({
            query: ({ id }) => ({
                url: `admin/teacher/${id}`,
                method: "GET",
            }),
            providesTags: ["TeacherGetDataById"],
            transformResponse: (response: ITeacher) => {
                if (response.photo) {
                    response.photo = BASE_URL + "uploads/" + response.photo
                }
                return response
            }

        }),

        TeacherCreate: build.mutation<ITeacher, AddTeacherPayload>({
            query: (body) => ({
                url: `admin/teacher`,
                body,
                method: "POST",
            }),
            invalidatesTags: ["TeacherCreate", "TeacherGetDataById", "TeacherGetData"],
        }),

        TeacherUpdate: build.mutation<ITeacher, { id: string, body: AddTeacherPayload | FormData }>({
            query: ({ body, id }) => ({
                url: `admin/teacher/${id}`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["TeacherUpdate", "TeacherGetDataById", "TeacherGetData"],
        }),

        TeacherRemove: build.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `admin/teacher/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["TeacherRemove", "TeacherGetDataById", "TeacherGetData"],
        }),



    }),
});
export const {
    useTeacherGetDataQuery,
    useLazyTeacherGetDataQuery,
    useTeacherGetDataByIdQuery,
    useLazyTeacherGetDataByIdQuery,
    useTeacherCreateMutation,
    useTeacherRemoveMutation,
    useTeacherUpdateMutation,

} = Teacher;
