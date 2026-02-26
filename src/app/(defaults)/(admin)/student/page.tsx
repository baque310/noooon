"use client";
import React, { useState } from "react";
import { GraduationCap, UserPlus } from "lucide-react";
import { getTranslation } from "@/ni18n/i18n";
import StudentsTable from "./_components/StudentsTable";
import EnrollmentRegistrationView from "./_components/enrollment/EnrollmentRegistrationView";

const tabs = [
  {
    key: "students",
    labelKey: "sidebar.student",
    icon: <GraduationCap className="w-4 h-4" />,
  },
  {
    key: "enrollment",
    labelKey: "sidebar.studentEnrollment",
    icon: <UserPlus className="w-4 h-4" />,
  },
];

const Page = () => {
  const { t } = getTranslation();
  const [activeTab, setActiveTab] = useState<"students" | "enrollment">("students");

  return (
    <div className="min-h-screen">
      {/* Tabs Container */}
      <div className="px-4 pt-4">
        <div
          className="inline-flex gap-2 p-2 rounded-2xl border border-gray-100 dark:border-gray-700"
          style={{
            background: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(5px)",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border-none outline-none cursor-pointer ${
                activeTab === tab.key
                  ? "bg-white dark:bg-gray-800 text-primary shadow-md"
                  : "bg-transparent text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary"
              }`}>
              {tab.icon}
              {t(tab.labelKey as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-2">
        <div className={`transition-all duration-300 ${activeTab === "students" ? "block animate-fadeIn" : "hidden"}`}>
          <StudentsTable />
        </div>
        <div className={`transition-all duration-300 ${activeTab === "enrollment" ? "block animate-fadeIn" : "hidden"}`}>
          <EnrollmentRegistrationView />
        </div>
      </div>
    </div>
  );
};

export default Page;
