"use client";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { RolePageAndActionBasedComponent } from "@/components/Provider/RolePageAndActionBasedComponent";

const MenuSubItem = ({
    permission,
    resource,
    name,
    currentMenu,
    label,
    icon,
    menuList,
    toggleMenu,
    pathname,
}: any) => {
    const isOpen = currentMenu === name;
    const isParentActive = menuList.some((item: any) => pathname.startsWith(`/${item.to}`));

    return (
        <RolePageAndActionBasedComponent
            resource={resource}
            permission={permission}
            component={(props: any) => {
                if (props.disabled) return null;
                return (
                    <li className="mb-1 px-4">
                        <button
                            type="button"
                            className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 hover:scale-[1.02] ${isOpen || isParentActive
                                ? "bg-slate-50 text-primary dark:bg-white/5"
                                : "text-slate-800 dark:text-slate-200"
                                }`}
                            onClick={() => toggleMenu(name)}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-300 ${isOpen || isParentActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                        : "bg-slate-100 text-slate-700 group-hover:bg-primary/10 group-hover:text-primary dark:bg-white/10 dark:text-slate-300"
                                        }`}
                                >
                                    {icon}
                                </div>
                                <span className="text-sm font-bold">{label}</span>
                            </div>
                            <ChevronDown
                                className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                            />
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                                }`}
                        >
                            <ul className="mt-1 space-y-1 py-1 px-2 ltr:pl-10 rtl:pr-10">
                                {menuList.map((sub: any, idx: number) => {
                                    const isSubActive = pathname === `/${sub.to}`;
                                    return (
                                        <RolePageAndActionBasedComponent
                                            key={idx}
                                            resource={sub.resource}
                                            permission={sub.permission}
                                            component={(subProps: any) => {
                                                if (subProps.disabled) return null;
                                                return (
                                                    <li key={idx}>
                                                        <Link
                                                            href={`/${sub.to}`}
                                                            className={`block rounded-lg px-3 py-2 text-[13px] font-semibold transition-all duration-200 hover:ltr:translate-x-1 hover:rtl:-translate-x-1 ${isSubActive
                                                                ? "text-primary dark:text-primary-light"
                                                                : "text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-white"
                                                                }`}
                                                        >
                                                            {sub.label}
                                                        </Link>
                                                    </li>
                                                );
                                            }}
                                        />
                                    );
                                })}
                            </ul>
                        </div>
                    </li>
                );
            }}
        />
    );
};

export default MenuSubItem;
