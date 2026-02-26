"use client";

import React, { useState } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { ItemList } from "@/components/common/ItemList";

import { getTranslation } from "@/ni18n/i18n";
import {
  useLazyGalleryGetDataByIdQuery,
  useGalleryRemoveMutation,
} from "@/services/admin/Gallery";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { ArrowIcons } from "@/components/common/icons/Actions";
import moment from "moment";
import { AttachmentsImage } from "@/components/common/LightboxImagePreview";
import DeleteModel from "@/components/Model/DeleteModel";
import { GalleryAttachment } from "./Attachment";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [GalleryGetDataById, { currentData: data, isFetching }] =
    useLazyGalleryGetDataByIdQuery();
  const [GalleryRemove, { isLoading: isLoadingGalleryRemove }] =
    useGalleryRemoveMutation();

  useEffect(() => {
    if (id) {
      GalleryGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);
  const handleRemove = async () => {
    try {
      await GalleryRemove({ id: String(id) }).unwrap();
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

  const [openDelete, setOpenDelete] = useState(false);
  return (
    <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-4xl mb-20">
      <BackButton title={t("GalleryPage.GalleryInformation")} />

      {isFetching ? (
        <LoadingForm />
      ) : (
        <>
          <div className="CardDetails internalMenu ">
            <ItemList
              title={t("GalleryPage.title")}
              value={String(data?.title)}
            />
            <ItemList
              title={t("common.updatedAt")}
              value={moment(data?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")}
            />
            <ItemList
              title={t("common.createdAt")}
              value={moment(data?.createdAt).format("YYYY-MM-DD hh:mm:ss A")}
            />
          </div>

          <GalleryAttachment data={data} />

          <div className="text-sm font-semibold text-black dark:text-white-dark  mt-2 mb-1 ">
            {t("common.settings")}
          </div>
          <div className="CardDetails internalMenu ">
            <ItemList
              props={{
                onClick: () => {
                  router.push(`/gallery/createOrUpdate?id=${id}`);
                },
              }}
              title={t("GalleryPage.update-info")}
              value={<ArrowIcons className="rtl:rotate-180 text-[#000]/50" />}
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
        description={t(
          "GalleryPage.Are-you-sure-you-want-to-delete-this-Gallery"
        )}
        title={t("GalleryPage.DeleteGallery")}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={handleRemove}
        isLoading={isLoadingGalleryRemove}
        name={data?.title ?? ""}
      />
    </div>
  );
};

export default PageComponent;
