import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, Days, GetDataRequestParams } from "../types/BaseType";
import { ISection } from "./section";

export type ISectionSchedule = {
  data: {
    [K in keyof typeof Days]: ISectionScheduleData[];
  };
};

interface ISectionScheduleData {
  id: string;
  teacherSubjectId: string;
  sectionId: string;
  schoolId: string;
  schoolYearId: string;
  scheduleId: string;
  section: ISection;
  Schedule: {
    id: string;
    day: string;
    timeFrom: string;
    timeTo: string;
  };
  teacherSubject: {
    Teacher: {
      id: string;
      fullName: string;
    };
    StageSubject: {
      Subject: {
        id: string;
        name: string;
      };
      Stage: {
        id: string;
        name: string;
      };
    };
  };
  SchoolYear: {
    id: string;
    from: number;
    to: number;
  };
}

export interface AddSectionSchedulePayload {
  SectionSchedules: {
    schoolYearId: string;
    teacherSubjectId: string;
    sectionId: string;
    scheduleId: string;
  }[];
}
export interface UpdateSectionSchedulePayload {
  teacherSubjectId: string;
}

export const SectionSchedule = api.injectEndpoints({
  endpoints: (build) => ({
    SectionScheduleGetData: build.query<ISectionSchedule, GetDataRequestParams & { sectionId: string | undefined }>({
      query: (params) => ({
        url: `admin/sectionSchedule`,
        params,
        method: "GET",
      }),
      providesTags: ["SectionScheduleGetData", "SectionScheduleRemove"],
    }),

    SectionScheduleGetDataById: build.query<ISectionScheduleData, { id: string }>({
      query: ({ id }) => ({
        url: `admin/sectionSchedule/${id}`,
        method: "GET",
      }),
      providesTags: ["SectionScheduleGetDataById"],
    }),

    SectionScheduleCreate: build.mutation<ISectionSchedule, AddSectionSchedulePayload>({
      query: (body) => ({
        url: `admin/sectionSchedule`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["SectionScheduleCreate", "SectionScheduleGetDataById", "SectionScheduleGetData"],
    }),

    SectionScheduleUpdate: build.mutation<ISectionSchedule, { id: string; body: UpdateSectionSchedulePayload }>({
      query: ({ body, id }) => ({
        url: `admin/sectionSchedule/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["SectionScheduleUpdate", "SectionScheduleGetDataById", "SectionScheduleGetData"],
    }),

    SectionScheduleRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `admin/sectionSchedule/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SectionScheduleRemove", "SectionScheduleGetDataById", "SectionScheduleGetData"],
    }),
  }),
});
export const {
  useSectionScheduleGetDataQuery,
  useLazySectionScheduleGetDataQuery,
  useSectionScheduleGetDataByIdQuery,
  useLazySectionScheduleGetDataByIdQuery,
  useSectionScheduleCreateMutation,
  useSectionScheduleRemoveMutation,
  useSectionScheduleUpdateMutation,
} = SectionSchedule;
