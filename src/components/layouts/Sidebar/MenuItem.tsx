"use client";
import Link from "next/link";
import { RolePageAndActionBasedComponent } from "@/components/Provider/RolePageAndActionBasedComponent";
import { toLocaleString } from "@/utils/LocaleString";

const MenuItem = ({
    to,
    label,
    icon,
    resource,
    toggleMenu,
    permission,
    number = 0,
    pathname,
}: any) => {
    const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));

    return (
        <RolePageAndActionBasedComponent
            resource={resource}
            permission={permission}
            component={(props: any) => {
                if (props.disabled) return null;
                return (
                    <li className="mb-1 px-4">
                        <Link
                            href={to}
                            onClick={() => toggleMenu(to)}
                            className={`group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 hover:scale-[1.02] active:scale-95 ${isActive
                                ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary shadow-sm shadow-primary/10"
                                : "text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-300 ${isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                        : "bg-slate-100 text-slate-700 group-hover:bg-primary/10 group-hover:text-primary dark:bg-white/10 dark:text-slate-300"
                                        }`}
                                >
                                    {icon}
                                </div>
                                <span className={`text-sm font-bold transition-colors duration-300 ${isActive ? "text-primary" : ""}`}>
                                    {label}
                                </span>
                            </div>
                            {number > 0 && (
                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#1a1a1a]">
                                    {toLocaleString(number)}
                                </span>
                            )}
                        </Link>
                    </li>
                );
            }}
        />
    );
};

export default MenuItem;
