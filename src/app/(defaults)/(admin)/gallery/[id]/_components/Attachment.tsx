import DeleteModel from "@/components/Model/DeleteModel";
import { getTranslation } from "@/ni18n/i18n";
import {
  IGallery,
  useGalleryCreateImageMutation,
  useGalleryRemoveImageMutation,
} from "@/services/admin/Gallery";

import React, { useState } from "react";
import { toast } from "react-toastify";

export const GalleryAttachment = ({ data }: { data: IGallery | undefined }) => {
  const { t } = getTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedImage(null);
  };

  const [openDelete, setOpenDelete] = useState(false);
  const [attachmentId, setAttachmentId] = useState<string | null>(null);
  const [
    GalleryAttachmentsRemove,
    { isLoading: isLoadingGalleryAttachmentsRemove },
  ] = useGalleryRemoveImageMutation();

  const handleRemove = async () => {
    try {
      await GalleryAttachmentsRemove({
        id: data?.id as any,
        body: {
          attachmentIds: [attachmentId as any],
        },
      }).unwrap();
      setOpenDelete(false);
      toast.success(t("common.deleted-successfully"), { autoClose: 15000 });
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error && error.message) {
        return toast.error(t(error.message), { autoClose: 15000 });
      }
      toast.error(error, { autoClose: 15000 });
    }
  };

  if (!data?.GalleryAttachment || data.GalleryAttachment.length === 0) {
    return (
      <div className="relative mt-4">
        {/* Floating background elements */}
        <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>

        <div className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
          {/* Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 via-slate-600/10 to-gray-600/10 backdrop-blur-sm"></div>
            <div className="relative px-6 py-4 border-b border-white/10 dark:border-gray-700/30">
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-500 via-slate-500 to-gray-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {t("GalleryPage.GalleryAttachment")}
                  </h2>
                </div>
                <AddAttachment data={data} />
              </div>
            </div>
          </div>

          {/* Empty state */}
          <div className="p-6">
            <div className="text-center py-12">
              <div className="space-y-4">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-slate-200 dark:from-gray-700 dark:to-slate-800 rounded-2xl rotate-6"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-slate-200 to-gray-200 dark:from-slate-800 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg
                      className="w-10 h-10 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {t("GalleryPage.No attachments available")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    {t(
                      "GalleryPage.This Lesson doesn't have any attached images"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-4">
      {/* Floating background elements */}
      <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>

      <div className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
        {/* Modern Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm"></div>
          <div className="relative px-6 py-4 border-b border-white/10 dark:border-gray-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {t("GalleryPage.GalleryAttachment")}
                  </h2>
                </div>
              </div>
              <AddAttachment data={data} />
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.GalleryAttachment.map((item, index) => (
              <div
                key={index}
                className="group relative backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-md hover:shadow-xl border border-white/30 dark:border-gray-700/30 overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => openLightbox(item.url)}
              >
                {/* Image container */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50 dark:from-gray-700 dark:via-blue-900/20 dark:to-purple-900/20 overflow-hidden">
                  <img
                    src={item.url}
                    alt={`Lesson attachment ${index + 1}`}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                    style={{ filter: "saturate(1.1) contrast(1.05)" }}
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="flex gap-2">
                      <button className="p-2 bg-black/20 backdrop-blur-md rounded-lg border border-white/30 text-white font-medium hover:bg-black/30 transition-all duration-200">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(item.url, "_blank");
                        }}
                        className="p-2 bg-black/20 backdrop-blur-md rounded-lg border border-white/30 text-white font-medium hover:bg-black/30 transition-all duration-200"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAttachmentId(item.id);
                          setOpenDelete(true);
                        }}
                        className="p-2 bg-red-600/70 backdrop-blur-md rounded-lg border border-white/30 text-white font-medium hover:bg-red-700 transition-all duration-200"
                        title={t("common.delete")}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image number indicator */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-semibold">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 z-10"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image */}
            <img
              src={selectedImage}
              alt="Lesson attachment"
              className="max-w-full max-h-full rounded-xl shadow-2xl"
              onClick={closeLightbox}
            />

            {/* Download button */}
            <button
              onClick={() => window.open(selectedImage, "_blank")}
              className="absolute bottom-4 right-4 px-4 py-2 bg-blue-600/80 backdrop-blur-md rounded-lg text-white font-medium hover:bg-blue-600 transition-all duration-200 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download
            </button>
          </div>
        </div>
      )}
      <DeleteModel
        description={t(
          "GalleryPage.Are-you-sure-you-want-to-delete-this-attachment"
        )}
        title={t("GalleryPage.DeleteAttachment")}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={handleRemove}
        isLoading={isLoadingGalleryAttachmentsRemove}
        name={t("Attachments")}
      />
    </div>
  );
};

export const AddAttachment = ({ data }: { data: IGallery | undefined }) => {
  const { t } = getTranslation();
  const [createAttachment, { isLoading: isLoadingCreateAttachment }] =
    useGalleryCreateImageMutation();
  const handleCreateAttachment = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("attachments", file);
      await createAttachment({
        id: data?.id as any,
        body: formData,
      });

      toast.success(t("common.added-successfully"), { autoClose: 15000 });
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error && error.message) {
        return toast.error(t(error.message), { autoClose: 15000 });
      }
      toast.error(error, { autoClose: 15000 });
    }
  };
  return (
    <label
      htmlFor="lesson-attachment-upload"
      className={`rtl:mr-auto ltr:ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold transition-all duration-200 cursor-pointer ${
        isLoadingCreateAttachment ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      {isLoadingCreateAttachment ? (
        <svg
          className="w-5 h-5 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      )}
      {t("GalleryPage.AddAttachment")}
      <input
        id="lesson-attachment-upload"
        type="file"
        accept="image/*"
        className="hidden"
        disabled={isLoadingCreateAttachment}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleCreateAttachment(file);
            e.target.value = ""; // reset input for next upload
          }
        }}
      />
    </label>
  );
};
