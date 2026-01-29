import Link from "next/link";
import React, { ReactNode, useEffect, useState } from "react";
import AnimateHeight from "react-animate-height";

import { usePathname } from "next/navigation";

import { RolePageAndActionBasedComponent } from "@/components/Provider/RolePageAndActionBasedComponent";
import { toLocaleString } from "@/utils/LocaleString";
import { PAGE_CODE, PERMISSION } from "@/services/types/BaseType";
import { ChevronDown } from "lucide-react";

export const MenuSubItem = ({
  setCurrentMenu,
  name,
  currentMenu,
  label,
  icon,
  menuList,
  toggleMenu,
  resource,
  permission,
  number = 0,
}: {
  number?: number;
  setCurrentMenu: any;
  name: string;
  currentMenu: string;
  label: string;
  icon?: React.ReactNode;
  menuList: { resource: PAGE_CODE | PAGE_CODE[]; permission: PERMISSION | PERMISSION[]; isNoSub?: boolean; to: string; number?: number; label: string; icon?: React.ReactNode }[];
  toggleMenu: any;
  resource: PAGE_CODE | PAGE_CODE[];
  permission: PERMISSION | PERMISSION[];
}) => {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const pages = menuList.map((menu) => menu.to);
    if (pages.some((page) => page === pathname)) {
      setCurrentMenu(name);
    }
  }, [pathname]);

  const getNavLinkClass = () => (currentMenu === name ? "active nav-link group w-full !mb-2" : "nav-link group w-full !mb-2");
  const getCaretClass = () => (currentMenu !== name ? "-rotate-90 rtl:rotate-90 transition-transform duration-200" : "transition-transform duration-200");

  return (
    <li className={`menu nav-item text-base pr-5 ${isActive && "hidden"}`}>
      <button type="button" className={getNavLinkClass()} onClick={() => toggleMenu(name)}>
        <RolePageAndActionBasedComponent
          component={(props) => <RoleComponent number={number} disabled={props.disabled} icon={icon} label={label} setIsActive={setIsActive} />}
          resource={resource}
          permission={permission}
        />
        <div className={getCaretClass()}>
          <ChevronDown />
        </div>
      </button>

      {SubMenuListAnimation(currentMenu, name, menuList)}
    </li>
  );
};

const RoleComponent = ({
  setIsActive,
  disabled,
  icon,
  label,
  number,
}: {
  number: number;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  disabled: boolean;
  icon: ReactNode;
  label: string;
}) => {
  useEffect(() => {
    setIsActive(disabled);
  }, [disabled]);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center ">
        {icon}
        <span className="  ltr:pl-3 rtl:pr-3  ">{label}</span>
      </div>

      {number > 0 && <div className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">{toLocaleString(number)}</div>}
    </div>
  );
};

export default MenuSubItem;

function SubMenuListAnimation(
  currentMenu: string,
  name: string,
  menuList: { resource: PAGE_CODE | PAGE_CODE[]; permission: PERMISSION | PERMISSION[]; isNoSub?: boolean; to: string; label: string; icon?: React.ReactNode; number?: number }[],
) {
  return (
    <AnimateHeight duration={300} height={currentMenu === name ? "auto" : 0}>
      <ul className="sub-menu text-gray-500 !p-0 !mt-0">{menuList.map((item, index) => ListMenu(index, item, name))}</ul>
    </AnimateHeight>
  );
}
function ListMenu(
  index: number,
  item: { resource: PAGE_CODE | PAGE_CODE[]; permission: PERMISSION | PERMISSION[]; isNoSub?: boolean; to: string; label: string; icon?: React.ReactNode; number?: number },
  name: string,
): React.JSX.Element {
  const [isActive, setIsActive] = useState(false);
  return (
    <li key={index} className={isActive ? "hidden" : ""}>
      <Link href={item.isNoSub ? `/${item.to}` : `/${name}/${item.to}`}>
        <RolePageAndActionBasedComponent
          component={(props) => <RoleComponent number={item.number ?? 0} disabled={props.disabled} icon={item.icon} label={item.label} setIsActive={setIsActive} />}
          resource={item.resource}
          permission={item.permission}
        />
      </Link>
    </li>
  );
}
