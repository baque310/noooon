import { getTranslation } from "@/ni18n/i18n";
import { ITeacherHomeworks } from "@/services/admin/teacherHomeworks";
import React from "react";

export const StudentHomework = ({
  data,
}: {
  data: ITeacherHomeworks | undefined;
}) => {
  const { t } = getTranslation();
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "from-green-500 to-emerald-500";
      case "submitted":
        return "from-blue-500 to-cyan-500";
      case "pending":
        return "from-yellow-500 to-orange-500";
      case "overdue":
        return "from-red-500 to-pink-500";
      default:
        return "from-gray-500 to-slate-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "assigned":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "completed":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "notcompleted":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("TeacherHomeworksPage.Not completed");
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!data?.StudentHomework || data.StudentHomework.length === 0) {
    return (
      <div className="relative mt-4">
        {/* Floating background elements */}
        <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>

        <div className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
          {/* Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm"></div>
            <div className="relative px-6 py-4 border-b border-white/10 dark:border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    <span className="text-gray-900 dark:text-white">
                      {t("TeacherHomeworksPage.Student Submissions")}
                    </span>
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {t("TeacherHomeworksPage.Track homework submission status")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Empty state */}
          <div className="p-6">
            <div className="text-center py-12">
              <div className="space-y-4">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-indigo-200 dark:from-gray-700 dark:to-indigo-800 rounded-2xl rotate-6"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg
                      className="w-10 h-10 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {t("TeacherHomeworksPage.No student submissions")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    {t(
                      "TeacherHomeworksPage.No students have submitted this homework yet"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-4">
      {/* Floating background elements */}
      <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>

      <div className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
        {/* Modern Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm"></div>
          <div className="relative px-6 py-4 border-b border-white/10 dark:border-gray-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {t("TeacherHomeworksPage.Student Submissions")}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {t("TeacherHomeworksPage.Track homework submission status")}
                  </p>
                </div>
              </div>

              <div className="px-3 py-1 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full border border-indigo-400/30">
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                  {data.StudentHomework.length}{" "}
                  {data.StudentHomework.length === 1
                    ? t("Student")
                    : t("Students")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.StudentHomework.map((item, index) => (
              <div
                key={index}
                className="group relative backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-md hover:shadow-xl border border-white/30 dark:border-gray-700/30 overflow-hidden transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Student Card Content */}
                <div className="p-5 space-y-4">
                  {/* Student Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">
                        {item.Student?.fullName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        {item.Student?.fullName}
                      </h3>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r ${getStatusColor(
                        item.HomeworkStatus
                      )} text-white font-semibold shadow-lg`}
                    >
                      {getStatusIcon(item.HomeworkStatus)}
                      <span className="text-sm capitalize">
                        {t(item.HomeworkStatus as any)}
                      </span>
                    </div>

                    {/* Completion Date */}
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {item.completedAt
                          ? t("TeacherHomeworksPage.Completed")
                          : t("TeacherHomeworksPage.Status")}
                      </p>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {formatDate(item.completedAt ?? undefined)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
