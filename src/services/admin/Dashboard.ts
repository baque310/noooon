import { api } from "@/services/api";

export interface IDashboard {
  teacherCount: number;
  studentCount: number;
  adminCount: number;
  busCount: number;
  attendanceCounts: {
    today: {
      Present: number;
      Absent: number;
      Vacation: number;
    };
    week: {
      Present: number;
      Absent: number;
      Vacation: number;
    };
    month: {
      Present: number;
      Absent: number;
      Vacation: number;
    };
  };
  passFailRates: {
    examTypeName: string;
    totalStudents: number;
    passingCount: number;
    failingCount: number;
    passRate: number;
    failRate: number;
  }[];
}

export const Dashboard = api.injectEndpoints({
  endpoints: (build) => ({
    DashboardGetData: build.query<IDashboard, void>({
      query: (params) => ({
        url: `admin/dashboard`,
        params,
        method: "GET",
      }),
      // providesTags: ["DashboardGetData"],
    }),
    ///counter/forAdmin/count
    GetAdminCount: build.query<
      {
        complaintsCount: number;
        homeworkCountToday: number;
        lessonsCountToday: number;
        attendanceToday: {
          Present: number;
          Absent: number;
          Vacation: number;
        };
      },
      void
    >({
      query: () => ({
        url: `counter/forAdmin/count`,
        method: "GET",
      }),
    }),
  }),
});
export const {
  useDashboardGetDataQuery,
  useLazyDashboardGetDataQuery,
  useGetAdminCountQuery,
  useLazyGetAdminCountQuery,
} = Dashboard;
