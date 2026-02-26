import { BASE_URL, api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";
import { User } from "next-auth";

export interface AdminDataResponse extends User { }

export interface IAdmin {

  id: string
  username: string
  photo: null | string
  isActive: string
  School: ISchool
  // TODO:  
  RoleType: "SuperAdmin",
  createdAt: string
  updatedAt: string
  schoolId: string

  // TODO:  
  roles: {
    resource: string
    resource_ar: string
    permissions: IPermissions[]
    rolesString?: string[]
    roles?: IPermissions[]
  }[]
}

export interface IPermissions {
  action: "read" | "create" | "update" | "delete"
  possession: "own" | "any"
}[]

export interface ISchool {
  id: string
  name: string
  address: string
  email: string
  phone1: string
  phone2: string
  hasBanner: string
  isActive: string
  createdAt: string
  updatedAt: string

}

export interface AddAdminPayload { 
  username: string,
  password: string,
  isActive: string
}

export interface Roles {
  resource: string;
  resource_ar: string;
  icon: string | null;
  roles?: PossessionRoles[];
  permissions?: PossessionRoles[];
  rolesString?: string[];
}

export interface PossessionRoles {
  action: "read" | "create" | "update" | "delete";
  possession: "any" | "own";
}

export const Admin = api.injectEndpoints({
  endpoints: (build) => ({
    AdminGetData: build.query<BaseGetDataResponse<IAdmin>, GetDataRequestParams>({
      query: (params) => ({
        url: `manager/admin`,
        params,
        method: "GET",
      }),
      providesTags: ["AdminGetData"],
      transformResponse: (response: BaseGetDataResponse<IAdmin>) => {
        response.data = response.data.map((item) => {
          if (item.photo) {
            item.photo = BASE_URL + "uploads/" + item.photo;
          }
          return item;
        });
        return response;
      },
    }),

    AdminGetDataById: build.query<IAdmin, { id: string }>({
      query: ({ id }) => ({
        url: `manager/admin/${id}`,
        method: "GET",
      }),
      providesTags: ["AdminGetDataById"],
      transformResponse: (response: IAdmin) => {
        if (response.photo) {
          response.photo = BASE_URL + "uploads/" + response.photo;
        }
        response.roles = response.roles.map((role) => {
          role.roles = role.permissions;
          role.rolesString = role.permissions?.map((i) => `${i.action}-${i.possession}`);
          return role;
        });
        return response;
      },
    }),
 
    AdminUpdate: build.mutation<AdminDataResponse, { id: string; body: AddAdminPayload | FormData }>({
      query: ({ id, body }) => ({
        url: `manager/admin/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminUpdate", "AdminGetDataById"],
    }),
  
    AdminRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `manager/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminRemove", "AdminGetData"],
    }),
    
  }),
});
export const {
  useAdminGetDataQuery, 
  useLazyAdminGetDataQuery, 
  useAdminGetDataByIdQuery, 
  useLazyAdminGetDataByIdQuery,
  useAdminUpdateMutation,
  useAdminRemoveMutation, 
} = Admin;
