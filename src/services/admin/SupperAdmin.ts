import { BASE_URL, api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";
import { User } from "next-auth";

export interface SupperAdminDataResponse extends User { }

export interface ISupperAdmin {

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

export interface AddSupperAdminPayload { 
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

export const SupperAdmin = api.injectEndpoints({
  endpoints: (build) => ({
    SupperAdminGetData: build.query<BaseGetDataResponse<ISupperAdmin>, GetDataRequestParams>({
      query: (params) => ({
        url: `supper/admin`,
        params,
        method: "GET",
      }),
      providesTags: ["SupperAdminGetData"],
      transformResponse: (response: BaseGetDataResponse<ISupperAdmin>) => {
        response.data = response.data.map((item) => {
          if (item.photo) {
            item.photo = BASE_URL + "uploads/" + item.photo;
          }
          return item;
        });
        return response;
      },
    }),

    SupperAdminGetDataById: build.query<ISupperAdmin, { id: string }>({
      query: ({ id }) => ({
        url: `manager/admin/${id}`,
        method: "GET",
      }),
      providesTags: ["SupperAdminGetDataById"],
      transformResponse: (response: ISupperAdmin) => {
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
 
    SupperAdminUpdate: build.mutation<SupperAdminDataResponse, { id: string; body: AddSupperAdminPayload | FormData }>({
      query: ({ id, body }) => ({
        url: `manager/admin/${id}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["SupperAdminUpdate", "SupperAdminGetDataById"],
    }),
  
    SupperAdminRemove: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `manager/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SupperAdminRemove", "SupperAdminGetData"],
    }),
    
  }),
});
export const {
  useSupperAdminGetDataQuery, 
  useLazySupperAdminGetDataQuery, 
  useSupperAdminGetDataByIdQuery, 
  useLazySupperAdminGetDataByIdQuery,
  useSupperAdminUpdateMutation,
  useSupperAdminRemoveMutation, 
} = SupperAdmin;
