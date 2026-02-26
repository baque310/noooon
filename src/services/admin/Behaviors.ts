import { api } from "@/services/api";
import { User } from "next-auth";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";
import { IBehaviorSection } from "./BehaviorSection";
import { IBehaviorType } from "./BehaviorType";

type UpdateBehaviorsPayload = {
  notes: string;
  fromDate: string;
  toDate: string;
  items: BehaviorItem[];
};

export interface AddBehaviorsPayload {
  teacherSubjectId: string;
  fromDate: string;
  toDate: string;
  students: IBehaviors[];
  notes?: string;
}

export interface IBehaviors {
  studentEnrollmentId: string;
  teacherSubjectId: string;
  notes?: string;
  items: BehaviorItem[];
}

export interface BehaviorItem {
  behaviorSectionId: string;
  behaviorTypeId: string;
}

export interface IBehaviorEvaluationItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  behaviorWeeklyEvaluationId: string;
  behaviorSectionId: string;
  behaviorTypeId: string;
  BehaviorSection: IBehaviorSection;
  BehaviorType: IBehaviorType;
}

export interface IBehaviorReport {
  id: string;
  subjectName: string;
  teacherName: string;
  studentName: string;
  fromDate: string;
  toDate: string;
  className: string;
  sectionName: string;
  teacherSubjectId: string;
  studentEnrollmentId: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  evaluationItems: IBehaviorEvaluationItem[];
}

export interface BehaviorsDataResponse extends User {}
export interface BehaviorGetDataRequestParams extends GetDataRequestParams {
  teacherSubjectId?: string;
  studentEnrollmentId?: string;
}

export const Behaviors = api.injectEndpoints({
  endpoints: (build) => ({
    BehaviorsGetData: build.query<BaseGetDataResponse<IBehaviorReport>, BehaviorGetDataRequestParams>({
      query: (params) => ({
        url: `admin/Behaviors`,
        params,
        method: "GET",
      }),
      providesTags: ["BehaviorsGetData"],
    }),

    BehaviorsGetDataById: build.query<IBehaviors, { id: string }>({
      query: ({ id }) => ({
        url: `admin/Behaviors/${id}`,
        method: "GET",
      }),
      providesTags: ["BehaviorsGetDataById"],
    }),

    BehaviorsCreate: build.mutation<BehaviorsDataResponse, AddBehaviorsPayload>({
      query: (body) => ({
        url: `admin/Behaviors`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["BehaviorsCreate", "BehaviorsGetDataById", "BehaviorsGetData"],
    }),
    BehaviorsUpdate: build.mutation<BehaviorsDataResponse, { id: string; body: UpdateBehaviorsPayload }>({
      query: ({ body, id }) => ({
        url: `admin/Behaviors/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["BehaviorsUpdate", "BehaviorsGetDataById", "BehaviorsGetData"],
    }),

    BehaviorsRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `admin/Behaviors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BehaviorsRemove", "BehaviorsGetDataById", "BehaviorsGetData"],
    }),
  }),
});
export const {
  useBehaviorsGetDataQuery,
  useLazyBehaviorsGetDataQuery,
  useBehaviorsGetDataByIdQuery,
  useLazyBehaviorsGetDataByIdQuery,
  useBehaviorsCreateMutation,
  useBehaviorsRemoveMutation,
  useBehaviorsUpdateMutation,
} = Behaviors;
