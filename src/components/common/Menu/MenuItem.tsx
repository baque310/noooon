import { RolePageAndActionBasedComponent } from "@/components/Provider/RolePageAndActionBasedComponent";
import Link from "next/link";
import React, { useState } from "react";
import { MenuRoleComponent } from "./RoleComponent";
import { PAGE_CODE, PERMISSION } from "@/services/types/BaseType";

export const MenuItem = ({
  to,
  label,
  icon,
  resource,
  toggleMenu,
  permission,
  number = 0,
}: {
  number?: number;
  to: string;
  label: string;
  icon?: React.ReactNode;
  resource: PAGE_CODE | PAGE_CODE[];
  toggleMenu: any;
  permission: PERMISSION | PERMISSION[];
}) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <li className={`nav-item text-base pr-5 ${isActive && "hidden"}`} onClick={() => toggleMenu(to)}>
      <Link href={to} className="group">
        <RolePageAndActionBasedComponent
          component={(props: any) => <MenuRoleComponent number={number} disabled={props.disabled} icon={icon} label={label} setIsActive={setIsActive} />}
          resource={resource}
          permission={permission}
        />
      </Link>
    </li>
  );
};
