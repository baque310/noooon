"use client";
import React from "react";
import { getTranslation } from "@/ni18n/i18n";
import { useRouter } from "next/navigation";
import { Network, Layers, LayoutGrid } from "lucide-react";

export type AcademicTabOption = "stage" | "class" | "section";

interface TabProps {
    selected: AcademicTabOption;
    children?: React.ReactNode;
}

const tabs = [
    {
        key: "stage" as AcademicTabOption,
        labelKey: "sidebar.stage",
        icon: <Network className="w-5 h-5" />,
        route: "/stage"
    },
    {
        key: "class" as AcademicTabOption,
        labelKey: "sidebar.class",
        icon: <Layers className="w-5 h-5" />,
        route: "/class"
    },
    {
        key: "section" as AcademicTabOption,
        labelKey: "sidebar.section",
        icon: <LayoutGrid className="w-5 h-5" />,
        route: "/section"
    },
];

export const AcademicTabs: React.FC<TabProps> = ({ selected, children }) => {
    const { t } = getTranslation();
    const router = useRouter();

    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 w-full gap-4">
            {/* Tabs List (Right side in RTL) */}
            <div className="flex bg-slate-50/80 dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto w-full md:w-auto">
                {tabs.map((tab) => {
                    const isActive = selected === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => router.push(tab.route)}
                            className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg font-bold transition-all duration-300 whitespace-nowrap ${isActive
                                    ? "text-primary bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)] dark:bg-gray-700 dark:text-primary-light"
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/50"
                                }`}
                        >
                            <span className={isActive ? "text-primary" : "text-slate-400"}>
                                {tab.icon}
                            </span>
                            <span className="text-[14px]">{t(tab.labelKey as any)}</span>
                        </button>
                    );
                })}
            </div>

            {/* Action Buttons (Left side in RTL) */}
            <div className="flex w-full md:w-auto justify-end md:justify-start">
                {children}
            </div>
        </div>
    );
};
