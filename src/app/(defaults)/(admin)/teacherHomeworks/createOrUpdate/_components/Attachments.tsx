import { getTranslation } from "@/ni18n/i18n";
import { FormikProps } from "formik";
import { useState, useRef, useEffect } from "react";

export const Attachments = (props: FormikProps<any>) => {
  const { t } = getTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Map<number, string>>(
    new Map()
  );
  const [uploadProgress, setUploadProgress] = useState<Map<number, number>>(
    new Map()
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const createImagePreview = (file: File, index: number) => {
    if (previewUrls.has(index)) {
      return previewUrls.get(index)!;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrls((prev) => new Map(prev).set(index, url));
    return url;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length > 0) {
      const current = props.values.attachments || [];
      props.setFieldValue("attachments", [...current, ...files]);
    }
  };

  const removeFile = (index: number) => {
    // Clean up preview URL
    if (previewUrls.has(index)) {
      URL.revokeObjectURL(previewUrls.get(index)!);
      const newUrls = new Map(previewUrls);
      newUrls.delete(index);
      setPreviewUrls(newUrls);
    }

    const newFiles = props.values.attachments.filter(
      (_: File, i: number) => i !== index
    );
    props.setFieldValue("attachments", newFiles);
  };

  const simulateUpload = (fileIndex: number) => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsUploading(false);
        setUploadProgress((prev) => {
          const newMap = new Map(prev);
          newMap.delete(fileIndex);
          return newMap;
        });
      } else {
        setUploadProgress((prev) => new Map(prev).set(fileIndex, progress));
      }
    }, 200);
  };

  const handleFileUpload = (files: File[]) => {
    const current = props.values.attachments || [];
    const startIndex = current.length;
    props.setFieldValue("attachments", [...current, ...files]);

    // Simulate upload progress for new files
    files.forEach((_, index) => {
      simulateUpload(startIndex + index);
    });
  };

  return (
    <div className="relative">
      {/* Floating background elements - smaller */}
      <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>

      <div className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
        {/* Compact Header */}
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
                    {t("TeacherHomeworksPage.img-info")}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {t(
                      "TeacherHomeworksPage.Upload-and-manage-your-assignment-images"
                    )}
                  </p>
                </div>
              </div>

              {props.values.attachments?.length > 0 && (
                <div className="px-3 py-1 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full border border-green-400/30">
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                    {props.values.attachments.length} Files
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Compact Drag & Drop Area */}
          <div className="relative group">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-500 transform ${
                dragOver
                  ? "border-blue-400 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 scale-[1.02] shadow-xl"
                  : "border-gray-300/50 dark:border-gray-600/50 hover:border-blue-400/70 hover:bg-gradient-to-br hover:from-gray-50/30 hover:to-blue-50/30 dark:hover:from-gray-800/30 dark:hover:to-blue-900/30"
              } cursor-pointer backdrop-blur-sm`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const files = Array.from(e.dataTransfer.files).filter((file) =>
                  file.type.startsWith("image/")
                );
                if (files.length > 0) {
                  handleFileUpload(files);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {/* Smaller animated background patterns */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 left-2 w-4 h-4 border border-blue-400 rounded-md animate-spin-slow"></div>
                <div className="absolute top-4 right-4 w-3 h-3 border border-purple-400 rounded-full animate-bounce"></div>
                <div className="absolute bottom-4 left-4 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-2 right-2 w-5 h-5 border border-indigo-400 rounded-lg animate-spin-slow"></div>
              </div>

              <div className="relative flex flex-col items-center gap-4">
                {/* Compact Upload Icon */}
                <div
                  className={`relative transition-all duration-500 ${
                    dragOver
                      ? "scale-110 animate-bounce"
                      : "group-hover:scale-105"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-md opacity-30 animate-pulse"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl transform rotate-2 group-hover:rotate-3 transition-transform duration-300">
                    <svg
                      className="w-8 h-8 text-white drop-shadow-lg"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                </div>

                <div className="space-y-3 max-w-md">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                    {dragOver ? "✨ Drop here!" : "🚀 Upload Images"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    Drag and drop your images here, or click to browse. JPG,
                    PNG, GIF up to 10MB each.
                  </p>
                  <div className="flex flex-wrap justify-center gap-1 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      JPG
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      PNG
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      GIF
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      Max 10MB
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 transition-transform group-hover:rotate-12"
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
                    {t("TeacherHomeworksPage.upload-attachments")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            name="attachments"
            id="attachments"
            className="hidden"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              handleFileUpload(files);
              e.target.value = "";
            }}
          />

          {/* Compact Image Previews Grid */}
          {props.values.attachments?.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-md"></div>
                  {t("TeacherHomeworksPage.selectedImages")} (
                  {props.values.attachments.length})
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    previewUrls.forEach((url) => URL.revokeObjectURL(url));
                    setPreviewUrls(new Map());
                    setUploadProgress(new Map());
                    props.setFieldValue("attachments", []);
                  }}
                  className="group px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center gap-1.5 text-sm">
                    <svg
                      className="w-3 h-3 group-hover:rotate-12 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    {t("TeacherHomeworksPage.clearAll")}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {props.values.attachments.map((file: File, index: number) => (
                  <div
                    key={index}
                    className="group relative backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-md hover:shadow-xl border border-white/30 dark:border-gray-700/30 overflow-hidden transition-all duration-300 hover:scale-105"
                  >
                    {/* Compact Upload Progress Overlay */}
                    {uploadProgress.has(index) && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <div className="text-white font-semibold text-sm">
                            {Math.round(uploadProgress.get(index)!)}%
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Compact Image Preview */}
                    <div className="relative aspect-square bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50 dark:from-gray-700 dark:via-blue-900/20 dark:to-purple-900/20 overflow-hidden">
                      <img
                        src={createImagePreview(file, index)}
                        alt={file.name}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                        style={{ filter: "saturate(1.1) contrast(1.05)" }}
                      />

                      {/* Compact file info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h4 className="font-semibold text-white truncate text-sm">
                          {file.name}
                        </h4>
                        <p className="text-xs text-gray-200">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>

                    {/* Compact Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-10 border-2 border-white dark:border-gray-800"
                      title={t("common.remove")}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="space-y-4">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-blue-200 dark:from-gray-700 dark:to-blue-800 rounded-2xl rotate-6"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-2xl -rotate-6"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-2xl flex items-center justify-center shadow-xl">
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
                    {t("TeacherHomeworksPage.NoImagesUploadedYet")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    {t("TeacherHomeworksPage.StartByUploadingImages")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
