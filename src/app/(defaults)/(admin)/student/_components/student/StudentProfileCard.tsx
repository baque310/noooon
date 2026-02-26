"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import { toast } from "react-toastify";
import { AttachmentsImage } from "@/components/common/LightboxImagePreview";
import { BASE_URL } from "@/services/api";
import { getTranslation } from "@/ni18n/i18n";
import { StudentData } from "../../../student_old/[id]/_components";

interface StudentProfileCardProps {
  data: StudentData | undefined;
  studentId: string | string[];
}

const StudentProfileCard: React.FC<StudentProfileCardProps> = ({ data, studentId }) => {
  const { t } = getTranslation();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const calculateAge = () => {
    return data?.birth ? moment().diff(moment(data.birth), "years") : 0;
  };

  const calculateEnrollmentYears = () => {
    return data?.enrollmentDate ? moment().diff(moment(data.enrollmentDate), "years") : 0;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!", {
        autoClose: 2000,
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy", {
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="sticky top-8">
      {/* Hero Profile Card */}
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>

        <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl shadow-2xl">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          <div className="relative text-center">
            {/* Profile Image with Advanced Effects */}
            <div className="relative inline-block mb-6">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <div className="relative">
                <AttachmentsImage
                  className="w-40 h-40 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-2xl transform hover:scale-105 transition-all duration-500"
                  src={data?.photo && data.photo !== "null" && data.photo !== "undefined" && data.photo.trim() !== ""
                    ? (data.photo.startsWith("http") ? data.photo : `${BASE_URL}uploads/${data.photo}`)
                    : ""}
                />
                {/* Status Badge */}
                <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                      fill="white"
                    />
                  </svg>
                </div>
                {/* Floating Ring Animation */}
                <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping"></div>
              </div>
            </div>

            {/* Name with Advanced Typography */}
            <h1 className="text-4xl font-black mb-3">
              <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                {data?.fullName}
              </span>
            </h1>

            {/* Username Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-700 mb-6">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">@{data?.User?.username}</span>
              {data?.User?.username && (
                <button
                  onClick={() => copyToClipboard(data?.User?.username || "")}
                  className="ml-2 p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 dark:bg-blue-400/10 dark:hover:bg-blue-400/20 transition-all duration-200 group"
                  title="Copy username">
                  {copied ? (
                    <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{calculateAge()}</div>
                <div className="text-xs text-blue-600/70 dark:text-blue-400/70 font-medium">Years Old</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-2xl p-4 border border-emerald-200/50 dark:border-emerald-700/50">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{calculateEnrollmentYears()}+</div>
                <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-medium">Years Enrolled</div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => router.push(`/studentTest/createOrUpdate?id=${studentId}`)}
              className="group relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span>{t("StudentPage.update-info")}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileCard;
