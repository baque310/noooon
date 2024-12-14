import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface IHomeworks {
   
        id: string
        title:string
        dueDate:string
        content: string
        createdAt: string
        updatedAt: string
        teacherSubjectId: string
        sectionId: string
        schoolYearId: string
        schoolId: string
        teacherSubject: {
          Teacher: {
            fullName: string
          },
          StageSubject: {
            Stage: {
              name:string
            },
            Subject: {
              name: string
            }
          }
        },
        Section: {
          name: string
        },
        SchoolYear: {
          from:number
          to: number
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

    }),
});
export const {
    useHomeworksGetDataQuery,
    useLazyHomeworksGetDataQuery,
    useHomeworksGetDataByIdQuery,
    useLazyHomeworksGetDataByIdQuery
} = Homeworks;
