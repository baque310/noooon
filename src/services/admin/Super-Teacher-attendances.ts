import { api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface ISuperTeacherAttendances {
  id: string;
  date: string;
  Status: string;
  createdAt: string;
  updatedAt: string;
  studentEnrollmentId: string;
  sectionScheduleId: string;
  schoolYearId: string;
  schoolId: string;
  SectionSchedule: {
    id: string;
    section: {
      id: string;
      name: string;
    };
    Schedule: {
      id: string;
      day: string;
      timeFrom: string;
      timeTo: string;
    };
  };
  StudentEnrollment: {
    id: string;
    Student: {
      id: string;
      fullName: string;
      photo: string | null;
    };
    Section: {
      name: string;
      Class: {
        name: string;
        Stage: {
          name: string;
        };
      };
    };
  };
  SchoolYear: {
    id: string;
    from: number;
    to: number;
  };
}

export interface AddSuperTeacherAttendancesPayload {
  attendanceRecords: {
    date: string;
    Status: "Present" | "Absent" | "Vacation";
    studentEnrollmentId: string;
    sectionScheduleId: string[];
  }[];
}
export interface AddSuperTeacherAttendancesUpdatePayload {
  Status: "Present" | "Absent" | "Vacation";
}

export const SuperTeacherAttendances = api.injectEndpoints({
  endpoints: (build) => ({
    SuperTeacherAttendancesGetData: build.query<BaseGetDataResponse<ISuperTeacherAttendances>, GetDataRequestParams>({
      query: (params) => ({
        url: `super/teacher/attendances`,
        params,
        method: "GET",
      }),
      providesTags: ["SuperTeacherAttendancesGetData"],
    }),

    SuperTeacherAttendancesGetDataById: build.query<ISuperTeacherAttendances, { id: string }>({
      query: ({ id }) => ({
        url: `super/teacher/attendances/${id}`,
        method: "GET",
      }),
      providesTags: ["SuperTeacherAttendancesGetDataById"],
    }),

    SuperTeacherAttendancesCreate: build.mutation<ISuperTeacherAttendances, AddSuperTeacherAttendancesPayload>({
      query: (body) => ({
        url: `super/teacher/attendances`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["SuperTeacherAttendancesCreate", "SuperTeacherAttendancesGetDataById", "SuperTeacherAttendancesGetData"],
    }),

    SuperTeacherAttendancesUpdate: build.mutation<ISuperTeacherAttendances, { id: string; body: AddSuperTeacherAttendancesUpdatePayload | FormData }>({
      query: ({ body, id }) => ({
        url: `super/teacher/attendances/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["SuperTeacherAttendancesUpdate", "SuperTeacherAttendancesGetDataById", "SuperTeacherAttendancesGetData"],
    }),

    SuperTeacherAttendancesRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `super/teacher/attendances/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SuperTeacherAttendancesRemove", "SuperTeacherAttendancesGetDataById", "SuperTeacherAttendancesGetData"],
    }),
  }),
});
export const {
  useSuperTeacherAttendancesGetDataQuery,
  useLazySuperTeacherAttendancesGetDataQuery,
  useSuperTeacherAttendancesGetDataByIdQuery,
  useLazySuperTeacherAttendancesGetDataByIdQuery,
  useSuperTeacherAttendancesCreateMutation,
  useSuperTeacherAttendancesRemoveMutation,
  useSuperTeacherAttendancesUpdateMutation,
} = SuperTeacherAttendances;
