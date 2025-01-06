 
import { IAdmin } from '@/services/Manager/Admin';
import { PAGE_CODE, PERMISSION } from '@/services/types/BaseType';
   
type RolePageAndActionBasedComponentProps = {
  resource: PAGE_CODE | PAGE_CODE[];
  permission: PERMISSION | PERMISSION[]; 
  data: IAdmin;
};

const checkPrivilegesAndPermissions = (resource: PAGE_CODE | PAGE_CODE[], permission: PERMISSION | PERMISSION[], resources: PAGE_CODE[], permissions: PERMISSION[]) => {
  let hasPrivileges = Array.isArray(resource) ? resource.some((c) => resources?.includes(c)) : resources?.includes(resource as any) ?? false;

  let hasPermissions = Array.isArray(permission) ? permission.some((c) => permissions?.includes(c)) : permissions?.includes(permission as any) ?? false;

  return { hasPrivileges, hasPermissions };
};

export const hasRoleAndPermissions=  ({ resource, permission,data }:RolePageAndActionBasedComponentProps) => {
 
   const resources = data?.roles?.map((item) => item.resource) as PAGE_CODE[];
  const permissions =
    Array.isArray(resource) ?
      data?.roles?.find(item => resource.includes(item.resource as PAGE_CODE))?.rolesString as PERMISSION[] :
      data?.roles?.find(item => item.resource == resource)?.rolesString as PERMISSION[]

  const { hasPrivileges, hasPermissions } = checkPrivilegesAndPermissions(resource, permission, resources, permissions);

  if (!hasPrivileges || !hasPermissions) {
    return false
  }else{
    return true
  } 
};