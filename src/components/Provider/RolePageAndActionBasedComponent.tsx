"use client";

import { PAGE_CODE, PERMISSION } from "@/services/types/BaseType";
import { useSession } from "next-auth/react";
import Loading from "../layouts/loading";
import React, { FC } from "react";
import { useAdminGetDataByIdQuery } from "@/services/Manager/Admin";

type RolePageAndActionBasedComponentProps = {
  resource: PAGE_CODE | PAGE_CODE[];
  permission: PERMISSION | PERMISSION[];
  component: React.ComponentType<any>;
};

type WithProps = {
  hasAccess?: boolean;
};

const withDisabled = (Component: React.ComponentType<any>) => {
  const withDisabled = (props: any) => <Component {...props} disabled />;

  withDisabled.displayName = "withDisabled";

  return withDisabled;
};

const checkPrivilegesAndPermissions = (resource: PAGE_CODE | PAGE_CODE[], permission: PERMISSION | PERMISSION[], resources: PAGE_CODE[], permissions: PERMISSION[]) => {
  let hasPrivileges = Array.isArray(resource) ? resource.some((c) => resources?.includes(c)) : resources?.includes(resource as any) ?? false;

  let hasPermissions = Array.isArray(permission) ? permission.some((c) => permissions?.includes(c)) : permissions?.includes(permission as any) ?? false;

  return { hasPrivileges, hasPermissions };
};

export const RolePageAndActionBasedComponent: React.FC<RolePageAndActionBasedComponentProps> = React.memo(({ resource, component, permission }) => {
  const { data: session } = useSession();
  const { currentData: DataAdminGetDataById, isFetching: isFetchingAdminGetDataById } = useAdminGetDataByIdQuery({ id: String(session?.user.id) });
  const resources = DataAdminGetDataById?.roles?.map((item) => item.resource) as PAGE_CODE[];
  const permissions = Array.isArray(resource)
    ? (DataAdminGetDataById?.roles?.find((item) => resource.includes(item.resource as PAGE_CODE))?.rolesString as PERMISSION[])
    : (DataAdminGetDataById?.roles?.find((item) => item.resource == resource)?.rolesString as PERMISSION[]);

  const { hasPrivileges, hasPermissions } = checkPrivilegesAndPermissions(resource, permission, resources, permissions);

  const Component = component;

  if (!hasPrivileges || !hasPermissions) {
    const DisabledComponent = withDisabled(Component);
    return <DisabledComponent />;
  }
  RolePageAndActionBasedComponent.displayName = "RolePageAndActionBasedComponent";
  return <Component />;
});

export const withRole = <P extends object>(WrappedComponent: FC<P>, resource: PAGE_CODE | PAGE_CODE[], permission: PERMISSION | PERMISSION[]): FC<P & WithProps> => {
  const WithRoleComponent = (props: P) => {
    const { status, data: session } = useSession();
    const { currentData: DataAdminGetDataById, isFetching: isFetchingAdminGetDataById } = useAdminGetDataByIdQuery({ id: String(session?.user.id) });

    const resources = DataAdminGetDataById?.roles?.map((item) => item.resource) as PAGE_CODE[];
    const permissions = DataAdminGetDataById?.roles?.find((item) => item.resource == resource)?.rolesString as PERMISSION[];

    const { hasPrivileges, hasPermissions } = checkPrivilegesAndPermissions(resource, permission, resources, permissions);

    if (status === "loading" || isFetchingAdminGetDataById) return <Loading />;
    if (hasPrivileges && hasPermissions) {
      return <WrappedComponent {...props} hasAccess={hasPrivileges && hasPermissions} />;
    }

    return <div className="grid place-content-center w-full h-[calc(100vh-165px)]">Not Found Page</div>;
  };
  WithRoleComponent.displayName = "WithRoleComponent";

  return WithRoleComponent;
};
