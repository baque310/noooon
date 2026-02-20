"use client";

import React from "react";
import { BackButton } from "@/components/common/BackButton";
import { AttachmentsImage } from "@/components/common/LightboxImagePreview";
import { ItemList } from "@/components/common/ItemList";
import DeleteModel from "@/components/Model/DeleteModel";
import { getTranslation } from "@/ni18n/i18n";
import moment from "moment";

import { useStudentPage, StudentDetails } from "@/app/(defaults)/(admin)/student/_components/student";

const PageComponent = () => {
  const { t } = getTranslation();
  const { data, isFetching, isLoadingStudentRemove, openDelete, setOpenDelete, handleRemove } = useStudentPage();

  if (isFetching) {
    return (
      <div className="mx-auto my-0 max-md:max-w-[100%] mb-20">
        <div className="loader !bg-primary mx-auto my-10" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="mx-auto my-0 max-md:max-w-[100%] mb-20">
      <BackButton title={t("StudentPage.StudentInformation")} />

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

      <StudentDetails />

      <DeleteModel
        description={t("StudentPage.Are-you-sure-you-want-to-delete-this-Student")}
        title={t("StudentPage.DeleteStudent")}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={handleRemove}
        isLoading={isLoadingStudentRemove}
        name={data?.fullName ?? ""}
      />
    </div>
  );
};

export default PageComponent;
