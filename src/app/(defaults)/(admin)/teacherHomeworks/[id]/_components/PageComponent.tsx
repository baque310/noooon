"use client";

import React, { useState } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { ItemList } from "@/components/common/ItemList";

import { getTranslation } from "@/ni18n/i18n";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import moment from "moment";
import {
  useLazyTeacherHomeworksGetDataByIdQuery,
  useTeacherHomeworksRemoveMutation,
} from "@/services/admin/teacherHomeworks";
import { ArrowIcons } from "@/components/common/icons/Actions";
import { toast } from "react-toastify";
import DeleteModel from "@/components/Model/DeleteModel";
import { HomeworkAttachment } from "./HomeworkAttachment";
import { StudentHomework } from "./StudentHomework";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [TeacherHomeworksGetDataById, { currentData: data, isFetching }] =
    useLazyTeacherHomeworksGetDataByIdQuery();

  useEffect(() => {
    if (id) {
      TeacherHomeworksGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);
  const [openDelete, setOpenDelete] = useState(false);

  const [
    TeacherHomeworksRemove,
    { isLoading: isLoadingTeacherHomeworksRemove },
  ] = useTeacherHomeworksRemoveMutation();

  const handleRemove = async () => {
    try {
      await TeacherHomeworksRemove({ id: String(id) }).unwrap();
      toast.success(t("common.deleted-successfully"), { autoClose: 15000 });
      router.back();
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error && error.message) {
        return toast.error(error.message, { autoClose: 15000 });
      }
      toast.error(error, { autoClose: 15000 });
    }
  };

  return (
    <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-4xl mb-20">
      <BackButton title={t("TeacherHomeworksPage.infoTeacherHomeworks")} />

      {isFetching ? (
        <LoadingForm />
      ) : (
        <div className="space-y-8">
          {/* Main Homework Details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                {t("TeacherHomeworksPage.infoTeacherHomeworks")}
              </h2>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-3">
                <label className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {t("TeacherHomeworksPage.title")}
                </label>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {data?.title}
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {t("TeacherHomeworksPage.content")}
                </label>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {data?.content}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {t("TeacherHomeworksPage.dueDate")}
                </label>
                <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 rounded-xl border border-red-200/50 dark:border-red-700/50">
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {moment(data?.dueDate).format("YYYY-MM-DD")}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {t("TeacherHomeworksPage.teacherFullName")}
                </label>
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 rounded-xl border border-green-200/50 dark:border-green-700/50">
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {data?.teacherSubject?.Teacher?.fullName || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {t("TeacherHomeworksPage.StageName")}
                </label>
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/30 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50">
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {data?.teacherSubject?.StageSubject?.Stage?.name || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-pink-600 dark:text-pink-400">
                  {t("TeacherHomeworksPage.SubjectName")}
                </label>
                <div className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/30 rounded-xl border border-pink-200/50 dark:border-pink-700/50">
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {data?.teacherSubject?.StageSubject?.Subject?.name || "N/A"}
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {t("TeacherHomeworksPage.SchoolYear")}
                </label>
                <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30 rounded-xl border border-amber-200/50 dark:border-amber-700/50">
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {`${data?.SchoolYear?.from || ""} - ${
                      data?.SchoolYear?.to || ""
                    }`}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {t("common.createdAt")}
                </label>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200/50 dark:border-gray-600">
                  <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                    {moment(data?.createdAt).format("YYYY-MM-DD hh:mm:ss A")}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {t("common.updatedAt")}
                </label>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200/50 dark:border-gray-600">
                  <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                    {moment(data?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-8 py-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                {t("TeacherHomeworksPage.statisticsOverview")}
              </h3>
              <p className="text-emerald-100 mt-1">
                {t("TeacherHomeworksPage.submissionStatusSummary")}
              </p>
            </div>

            <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {data?.StudentHomework?.length || 0}
                </div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {t("TeacherHomeworksPage.totalStudents")}
                </div>
              </div>

              <div className="text-center p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl border border-green-200/50 dark:border-green-700/50">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {data?.StudentHomework?.filter(
                    (s) => s.HomeworkStatus === "Completed"
                  )?.length || 0}
                </div>
                <div className="text-sm font-medium text-green-700 dark:text-green-300">
                  {t("Completed")}
                </div>
              </div>

              <div className="text-center p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-2xl border border-yellow-200/50 dark:border-yellow-700/50">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {data?.StudentHomework?.filter(
                    (s) => s.HomeworkStatus === "Assigned"
                  )?.length || 0}
                </div>
                <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  {t("Assigned")}
                </div>
              </div>

              <div className="text-center p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {data?.HomeworkAttachment?.length || 0}
                </div>
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  {t("Attachments")}
                </div>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <HomeworkAttachment data={data} />
          {/* Student Submissions */}
          <StudentHomework data={data} />

          {/* Actions Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-600 to-gray-600 px-8 py-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {t("common.settings")}
              </h3>
              <p className="text-slate-100 mt-1">Manage homework actions</p>
            </div>

            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button
                onClick={() =>
                  router.push(`/teacherHomeworks/createOrUpdate?id=${id}`)
                }
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <svg
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                {t("TeacherPage.update-info")}
              </button>

              <button
                onClick={() => setOpenDelete(true)}
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <svg
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {t("common.delete")}
              </button>
            </div>
          </div>

          <DeleteModel
            description={t(
              "TeacherHomeworksPage.Are-you-sure-you-want-to-delete-this-teacherHomeworks"
            )}
            title={t("TeacherHomeworksPage.DeleteTeacherHomeworks")}
            open={openDelete}
            setOpen={setOpenDelete}
            handleRemove={handleRemove}
            isLoading={isLoadingTeacherHomeworksRemove}
            name={data?.title ?? ""}
          />
        </div>
      )}
    </div>
  );
};

export default PageComponent;
