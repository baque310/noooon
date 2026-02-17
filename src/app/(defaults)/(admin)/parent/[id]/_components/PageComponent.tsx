"use client";

import React, { useState } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { ItemList } from "@/components/common/ItemList";

import { getTranslation } from "@/ni18n/i18n";
import { useLazyParentGetDataByIdQuery, useParentRemoveMutation } from "@/services/admin/parent";
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

  const [ParentGetDataById, { currentData: data, isFetching }] = useLazyParentGetDataByIdQuery();
  const [ParentRemove, { isLoading: isLoadingParentRemove }] = useParentRemoveMutation();
  const [UserManagerResetPassword, { isLoading: isLoadingResetPassword }] = useUserManagerResetPasswordMutation();

  const [openDelete, setOpenDelete] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openResetPassword, setOpenResetPassword] = useState(false);

  useEffect(() => {
    if (id) {
      ParentGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);

  const handleRemove = async () => {
    try {
      await ParentRemove({ id: String(id) }).unwrap();
      toast.success(t("common.deleted-successfully"), { autoClose: 15000 });
      router.back();
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error && error.message == `Foreign key constraint failed on the field. More details: {"modelName":"User","field_name":"userId"}`) {
        return toast.error(t("Cannot delete user: User has related records"), {
          autoClose: 15000,
        });
      }
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
    <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
      <BackButton title={t("ParentPage.ParentInformation")} />

      {isFetching ? (
        <LoadingForm />
      ) : (
        <>
          <AttachmentsImage className="my-2 h-44" src={String(data?.photo)} />
          <div className="CardDetails internalMenu ">
            <ItemList title={t("ParentPage.fullName")} value={String(data?.fullName)} />
            <ItemList title={t("ParentPage.Username")} value={String(data?.User?.username)} isCopyToClipboard />
            <ItemList title={t("ParentPage.gender")} value={t(data?.gender.toLowerCase() as any)} />
            <ItemList title={t("ParentPage.address")} value={String(data?.address)} />
            <ItemList title={t("ParentPage.phone1")} value={String(data?.phone1 ?? "")} />
            <ItemList title={t("ParentPage.phone2")} value={String(data?.phone2 ?? "")} />
            <ItemList title={t("ParentPage.email")} value={String(data?.email ?? "")} />
            <ItemList title={t("ParentPage.birth")} value={data?.birth && moment(data?.birth).format("YYYY-MM-DD")} />
            <ItemList title={t("common.updatedAt")} value={moment(data?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")} />
            <ItemList title={t("common.createdAt")} value={moment(data?.createdAt).format("YYYY-MM-DD hh:mm:ss A")} />
          </div>

          <div className="text-sm font-semibold text-black dark:text-white-dark mt-2 mb-1">{t("common.settings")}</div>
          <div className="CardDetails internalMenu ">
            <ItemList
              props={{
                onClick: () => {
                  router.push(`/parent/createOrUpdate?id=${id}`);
                },
              }}
              title={t("ParentPage.update-info")}
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
          </div>
        </>
      )}

      <DeleteModel
        description={t("ParentPage.Are-you-sure-you-want-to-delete-this-Parent")}
        title={t("ParentPage.DeleteParent")}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={handleRemove}
        isLoading={isLoadingParentRemove}
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
