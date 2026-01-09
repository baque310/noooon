import { api, BASE_URL } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface IStudent {
  id: string;
  fullName: string;
  birth: string;
  gender?: string;
  enrollmentDate: string;
  address: string;
  email: string;
  phone1: string;
  phone2: string;
  photo: null | string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  schoolId: string;
  schoolBusId: null | string;
  User: {
    id: string;
    username: string;
  };
  Parent: {
    id: string;
    fullName: string;
    phone1: string;
    User: {
      id: string;
      username: string;
    };
  };
  StudentEnrollment: {
    Stage: {
      name: string;
    };
    Class: {
      name: string;
    };
    Section: {
      name: string;
    };
  }[];
}

export interface AddStudentPayload {
  fullName: string;
  phone1: string;
  birth?: string;
  gender?: string;
  enrollmentDate?: string;
  address?: string;
  email?: string;
  phone2?: string;
  photo?: null | string;
}
export interface AddMultiStudentPayload {
  groups: {
    students: {
      fullName: string;
      phone1: string;
    }[];
    parent?: {
      fullName: string;
      phone1: string;
    };
  }[];
}

export interface IStudentMultipleForExcel {
  success: IStudent[];
  errors: {
    index: number;
    student: IStudent;
    error: string;
  }[];
  totalProcessed: number;
  successCount: number;
  errorCount: number;
}

export const Student = api.injectEndpoints({
  endpoints: (build) => ({
    StudentGetData: build.query<BaseGetDataResponse<IStudent>, GetDataRequestParams>({
      query: (params) => ({
        url: `admin/student`,
        params,
        method: "GET",
      }),
      providesTags: ["StudentGetData"],
      transformResponse: (response: BaseGetDataResponse<IStudent>) => {
        if (response.data.length > 0) {
          response.data.map((data) => {
            if (data.photo) {
              data.photo = BASE_URL + "uploads/" + data.photo;
            }
            return data;
          });
        }
        return response;
      },
    }),
    StudentGetDataHasNoEnrollment: build.query<BaseGetDataResponse<IStudent>, GetDataRequestParams>({
      query: (params) => ({
        url: `admin/student/has-no-enrollment`,
        params,
        method: "GET",
      }),
      providesTags: ["StudentGetDataHasNoEnrollment"],
      transformResponse: (response: BaseGetDataResponse<IStudent>) => {
        if (response.data.length > 0) {
          response.data.map((data) => {
            if (data.photo) {
              data.photo = BASE_URL + "uploads/" + data.photo;
            }
            return data;
          });
        }
        return response;
      },
    }),

    StudentGetDataById: build.query<IStudent, { id: string }>({
      query: ({ id }) => ({
        url: `admin/student/${id}`,
        method: "GET",
      }),
      providesTags: ["StudentGetDataById"],
      transformResponse: (response: IStudent) => {
        if (response.photo) {
          response.photo = BASE_URL + "uploads/" + response.photo;
        }
        return response;
      },
    }),

    StudentCreate: build.mutation<IStudent, AddStudentPayload>({
      query: (body) => ({
        url: `admin/student`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["StudentCreate", "StudentGetDataById", "StudentGetData"],
    }),
    StudentCreateMulti: build.mutation<IStudent, AddMultiStudentPayload>({
      query: (body) => ({
        url: `admin/student/multiStudents`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["StudentCreateMulti", "StudentGetDataById", "StudentGetData"],
    }),
    StudentMultiStudentsForExcel: build.mutation<
      IStudentMultipleForExcel,
      {
        students: AddMultiStudentPayload[];
      }
    >({
      query: (body) => ({
        url: `admin/student/multiStudentsForExcel`,
        body,
        method: "POST",
      }),
      invalidatesTags: ["StudentMultiStudentsForExcel", "StudentGetDataById", "StudentGetData"],
    }),
    StudentConnectParent: build.mutation<
      IStudent,
      {
        studentId: string;
        parentId: string;
      }
    >({
      query: ({ studentId, parentId }) => ({
        url: `admin/student/${studentId}/connect-parent/${parentId}`,

        method: "PATCH",
      }),
      invalidatesTags: ["StudentConnectParent", "StudentGetDataById", "StudentGetData"],
    }),
    StudentDisconnectParent: build.mutation<
      IStudent,
      {
        studentId: string;
      }
    >({
      query: ({ studentId }) => ({
        url: `admin/student/${studentId}/disconnect-parent`,

        method: "PATCH",
      }),
      invalidatesTags: ["StudentDisconnectParent", "StudentGetDataById", "StudentGetData"],
    }),
    StudentUpdate: build.mutation<IStudent, { id: string; body: AddStudentPayload | FormData }>({
      query: ({ body, id }) => ({
        url: `admin/student/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["StudentUpdate", "StudentGetDataById", "StudentGetData"],
    }),

    StudentRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `admin/student/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StudentRemove", "StudentGetDataById", "StudentGetData"],
    }),
  }),
});
export const {
  useStudentGetDataQuery,
  useLazyStudentGetDataQuery,
  useStudentGetDataByIdQuery,
  useLazyStudentGetDataByIdQuery,
  useStudentCreateMutation,
  useStudentRemoveMutation,
  useStudentUpdateMutation,
  useStudentCreateMultiMutation,
  useStudentConnectParentMutation,
  useStudentDisconnectParentMutation,
  useStudentMultiStudentsForExcelMutation,
  useStudentGetDataHasNoEnrollmentQuery,
  useLazyStudentGetDataHasNoEnrollmentQuery,
} = Student;
