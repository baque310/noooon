"use client";

import React, { useState } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { ItemList } from "@/components/common/ItemList";

import { getTranslation } from "@/ni18n/i18n";
import { useLazyTeacherGetDataByIdQuery, useTeacherRemoveMutation } from "@/services/admin/teacher";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { ArrowIcons } from "@/components/common/icons/Actions";
import moment from "moment";
import { AttachmentsImage } from "@/components/common/LightboxImagePreview";
import DeleteModel from "@/components/Model/DeleteModel";
import { ChangePasswordByAdminModel } from "@/components/Model/ChangePasswordByAdminModel";
import { useUserManagerResetPasswordMutation, useUserRemoveMutation } from "@/services/Manager/User";
import ConfirmModel from "@/components/Model/ConfirmModel";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [openSuspend, setOpenSuspend] = useState(false);

  const [TeacherGetDataById, { currentData: data, isFetching }] = useLazyTeacherGetDataByIdQuery();
  const [TeacherRemove, { isLoading: isLoadingTeacherRemove }] = useTeacherRemoveMutation();
  const [UserManagerResetPassword, { isLoading: isLoadingResetPassword }] = useUserManagerResetPasswordMutation();

  useEffect(() => {
    if (id) {
      TeacherGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);

  const [UserRemove, { isLoading: isLoadingUserRemove }] = useUserRemoveMutation();

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

  const handleRemove = async () => {
    try {
      await TeacherRemove({ id: String(id) }).unwrap();
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

  const [openDelete, setOpenDelete] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openResetPassword, setOpenResetPassword] = useState(false);

  return (
    <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
      <BackButton title={t("TeacherPage.TeacherInformation")} />

      {isFetching ? (
        <LoadingForm />
      ) : (
        <>
          <AttachmentsImage className="my-2 h-44" src={String(data?.photo)} />
          <div className="CardDetails internalMenu ">
            <ItemList title={t("TeacherPage.fullName")} value={String(data?.fullName)} />
            <ItemList title={t("TeacherPage.Username")} value={String(data?.User?.username)} isCopyToClipboard />
            <ItemList title={t("TeacherPage.address")} value={String(data?.address ?? "")} />
          </div>
          <div className="CardDetails internalMenu ">
            {data?.TeacherSubject &&
              data?.TeacherSubject?.length > 0 &&
              data?.TeacherSubject?.map((item, index) => (
                <div key={index}>
                  <ItemList title={t("TeacherPage.SubjectName")} value={String(item?.StageSubject?.Subject?.name ?? "")} />
                  <ItemList title={t("TeacherPage.ClassName")} value={String(item?.Section?.Class?.name ?? "")} />
                  <ItemList title={t("TeacherPage.SectionName")} value={String(item?.Section?.name ?? "")} />
                </div>
              ))}
          </div>
          <div className="CardDetails internalMenu ">
            <ItemList title={t("TeacherPage.Gender")} value={data?.Gender ? t(("TeacherPage." + (data?.Gender ?? "")) as any) : ""} />
            <ItemList title={t("TeacherPage.phone1")} value={String(data?.phone1 ?? "")} />
            <ItemList title={t("TeacherPage.phone2")} value={String(data?.phone2 ?? "")} />
            <ItemList title={t("TeacherPage.email")} value={String(data?.email ?? "")} />
            <ItemList title={t("TeacherPage.birth")} value={data?.birth && moment(data?.birth).format("YYYY-MM-DD")} />
            <ItemList title={t("TeacherPage.hiringDate")} value={data?.hiringDate && moment(data?.hiringDate).format("YYYY-MM-DD")} />
            <ItemList title={t("common.updatedAt")} value={moment(data?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")} />
            <ItemList title={t("common.createdAt")} value={moment(data?.createdAt).format("YYYY-MM-DD hh:mm:ss A")} />
          </div>

          <div className="text-sm font-semibold text-black dark:text-white-dark  mt-2 mb-1 ">{t("common.settings")}</div>
          <div className="CardDetails internalMenu ">
            <ItemList
              props={{
                onClick: () => {
                  router.push(`/teacher/createOrUpdate?id=${id}`);
                },
              }}
              title={t("TeacherPage.update-info")}
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
                  setOpenSuspend(true);
                },
              }}
              title={<div className="text-danger">{t("StudentPage.suspendUserAccount")}</div>}
              value={<ArrowIcons className="rtl:rotate-180 text-danger/50" />}
            />
            <ItemList
              props={{
                onClick: () => {
                  setOpenDelete(true);
                },
              }}
              title={<div className="text-danger">{t("common.delete")}</div>}
              value={<ArrowIcons className="rtl:rotate-180 text-danger/50" />}
            />
          </div>
        </>
      )}

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
          data={{
            username: data?.User?.username,
            userId: data?.User?.id,
          }}
          isAdmin
          open={openChangePassword}
          setOpen={setOpenChangePassword}
        />
      )}

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
