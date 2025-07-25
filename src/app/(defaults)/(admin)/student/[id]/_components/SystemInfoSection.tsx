import React from "react";
import moment from "moment";
import InfoCard from "./InfoCard";
import { getTranslation } from "@/ni18n/i18n";

interface StudentData {
  createdAt?: string;
  updatedAt?: string;
}

interface SystemInfoSectionProps {
  data: StudentData | undefined;
}

const SystemInfoSection: React.FC<SystemInfoSectionProps> = ({ data }) => {
  const { t } = getTranslation();

  const systemInfoItems = [
    {
      icon: (
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: t("common.createdAt"),
      value: data?.createdAt ? moment(data.createdAt).format("YYYY-MM-DD hh:mm:ss A") : null,
      gradientFrom: "from-emerald-50",
      gradientTo: "to-green-100 dark:from-emerald-900/20 dark:to-green-900/30",
      borderColor: "border-emerald-200/30 dark:border-emerald-700/30",
      iconBgFrom: "from-emerald-500",
      iconBgTo: "to-green-600",
    },
    {
      icon: (
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
        </svg>
      ),
      title: t("common.updatedAt"),
      value: data?.updatedAt ? moment(data.updatedAt).format("YYYY-MM-DD hh:mm:ss A") : null,
      gradientFrom: "from-blue-50",
      gradientTo: "to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30",
      borderColor: "border-blue-200/30 dark:border-blue-700/30",
      iconBgFrom: "from-blue-500",
      iconBgTo: "to-indigo-600",
    },
  ];

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>

      <div className="relative bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="relative bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 dark:from-emerald-400/10 dark:via-teal-400/10 dark:to-cyan-400/10 p-8 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400/20 to-cyan-600/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg
              className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("common.systemInfo")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t("common.recordTimestamps")}
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemInfoItems.map((item, index) => (
              <InfoCard
                key={index}
                icon={item.icon}
                title={item.title}
                value={item.value}
                gradientFrom={item.gradientFrom}
                gradientTo={item.gradientTo}
                borderColor={item.borderColor}
                iconBgFrom={item.iconBgFrom}
                iconBgTo={item.iconBgTo}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInfoSection;
