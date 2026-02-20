"use client";

import React, { useState } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { ItemList } from "@/components/common/ItemList";

import { getTranslation } from "@/ni18n/i18n";
import { useLazyStudentGetDataByIdQuery, useStudentRemoveMutation } from "@/services/admin/student";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { ArrowIcons } from "@/components/common/icons/Actions";
import moment from "moment";
import { AttachmentsImage } from "@/components/common/LightboxImagePreview";
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

const PageComponent = ({ id: propId, isModal = false, onEdit, onClose }: PageComponentProps) => {
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
      router.back();
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error && error.message) {
        return toast.error(t(error.message), { autoClose: 15000 });
      }
      toast.error(error, { autoClose: 15000 });
    }
  };

  // Suspend user logic
  const [openDelete, setOpenDelete] = useState(false);
  const [openSuspend, setOpenSuspend] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openResetPassword, setOpenResetPassword] = useState(false);

  const handleSuspend = async () => {
    try {
      await UserRemove({ id: String(data?.User?.id) }).unwrap();
      toast.success(t("StudentPage.suspend-successfully"), { autoClose: 15000 });
      setOpenSuspend(false);
      router.back();
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

  return (
    <div className="mx-auto my-0 max-md:max-w-[100%] mb-20">
      <BackButton title={t("StudentPage.StudentInformation")} />
      {isFetching ? (
        <LoadingForm />
      ) : (
        <>
          <AttachmentsImage className="my-2 h-44" src={String(data?.photo)} />
          <div className="CardDetails internalMenu ">
            <ItemList title={t("StudentPage.fullName")} value={String(data?.fullName)} />
            <ItemList title={t("StudentPage.Username")} value={String(data?.User?.username)} isCopyToClipboard />
            <ItemList title={t("StudentPage.fullNameParent")} value={data?.Parent?.fullName} isCopyToClipboard />

            <ItemList title={t("StudentPage.StageName")} value={t(data?.StudentEnrollment?.[0]?.Stage?.name?.toLowerCase() as any)} />
            <ItemList title={t("StudentPage.ClassName")} value={t(data?.StudentEnrollment?.[0]?.Class?.name?.toLowerCase() as any)} />
            <ItemList title={t("StudentPage.SectionName")} value={t(data?.StudentEnrollment?.[0]?.Section?.name?.toLowerCase() as any)} />

            <ItemList title={t("StudentPage.gender")} value={t(data?.gender?.toLowerCase() as any)} />
            <ItemList title={t("StudentPage.address")} value={String(data?.address)} />
            <ItemList title={t("StudentPage.phone1")} value={String(data?.phone1)} />
            <ItemList title={t("StudentPage.phone2")} value={String(data?.phone2)} />
            <ItemList title={t("StudentPage.email")} value={String(data?.email)} />
            <ItemList title={t("StudentPage.birth")} value={data?.birth && moment(data?.birth).format("YYYY-MM-DD")} />
            <ItemList title={t("StudentPage.enrollmentDate")} value={data?.enrollmentDate && moment(data?.enrollmentDate).format("YYYY-MM-DD")} />
            <ItemList title={t("common.updatedAt")} value={moment(data?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")} />
            <ItemList title={t("common.createdAt")} value={moment(data?.createdAt).format("YYYY-MM-DD hh:mm:ss A")} />
          </div>

          <div className="text-sm font-semibold text-black dark:text-white-dark  mt-2 mb-1 ">{t("common.settings")}</div>
          <div className="CardDetails internalMenu ">
            <ItemList
              props={{
                onClick: () => {
                  router.push(`/student/createOrUpdate?id=${id}`);
                },
              }}
              title={t("StudentPage.update-info")}
              value={<ArrowIcons className="rtl:rotate-180 text-[#000]/50" />}
            />
            {data?.User && (
              <ItemList
                props={{
                  onClick: () => {
                    setOpenChangePassword(true);
                  },
                }}
                title={<div className="text-[#000]">{t("common.changePassword")}</div>}
                value={<ArrowIcons className="rtl:rotate-180 text-[#000]/50" />}
              />
            )}
            {data?.User && (
              <ItemList
                props={{
                  onClick: () => {
                    setOpenResetPassword(true);
                  },
                }}
                title={<div className="text-[#000]">{t("StudentPage.resetPassword")}</div>}
                value={<ArrowIcons className="rtl:rotate-180 text-[#000]/50" />}
              />
            )}
            <ItemList
              props={{
                onClick: () => {
                  setOpenDelete(true);
                },
              }}
              title={<div className="text-danger">{t("common.delete")}</div>}
              value={<ArrowIcons className="rtl:rotate-180 text-danger/50" />}
            />
            <ItemList
              props={{
                onClick: () => {
                  setOpenSuspend(true);
                },
              }}
              title={<div className="text-danger">{t("StudentPage.suspendUserAccount")}</div>}
              value={<ArrowIcons className="rtl:rotate-180 text-danger/50" />}
            />
          </div>
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

      {/* Suspend User Modal */}
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

      {/* Reset Password Modal */}
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

export default PageComponent;
