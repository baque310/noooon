import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface ILessons {
  id: string
  title: string
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
        name: string
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
    from: number
    to: number
  }
  LessonAttachment: [
    {
      id: string
      url: string
      createdAt: string
      updatedAt: string
      lessonId: string
    },
    {
      id: string
      url: string
      createdAt: string
      updatedAt: string
      lessonId: string
    }
  ]
}

export interface AddLessonsPayload {
  title: string
  url: string | null
}


export const Lessons = api.injectEndpoints({
  endpoints: (build) => ({
    LessonsGetData: build.query<BaseGetDataResponse<ILessons>, GetDataRequestParams>({
      query: (params) => ({
        url: `admin/lessons`,
        params,
        method: "GET",
      }),
      // providesTags: ["LessonsGetData"],

    }),

    LessonsGetDataById: build.query<ILessons, { id: string }>({
      query: ({ id }) => ({
        url: `admin/lessons/${id}`,
        method: "GET",
      }),
      // providesTags: ["LessonsGetDataById"],
      transformResponse: (response: ILessons) => {
        if (response?.LessonAttachment && response?.LessonAttachment?.length > 0) {
          response.LessonAttachment.map(attachment => {
            attachment.url = BASE_URL + "uploads/" + attachment.url
            return attachment
          })
        }
        return response
      }

    }),



  }),
});
export const {
  useLessonsGetDataQuery,
  useLazyLessonsGetDataQuery,
  useLessonsGetDataByIdQuery,
  useLazyLessonsGetDataByIdQuery
} = Lessons;
