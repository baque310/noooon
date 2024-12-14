import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface IHomeworks {
   
        "id": "3df0d324-4950-4ec6-b68e-9fb2949dbe33",
        "title": "homework1dd",
        "dueDate": "2025-09-15T00:00:00.000Z",
        "content": "content",
        "createdAt": "2024-12-14T00:14:58.952Z",
        "updatedAt": "2024-12-14T00:14:58.952Z",
        "teacherSubjectId": "1c816fd1-b616-46a1-9166-3b8c700f5d69",
        "sectionId": "50875a80-f390-4705-8f73-924cac97b2ab",
        "schoolYearId": "b447b772-7aa6-421a-8473-0f508df9412b",
        "schoolId": "0092eb12-d365-49b9-a662-d437333339cd",
        "teacherSubject": {
          "Teacher": {
            "fullName": "علي محمد احمد "
          },
          "StageSubject": {
            "Stage": {
              "name": "Primary"
            },
            "Subject": {
              "name": "رياضيات الصف الاول الابتدائي"
            }
          }
        },
        "Section": {
          "name": "F"
        },
        "SchoolYear": {
          "from": 2024,
          "to": 2025
        }
      
} 

export interface AddHomeworksPayload {
    title: string 
    url: string | null
}


export const Homeworks = api.injectEndpoints({
    endpoints: (build) => ({
        HomeworksGetData: build.query<BaseGetDataResponse<IHomeworks>, GetDataRequestParams>({
            query: (params) => ({
                url: `admin/homeworks`,
                params,
                method: "GET",
            }),
            providesTags: ["HomeworksGetData"],

        }),

        HomeworksGetDataById: build.query<IHomeworks, { id: string }>({
            query: ({ id }) => ({
                url: `admin/homeworks/${id}`,
                method: "GET",
            }),
            providesTags: ["HomeworksGetDataById"],
            // transformResponse: (response: IHomeworks) => {
            //     if (response.url) {
            //         response.url = BASE_URL + "uploads/" + response.url
            //     }
            //     return response
            // }

        }),

        HomeworksCreate: build.mutation<IHomeworks, AddHomeworksPayload | FormData >({
            query: (body) => ({
                url: `admin/homeworks`,
                body,
                method: "POST",
            }),
            invalidatesTags: ["HomeworksCreate", "HomeworksGetDataById", "HomeworksGetData"],
        }),

        HomeworksUpdate: build.mutation<IHomeworks, { id: string, body: AddHomeworksPayload | FormData }>({
            query: ({ body, id }) => ({
                url: `admin/homeworks/${id}`,
                body,
                method: "PATCH",
            }),
            invalidatesTags: ["HomeworksUpdate", "HomeworksGetDataById", "HomeworksGetData"],
        }),

        HomeworksRemove: build.mutation<void, { id: string }>({
            query: ({ id }) => ({
                url: `admin/homeworks/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["HomeworksRemove", "HomeworksGetDataById", "HomeworksGetData"],
        }), 

    }),
});
export const {
    useHomeworksGetDataQuery,
    useLazyHomeworksGetDataQuery,
    useHomeworksGetDataByIdQuery,
    useLazyHomeworksGetDataByIdQuery,
    useHomeworksCreateMutation,
    useHomeworksRemoveMutation,
    useHomeworksUpdateMutation, 
} = Homeworks;
