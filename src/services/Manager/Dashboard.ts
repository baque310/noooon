import { api } from "@/services/api";

export interface IDashboard {
    teacherCount: number
    studentCount: number
    adminCount: number
    schoolCount: {
        totalCount: number
        hasBanner: number
        hasNotBanner: number
    }
}

export const Dashboard = api.injectEndpoints({
    endpoints: (build) => ({
        DashboardGetData: build.query<IDashboard, void>({
            query: (params) => ({
                url: `manager/dashboard`,
                params,
                method: "GET",
            }),
            // providesTags: ["DashboardGetData"], 
        }),

    }),
});
export const {
    useDashboardGetDataQuery,
    useLazyDashboardGetDataQuery
} = Dashboard;
