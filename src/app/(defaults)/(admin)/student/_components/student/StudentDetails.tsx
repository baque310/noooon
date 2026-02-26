"use client";

import React, { useState } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { getTranslation } from "@/ni18n/i18n";
import { useLazyStudentGetDataByIdQuery, useStudentRemoveMutation } from "@/services/admin/student";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { AttachmentsImage } from "@/components/common/LightboxImagePreview";
import { BASE_URL } from "@/services/api";
import DeleteModel from "@/components/Model/DeleteModel";
import { ChangePasswordByAdminModel } from "@/components/Model/ChangePasswordByAdminModel";
import { useUserRemoveMutation, useUserManagerResetPasswordMutation } from "@/services/Manager/User";
import ConfirmModel from "@/components/Model/ConfirmModel";

interface PageComponentProps {
  id?: string;
  isModal?: boolean;
  onEdit?: () => void;
  onClose?: () => void;
}

const StudentDetails = ({ id: propId, isModal = false, onEdit, onClose }: PageComponentProps) => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const id = propId || params?.id;
  const [StudentGetDataById, { currentData: data, isFetching }] = useLazyStudentGetDataByIdQuery();
  const [StudentRemove, { isLoading: isLoadingStudentRemove }] = useStudentRemoveMutation();
  const [UserRemove, { isLoading: isLoadingUserRemove }] = useUserRemoveMutation();
  const [UserManagerResetPassword, { isLoading: isLoadingResetPassword }] = useUserManagerResetPasswordMutation();

  useEffect(() => {
    if (id) {
      StudentGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);

  const handleRemove = async () => {
    try {
      await StudentRemove({ id: String(id) }).unwrap();
      toast.success(t("common.deleted-successfully"), { autoClose: 15000 });
      if (isModal && onClose) {
        onClose();
      } else {
        router.back();
      }
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error && error.message) {
        return toast.error(t(error.message), { autoClose: 15000 });
      }
      toast.error(error, { autoClose: 15000 });
    }
  };

  const [openDelete, setOpenDelete] = useState(false);
  const [openSuspend, setOpenSuspend] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openResetPassword, setOpenResetPassword] = useState(false);

  const handleSuspend = async () => {
    try {
      await UserRemove({ id: String(data?.User?.id) }).unwrap();
      toast.success(t("StudentPage.suspend-successfully"), { autoClose: 15000 });
      setOpenSuspend(false);
      if (isModal && onClose) {
        onClose();
      } else {
        router.back();
      }
    } catch (error: any) {
      console.error("Failed to suspend user:", error);
      if (error && error.message) {
        return toast.error(t(error.message), { autoClose: 15000 });
      }
      toast.error(error, { autoClose: 15000 });
    }
  };

  const handleResetPassword = async () => {
    try {
      await UserManagerResetPassword({ id: String(data?.User?.id) }).unwrap();
      toast.success(t("StudentPage.password-reset-successfully"), { autoClose: 15000 });
      setOpenResetPassword(false);
    } catch (error: any) {
      console.error("Failed to reset password:", error);
      if (error && error.message) {
        return toast.error(t(error.message), { autoClose: 15000 });
      }
      toast.error(error, { autoClose: 15000 });
    }
  };

  // Helper to get photo URL
  const getPhotoUrl = () => {
    if (data?.photo && data.photo !== "null" && data.photo !== "undefined" && data.photo.trim() !== "") {
      return data.photo.startsWith("http") ? data.photo : `${BASE_URL}uploads/${data.photo}`;
    }
    return null;
  };

  const enrollment = data?.StudentEnrollment?.[0];

  return (
    <div className="mx-auto my-0 max-md:max-w-[100%]">
      {isFetching ? (
        <LoadingForm />
      ) : (
        <>
          {/* ===== Profile Header ===== */}
          <div className="flex flex-col items-center text-center mb-6">
            {/* Photo */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg bg-gray-100 dark:bg-gray-700 mb-4">
              {getPhotoUrl() ? (
                <img
                  src={getPhotoUrl()!}
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

            {/* Student Code Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm mb-5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.617 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0114 15a3.989 3.989 0 01-2.667-1.017 1 1 0 01-.285-1.05l1.715-5.349L10 6.477 7.237 7.584l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 016 15a3.989 3.989 0 01-2.667-1.017 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.79l1.599.8L10 4.323V3a1 1 0 011-1z" />
              </svg>
              كود الطالب: {data?.User?.username || "—"}
            </div>
          </div>

          {/* ===== Action Buttons ===== */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <button
              onClick={() => {
                if (onEdit) {
                  onEdit();
                } else {
                  router.push(`/studentTest/createOrUpdate?id=${id}`);
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all border border-blue-200 dark:border-blue-800">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              {t("StudentPage.update-info")}
            </button>

            {data?.User && (
              <button
                onClick={() => setOpenChangePassword(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all border border-purple-200 dark:border-purple-800">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
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

            <button
              onClick={() => setOpenSuspend(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
              {t("StudentPage.suspendUserAccount")}
            </button>

            <button
              onClick={() => setOpenDelete(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition-all border border-red-200 dark:border-red-800">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {t("common.delete")}
            </button>
          </div>

          {/* ===== Info Cards ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

            {/* Personal Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-800 dark:text-gray-200 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </span>
                المعلومات الشخصية
              </h3>
              <div className="space-y-3">
                <InfoRow label={t("StudentPage.fullName")} value={data?.fullName} />
                <InfoRow label={t("StudentPage.gender")} value={t(data?.gender?.toLowerCase() as any)} />
                <InfoRow label={t("StudentPage.fullNameParent")} value={data?.Parent?.fullName} />
                <InfoRow label={t("StudentPage.birth")} value={data?.birth && moment(data?.birth).format("YYYY-MM-DD")} />
                <InfoRow label={t("StudentPage.address")} value={data?.address} />
                <InfoRow label={t("StudentPage.phone1")} value={data?.phone1} />
                {data?.phone2 && <InfoRow label={t("StudentPage.phone2")} value={data?.phone2} />}
                {data?.email && <InfoRow label={t("StudentPage.email")} value={data?.email} />}
              </div>
            </div>

            {/* Registration Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-800 dark:text-gray-200 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
                  </svg>
                </span>
                سجل التسجيل
              </h3>
              <div className="space-y-3">
                <InfoRow label={t("StudentPage.StageName")} value={enrollment?.Stage ? t(enrollment.Stage.name?.toLowerCase() as any) : undefined} />
                <InfoRow label={t("StudentPage.ClassName")} value={enrollment?.Class ? t(enrollment.Class.name?.toLowerCase() as any) : undefined} />
                <InfoRow label={t("StudentPage.SectionName")} value={enrollment?.Section ? t(enrollment.Section.name?.toLowerCase() as any) : undefined} />
                <InfoRow label={t("StudentPage.enrollmentDate")} value={data?.enrollmentDate && moment(data?.enrollmentDate).format("YYYY-MM-DD")} />
                <InfoRow label={t("common.createdAt")} value={data?.createdAt && moment(data?.createdAt).format("YYYY-MM-DD")} />
                <InfoRow label={t("common.updatedAt")} value={data?.updatedAt && moment(data?.updatedAt).format("YYYY-MM-DD")} />
              </div>
            </div>
          </div>

          {/* ===== Attachments / Documents Section ===== */}
          {data?.User?.attachments && data.User.attachments.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-4">
              <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-800 dark:text-gray-200 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <span className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </span>
                المستمسكات والوثائق المرفوعة
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 mr-auto">
                  ({data.User.attachments.length})
                </span>
              </h3>

              <div className="space-y-4">
                {data.User.attachments.map((att) => (
                  <div key={att.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    {/* Document Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="text-sm font-extrabold text-gray-800 dark:text-gray-200">
                          {att.AttType?.title || "وثيقة"}
                        </span>
                      </div>
                      <ApprovalBadge status={att.approval_status} />
                    </div>

                    {/* Document Images */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {att.url_face && (
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">الوجه الأمامي</p>
                          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <AttachmentsImage
                              className="w-full h-36"
                              src={att.url_face.startsWith("http") ? att.url_face : `${BASE_URL}uploads/${att.url_face}`}
                            />
                          </div>
                        </div>
                      )}
                      {att.url_back && (
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">الوجه الخلفي</p>
                          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <AttachmentsImage
                              className="w-full h-36"
                              src={att.url_back.startsWith("http") ? att.url_back : `${BASE_URL}uploads/${att.url_back}`}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rejection reason or notes */}
                    {att.approval_reason && (
                      <div className="mt-3 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs font-bold text-red-700 dark:text-red-300">{att.approval_reason}</p>
                      </div>
                    )}
                    {att.notes && (
                      <div className="mt-2 flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                        <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs font-bold text-blue-700 dark:text-blue-300">{att.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </>
      )}

      <DeleteModel
        description={t("StudentPage.Are-you-sure-you-want-to-delete-this-Student")}
        title={t("StudentPage.DeleteStudent")}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={handleRemove}
        isLoading={isLoadingStudentRemove}
        name={data?.fullName ?? ""}
      />

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

      {data?.User && (
        <ChangePasswordByAdminModel
          data={{
            username: data?.User?.username,
            userId: data?.User?.id,
          }}
          isAdmin
          open={openChangePassword}
          setOpen={setOpenChangePassword}
        />
      )}
    </div>
  );
};

/* ===== Helper Component: Info Row ===== */
const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 text-left" dir="auto">
      {value || "—"}
    </span>
  </div>
);

/* ===== Helper Component: Approval Badge ===== */
const ApprovalBadge = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    approved: { label: "مقبول", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
    pending: { label: "قيد المراجعة", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
    rejected: { label: "مرفوض", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
  };
  const s = config[status?.toLowerCase()] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status?.toLowerCase() === "approved" ? "bg-emerald-500" : status?.toLowerCase() === "rejected" ? "bg-red-500" : "bg-amber-500"}`} />
      {s.label}
    </span>
  );
};

export default StudentDetails;
