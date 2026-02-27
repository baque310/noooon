"use client";

import React, { useState, useMemo } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { getTranslation } from "@/ni18n/i18n";
import { useLazyTeacherGetDataByIdQuery, useTeacherRemoveMutation } from "@/services/admin/teacher";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { BASE_URL } from "@/services/api";
import DeleteModel from "@/components/Model/DeleteModel";
import { ChangePasswordByAdminModel } from "@/components/Model/ChangePasswordByAdminModel";
import { useUserManagerResetPasswordMutation, useUserRemoveMutation } from "@/services/Manager/User";
import ConfirmModel from "@/components/Model/ConfirmModel";
import { BookOpen, UserCircle, Settings, Trash2, Key, Ban, PenLine, Phone, Mail, MapPin } from "lucide-react";

interface PageComponentProps {
  id?: string;
  isModal?: boolean;
  onEdit?: () => void;
  onClose?: () => void;
}

const PageComponent = ({ id: propId, isModal = false, onEdit, onClose }: PageComponentProps) => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const id = propId || params?.id;

  const [openSuspend, setOpenSuspend] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openResetPassword, setOpenResetPassword] = useState(false);

  const [TeacherGetDataById, { currentData: data, isFetching }] = useLazyTeacherGetDataByIdQuery();
  const [TeacherRemove, { isLoading: isLoadingTeacherRemove }] = useTeacherRemoveMutation();
  const [UserRemove, { isLoading: isLoadingUserRemove }] = useUserRemoveMutation();
  const [UserManagerResetPassword, { isLoading: isLoadingResetPassword }] = useUserManagerResetPasswordMutation();

  useEffect(() => {
    if (id) {
      TeacherGetDataById({ id: String(id) }).then((res) => {
        if (!res.data) {
          if (isModal && onClose) onClose();
          else router.back();
        }
      });
    }
  }, [id, TeacherGetDataById, router, isModal, onClose]);

  const handleSuspend = async () => {
    try {
      await UserRemove({ id: String(data?.User?.id) }).unwrap();
      toast.success(t("StudentPage.suspend-successfully"), { autoClose: 5000 });
      setOpenSuspend(false);
      if (isModal && onClose) onClose();
      else router.back();
    } catch (error: any) {
      toast.error(error?.message || error, { autoClose: 5000 });
    }
  };

  const handleRemove = async () => {
    try {
      await TeacherRemove({ id: String(id) }).unwrap();
      toast.success(t("common.deleted-successfully"), { autoClose: 5000 });
      if (isModal && onClose) onClose();
      else router.back();
    } catch (error: any) {
      toast.error(error?.message || error, { autoClose: 5000 });
    }
  };

  const handleResetPassword = async () => {
    try {
      await UserManagerResetPassword({ id: String(data?.User?.id) }).unwrap();
      toast.success(t("StudentPage.password-reset-successfully"), { autoClose: 5000 });
      setOpenResetPassword(false);
    } catch (error: any) {
      toast.error(error?.message || error, { autoClose: 5000 });
    }
  };

  // Group assigned subjects for the custom grid
  const assignedSubjects = useMemo(() => {
    if (!data?.TeacherSubject) return [];

    const groups: Record<string, any> = {};
    data.TeacherSubject.forEach((item: any) => {
      const subjectName = item?.StageSubject?.Subject?.name || "بدون مادة";
      // Fallback: If section doesn't exist, try stage subject class
      const className = item?.Section?.Class?.name || item?.StageSubject?.Class?.name || "بدون صف";
      const sectionName = item?.Section?.name || "الكل";

      const key = `${subjectName}-${className}`;
      if (!groups[key]) {
        groups[key] = {
          subject: subjectName,
          className: className,
          sections: new Set<string>(),
        };
      }
      groups[key].sections.add(sectionName);
    });

    return Object.values(groups).map((g) => ({
      ...g,
      sections: Array.from(g.sections),
    }));
  }, [data]);

  return (
    <div className={`mx-auto w-full ${isModal ? "" : "max-w-7xl mb-20 px-4 md:px-0"}`}>
      {!isModal && <BackButton title="معلومات الأساتذة والكادر" />}

      {isFetching ? (
        <LoadingForm />
      ) : (
        <div className={`${!isModal ? "mt-6" : ""} flex flex-col gap-6`}>
          {/* Header Profile Card - CENTERED DESIGN */}
          <div className="flex flex-col items-center text-center mb-4">
            {/* Photo */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg bg-gray-100 dark:bg-gray-700 mb-4 flex-shrink-0">
              {data?.photo && data.photo !== "null" && data.photo !== "undefined" ? (
                <img
                  src={data.photo.startsWith("http") ? data.photo : `${BASE_URL}uploads/${data.photo}`}
                  alt={data?.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 text-white font-extrabold text-3xl">${data?.fullName?.charAt(0) || "?"}</div>`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 text-white font-extrabold text-3xl">
                  {data?.fullName?.charAt(0) || "?"}
                </div>
              )}
            </div>

            {/* Name */}
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
              {data?.fullName}
            </h2>

            {/* Code Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm mb-5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.617 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0114 15a3.989 3.989 0 01-2.667-1.017 1 1 0 01-.285-1.05l1.715-5.349L10 6.477 7.237 7.584l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 016 15a3.989 3.989 0 01-2.667-1.017 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.79l1.599.8L10 4.323V3a1 1 0 011-1z" />
              </svg>
              كود الموظف: {data?.User?.username || "—"}
            </div>

            {/* Quick Actions (Pill Buttons) */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <button
                onClick={() => {
                  if (onEdit) {
                    onEdit();
                  } else {
                    router.push(`/teacher/createOrUpdate?id=${id}`);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all border border-blue-200 dark:border-blue-800">
                <PenLine className="w-4 h-4" />
                تعديل المعلومات
              </button>

              {data?.User && (
                <button
                  onClick={() => setOpenChangePassword(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all border border-purple-200 dark:border-purple-800">
                  <Key className="w-4 h-4" />
                  {t("common.changePassword")}
                </button>
              )}

              {data?.User && (
                <button
                  onClick={() => setOpenResetPassword(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold text-sm hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all border border-amber-200 dark:border-amber-800">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t("StudentPage.resetPassword")}
                </button>
              )}

              {data?.User && (
                <button
                  onClick={() => setOpenSuspend(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600">
                  <Ban className="w-4 h-4" />
                  {t("StudentPage.suspendUserAccount")}
                </button>
              )}

              <button
                onClick={() => setOpenDelete(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition-all border border-red-200 dark:border-red-800">
                <Trash2 className="w-4 h-4" />
                {t("common.delete")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

            {/* Personal Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-800 dark:text-gray-200 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <UserCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </span>
                المعلومات الشخصية
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">الاسم الكامل</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 text-left">{data?.fullName || "—"}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">الجنس</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 text-left">{data?.Gender ? t(("TeacherPage." + data.Gender) as any) : "—"}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">تاريخ الميلاد</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 text-left font-mono">{data?.birth ? moment(data.birth).format("YYYY-MM-DD") : "—"}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">العنوان</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 text-left">{data?.address || "—"}</span>
                </div>
              </div>
            </div>

            {/* Workplace Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-800 dark:text-gray-200 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </span>
                الوظيفة والاتصال
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">تاريخ التعيين</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 text-left font-mono">{data?.hiringDate ? moment(data.hiringDate).format("YYYY-MM-DD") : "—"}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">رقم الهاتف الأساسي</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 text-left font-mono" dir="ltr">{data?.phone1 || "—"}</span>
                </div>
                {data?.phone2 && (
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">رقم هاتف بديل</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 text-left font-mono" dir="ltr">{data?.phone2 || "—"}</span>
                  </div>
                )}
                {data?.email && (
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">البريد الإلكتروني</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 text-left">{data?.email || "—"}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Assigned Subjects Sub-section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 w-full">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-800 dark:text-gray-200 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 4.4C3.439 4.9 0 8 0 8s3.439 3.1 10 3.6c6.561-.5 10-3.6 10-3.6S16.561 4.9 10 4.4z"></path></svg>
              </span>
              المواد والمراحل الدراسية المسندة
            </h3>

            {/* Custom Assigments Table */}
            <div className="flex flex-col gap-4">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-3 gap-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-3 text-sm font-extrabold text-[#8b5cf6] text-center">
                <div>المادة</div>
                <div>الصف والمرحلة</div>
                <div>الشعب</div>
              </div>

              {/* Table Body */}
              {assignedSubjects.length === 0 ? (
                <div className="text-center py-6 text-gray-400 font-bold text-sm bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  لا يوجد مواد دراسية مسندة حالياً
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {assignedSubjects.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition">
                      {/* Subject */}
                      <div className="flex justify-center w-full">
                        <span className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-extrabold px-6 py-2 rounded-xl w-full max-w-[200px] text-center text-sm shadow-sm border border-blue-100 dark:border-transparent">
                          {item.subject}
                        </span>
                      </div>
                      {/* Class */}
                      <div className="flex justify-center w-full mt-2 md:mt-0">
                        <span className="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 font-extrabold px-6 py-2 rounded-xl w-full max-w-[200px] text-center text-sm shadow-sm border border-green-100 dark:border-transparent">
                          {item.className}
                        </span>
                      </div>
                      {/* Sections */}
                      <div className="flex flex-wrap justify-center gap-2 w-full mt-2 md:mt-0">
                        {item.sections.map((sec: string, idx: number) => (
                          <span key={idx} className="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 font-bold px-4 py-1.5 rounded-lg text-xs shadow-sm border border-purple-100 dark:border-transparent whitespace-nowrap">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Modals */}
      <DeleteModel
        description={t("TeacherPage.Are-you-sure-you-want-to-delete-this-Teacher")}
        title={t("TeacherPage.DeleteTeacher")}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={handleRemove}
        isLoading={isLoadingTeacherRemove}
        name={data?.fullName ?? ""}
      />

      {data?.User && (
        <ChangePasswordByAdminModel
          data={{ username: data?.User?.username, userId: data?.User?.id }}
          isAdmin
          open={openChangePassword}
          setOpen={setOpenChangePassword}
        />
      )}

      {data?.User && (
        <DeleteModel
          description={t("StudentPage.Are-you-sure-you-want-to-suspend-this-User")}
          title={t("StudentPage.suspendUserAccount")}
          open={openSuspend}
          setOpen={setOpenSuspend}
          handleRemove={handleSuspend}
          isLoading={isLoadingUserRemove}
          name={data?.User?.username ?? ""}
        />
      )}

      {data?.User && (
        <ConfirmModel
          description={t("StudentPage.Are-you-sure-you-want-to-reset-password-for-this-User")}
          title={t("StudentPage.resetPassword")}
          open={openResetPassword}
          setOpen={setOpenResetPassword}
          handleConfirm={handleResetPassword}
          isLoading={isLoadingResetPassword}
          name={data?.User?.username ?? ""}
        />
      )}
    </div>
  );
};

export default PageComponent;
