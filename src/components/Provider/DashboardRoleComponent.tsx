"use client";

import { PAGE_CODE, PERMISSION } from "@/services/types/BaseType";
import { useSession } from "next-auth/react";
import Loading from "../layouts/loading";
import React from "react";
import { useAdminGetDataByIdQuery } from "@/services/Manager/Admin";

type DashboardRoleComponentProps = {
  resource: PAGE_CODE | PAGE_CODE[];
  permission: PERMISSION | PERMISSION[];
  component: React.ComponentType<any>;
};

const checkPrivilegesAndPermissions = (
  resource: PAGE_CODE | PAGE_CODE[],
  permission: PERMISSION | PERMISSION[],
  resources: PAGE_CODE[],
  permissions: PERMISSION[]
) => {
  let hasPrivileges = Array.isArray(resource)
    ? resource.some((c) => resources.includes(c))
    : resources.includes(resource as PAGE_CODE) ?? false;

  let hasPermissions = Array.isArray(permission)
    ? permission.some((c) => permissions.includes(c))
    : permissions.includes(permission as PERMISSION) ?? false;

  return { hasPrivileges, hasPermissions };
};

export const DashboardRoleComponent: React.FC<DashboardRoleComponentProps> = React.memo(({ resource, component: Component, permission }) => {
  const { data: session } = useSession();
  const { currentData: DataAdminGetDataById, isFetching: isFetchingAdminGetDataById } = useAdminGetDataByIdQuery({ id: String(session?.user.id) });

  if (isFetchingAdminGetDataById || !DataAdminGetDataById) {
    return <Loading />;
  }

  const resources = DataAdminGetDataById.roles.map((item) => item.resource) as PAGE_CODE[];
  const permissions =
    Array.isArray(resource)
      ? DataAdminGetDataById.roles.find(item => resource.includes(item.resource as PAGE_CODE))?.rolesString as PERMISSION[] || []
      : DataAdminGetDataById.roles.find(item => item.resource === resource)?.rolesString as PERMISSION[] || [];

  const { hasPrivileges, hasPermissions } = checkPrivilegesAndPermissions(resource, permission, resources, permissions);

  if (!hasPrivileges || !hasPermissions) {
    return null; 
  }

  return <Component />;
});

DashboardRoleComponent.displayName = "DashboardRoleComponent";

export default DashboardRoleComponent;
