import React, { useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import InfoCard from "./InfoCard";
import { getTranslation } from "@/ni18n/i18n";

interface StudentData {
  fullName?: string;
  email?: string;
  address?: string;
  phone1?: string;
  phone2?: string;
  birth?: string;
  gender?: string;
  enrollmentDate?: string;
  User?: {
    username?: string;
  };
}

interface PersonalInfoSectionProps {
  data: StudentData | undefined;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ data }) => {
  const { t } = getTranslation();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success("Copied to clipboard!", {
        autoClose: 2000,
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy", {
        autoClose: 2000,
      });
    }
  };

  // Custom InfoCard component with copy functionality
  const CopyableInfoCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | null | undefined;
    gradientFrom: string;
    gradientTo: string;
    borderColor: string;
    iconBgFrom: string;
    iconBgTo: string;
    colSpan?: string;
    copyable?: boolean;
    fieldName?: string;
  }> = ({
    icon,
    title,
    value,
    gradientFrom,
    gradientTo,
    borderColor,
    iconBgFrom,
    iconBgTo,
    colSpan = "",
    copyable = false,
    fieldName = "",
  }) => {
    const isCopied = copiedField === fieldName;

    return (
      <div className={`group relative ${colSpan}`}>
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl transform group-hover:scale-105 transition-transform duration-300`}
        ></div>
        <div
          className={`relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border ${borderColor}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 bg-gradient-to-br ${iconBgFrom} ${iconBgTo} rounded-lg flex items-center justify-center`}
              >
                {icon}
              </div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                {title}
              </h3>
            </div>
            {copyable && value && (
              <button
                onClick={() => copyToClipboard(value, fieldName)}
                className="p-1.5 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 dark:bg-gray-400/10 dark:hover:bg-gray-400/20 transition-all duration-200 group opacity-0 group-hover:opacity-100"
                title="Copy to clipboard"
              >
                {isCopied ? (
                  <svg
                    className="w-3.5 h-3.5 text-green-600 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                )}
              </button>
            )}
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {value || "N/A"}
          </p>
        </div>
      </div>
    );
  };

  const personalInfoItems = [
    {
      icon: (
        <svg
          className="w-4 h-4 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 8a3 3 0 00-3 3v3a1 1 0 002 0v-3a1 1 0 011-1h.01a1 1 0 011 1v3a1 1 0 002 0v-3a3 3 0 00-3-3z" />
        </svg>
      ),
      title: t("StudentPage.fullName"),
      value: data?.fullName,
      gradientFrom: "from-blue-50",
      gradientTo: "to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30",
      borderColor: "border-blue-200/30 dark:border-blue-700/30",
      iconBgFrom: "from-blue-500",
      iconBgTo: "to-blue-600",
    },
    {
      icon: (
        <svg
          className="w-4 h-4 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: t("StudentPage.Username"),
      value: `@${data?.User?.username}`,
      gradientFrom: "from-emerald-50",
      gradientTo: "to-green-100 dark:from-emerald-900/20 dark:to-green-900/30",
      borderColor: "border-emerald-200/30 dark:border-emerald-700/30",
      iconBgFrom: "from-emerald-500",
      iconBgTo: "to-green-600",
      copyable: true,
      fieldName: "username",
    },
    {
      icon: (
        <svg
          className="w-4 h-4 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
      ),
      title: t("StudentPage.email"),
      value: data?.email,
      gradientFrom: "from-purple-50",
      gradientTo: "to-pink-100 dark:from-purple-900/20 dark:to-pink-900/30",
      borderColor: "border-purple-200/30 dark:border-purple-700/30",
      iconBgFrom: "from-purple-500",
      iconBgTo: "to-pink-600",
      colSpan: "md:col-span-2",
      copyable: true,
      fieldName: "email",
    },
    {
      icon: (
        <svg
          className="w-4 h-4 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: t("StudentPage.address"),
      value: data?.address,
      gradientFrom: "from-orange-50",
      gradientTo: "to-red-100 dark:from-orange-900/20 dark:to-red-900/30",
      borderColor: "border-orange-200/30 dark:border-orange-700/30",
      iconBgFrom: "from-orange-500",
      iconBgTo: "to-red-600",
      colSpan: "md:col-span-2",
    },
    {
      icon: (
        <svg
          className="w-4 h-4 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8 14v3a1 1 0 001 1h2a1 1 0 001-1v-3a1 1 0 10-2 0v2H9v-2a1 1 0 10-2 0zM4 4a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: t("common.gender"),
      value: data?.gender
        ? t(`common.${data.gender.toLowerCase()}` as any)
        : null,
      gradientFrom: "from-teal-50",
      gradientTo: "to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/30",
      borderColor: "border-teal-200/30 dark:border-teal-700/30",
      iconBgFrom: "from-teal-500",
      iconBgTo: "to-cyan-600",
    },
    {
      icon: (
        <svg
          className="w-4 h-4 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      ),
      title: t("StudentPage.phone1"),
      value: data?.phone1,
      gradientFrom: "from-cyan-50",
      gradientTo: "to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/30",
      borderColor: "border-cyan-200/30 dark:border-cyan-700/30",
      iconBgFrom: "from-cyan-500",
      iconBgTo: "to-blue-600",
      copyable: true,
      fieldName: "phone1",
    },
    {
      icon: (
        <svg
          className="w-4 h-4 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      ),
      title: t("StudentPage.phone2"),
      value: data?.phone2,
      gradientFrom: "from-indigo-50",
      gradientTo: "to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/30",
      borderColor: "border-indigo-200/30 dark:border-indigo-700/30",
      iconBgFrom: "from-indigo-500",
      iconBgTo: "to-purple-600",
      copyable: true,
      fieldName: "phone2",
    },
    {
      icon: (
        <svg
          className="w-4 h-4 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: t("StudentPage.birth"),
      value: data?.birth ? moment(data.birth).format("YYYY-MM-DD") : null,
      gradientFrom: "from-yellow-50",
      gradientTo: "to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/30",
      borderColor: "border-yellow-200/30 dark:border-yellow-700/30",
      iconBgFrom: "from-yellow-500",
      iconBgTo: "to-orange-600",
    },
    {
      icon: (
        <svg
          className="w-4 h-4 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: t("StudentPage.enrollmentDate"),
      value: data?.enrollmentDate
        ? moment(data.enrollmentDate).format("YYYY-MM-DD")
        : null,
      gradientFrom: "from-rose-50",
      gradientTo: "to-pink-100 dark:from-rose-900/20 dark:to-pink-900/30",
      borderColor: "border-rose-200/30 dark:border-rose-700/30",
      iconBgFrom: "from-rose-500",
      iconBgTo: "to-pink-600",
    },
  ];

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>

      <div className="relative bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl shadow-xl overflow-hidden">
        {/* Header with Floating Elements */}
        <div className="relative bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-pink-400/10 p-8 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("StudentPage.infoStudent")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t("StudentPage.studentPersonalDetails")}
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personalInfoItems.map((item, index) => (
              <CopyableInfoCard
                key={index}
                icon={item.icon}
                title={item.title}
                value={item.value}
                gradientFrom={item.gradientFrom}
                gradientTo={item.gradientTo}
                borderColor={item.borderColor}
                iconBgFrom={item.iconBgFrom}
                iconBgTo={item.iconBgTo}
                colSpan={item.colSpan}
                copyable={item.copyable}
                fieldName={item.fieldName}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
