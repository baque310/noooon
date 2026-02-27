"use client";

import React, { useState } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { ItemList } from "@/components/common/ItemList";

import { getTranslation } from "@/ni18n/i18n";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import moment from "moment";
import { useLazyTeacherLessonsGetDataByIdQuery, useTeacherLessonsRemoveMutation } from "@/services/admin/teacherLessons";
import { ArrowIcons } from "@/components/common/icons/Actions";
import { toast } from "react-toastify";
import DeleteModel from "@/components/Model/DeleteModel";
import { LessonAttachment } from "./LessonAttachment";
import { StudentLesson } from "./StudentLesson";

export interface DetailsPageComponentProps {
  id?: string;
  isModal?: boolean;
  onClose?: () => void;
  onEdit?: () => void;
}

const PageComponent = ({ id: propsId, isModal, onClose, onEdit }: DetailsPageComponentProps) => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const id = propsId || params.id;
  const [TeacherLessonsGetDataById, { currentData: data, isFetching }] = useLazyTeacherLessonsGetDataByIdQuery();

  useEffect(() => {
    if (id) {
      TeacherLessonsGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          if (isModal && onClose) onClose();
          else router.back();
        }
      });
    }
  }, [id]);
  const [openDelete, setOpenDelete] = useState(false);

  const [TeacherLessonsRemove, { isLoading: isLoadingTeacherLessonsRemove }] = useTeacherLessonsRemoveMutation();

  const handleRemove = async () => {
    try {
      await TeacherLessonsRemove({ id: String(id) }).unwrap();
      toast.success(t("common.deleted-successfully"), { autoClose: 3000 });
      if (isModal && onClose) onClose();
      else router.back();
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error && error.message) {
        return toast.error(t(error.message), { autoClose: 15000 });
      }
      toast.error(error, { autoClose: 15000 });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {!isModal && (
          <div className="mb-6">
            <BackButton title={t("TeacherLessonsPage.infoTeacherLessons")} />
          </div>
        )}

        {isFetching ? (
          <div className="flex justify-center py-12">
            <LoadingForm />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Lesson Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  {t("TeacherLessonsPage.infoTeacherLessons")}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("TeacherLessonsPage.title")}</label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <p className="text-gray-900 dark:text-white font-medium">{data?.title}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("TeacherLessonsPage.content")}</label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{data?.content}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("TeacherLessonsPage.dueDate")}</label>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <p className="text-gray-900 dark:text-white font-medium">{moment(data?.dueDate).format("YYYY-MM-DD")}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("TeacherLessonsPage.teacherFullName")}</label>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <p className="text-gray-900 dark:text-white font-medium">{data?.teacherSubject?.Teacher?.fullName || "N/A"}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("TeacherLessonsPage.StageName")}</label>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <p className="text-gray-900 dark:text-white font-medium">{data?.teacherSubject?.StageSubject?.Stage?.name || "N/A"}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("TeacherLessonsPage.SubjectName")}</label>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <p className="text-gray-900 dark:text-white font-medium">{data?.teacherSubject?.StageSubject?.Subject?.name || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("TeacherLessonsPage.SchoolYear")}</label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <p className="text-gray-900 dark:text-white font-medium">{`${data?.SchoolYear?.from || ""} - ${data?.SchoolYear?.to || ""}`}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("common.createdAt")}</label>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{moment(data?.createdAt).format("YYYY-MM-DD hh:mm:ss A")}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("common.updatedAt")}</label>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{moment(data?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t("TeacherLessonsPage.statisticsOverview")}</h3>
              </div>

              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data?.StudentLesson?.length || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t("TeacherLessonsPage.totalStudents")}</div>
                </div>

                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data?.LessonAttachment?.length || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t("Attachments")}</div>
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            <LessonAttachment data={data} />
            {/* Student Submissions */}
            <StudentLesson data={data} />

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t("common.settings")}</h3>
              </div>

              <div className="p-6 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    if (isModal && onEdit) {
                      onEdit();
                    } else {
                      router.push(`/teacherLessons/createOrUpdate?id=${id}`);
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              description={t("TeacherLessonsPage.Are-you-sure-you-want-to-delete-this-teacherLessons")}
              title={t("TeacherLessonsPage.DeleteTeacherLessons")}
              open={openDelete}
              setOpen={setOpenDelete}
              handleRemove={handleRemove}
              isLoading={isLoadingTeacherLessonsRemove}
              name={data?.title ?? ""}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PageComponent;
