"use client";

import React from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { getTranslation } from "@/ni18n/i18n";
import DeleteModel from "@/components/Model/DeleteModel";
import { useParams } from "next/navigation";

// Components
import {
  FloatingBackground,
  ParentProfileCard,
  PersonalInfoSection,
  SystemInfoSection,
  useParentPage,
} from "./index";

const PageComponent: React.FC = () => {
  const { t } = getTranslation();
  const params = useParams();
  const { id } = params;
  
  const {
    data,
    isFetching,
    isLoadingParentRemove,
    openDelete,
    setOpenDelete,
    handleRemove,
  } = useParentPage();

  return (
    <FloatingBackground>
      <div className="mb-8">
        <BackButton title={t("ParentPage.ParentInformation")} />
      </div>

      {isFetching ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingForm />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="xl:col-span-1">
            <ParentProfileCard data={data} parentId={id} />
          </div>

          {/* Right Column - Information Cards */}
          <div className="xl:col-span-2 space-y-8">
            <PersonalInfoSection data={data} />
            <SystemInfoSection data={data} />
          </div>
        </div>
      )}

      <DeleteModel
        description={t(
          "ParentPage.Are-you-sure-you-want-to-delete-this-Parent"
        )}
        title={t("ParentPage.DeleteParent")}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={handleRemove}
        isLoading={isLoadingParentRemove}
        name={data?.fullName ?? ""}
      />
    </FloatingBackground>
  );
};

export default PageComponent;
