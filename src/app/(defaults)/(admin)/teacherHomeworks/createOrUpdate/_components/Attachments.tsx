import { getTranslation } from "@/ni18n/i18n";
import { FormikProps } from "formik";
import { useState, useRef } from "react";
import { X, Paperclip, CloudUpload, FileText, ImageIcon, Trash2 } from "lucide-react";

interface AttachmentsProps extends FormikProps<any> {
  isModal?: boolean;
}

export const Attachments = (props: AttachmentsProps) => {
  const { isModal = false } = props;
  const { t } = getTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Map<number, string>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const createImagePreview = (file: File, index: number) => {
    if (previewUrls.has(index)) return previewUrls.get(index)!;
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrls((prev) => new Map(prev).set(index, url));
      return url;
    }
    return null;
  };

  const handleFileUpload = (files: File[]) => {
    const current = props.values.attachments || [];
    props.setFieldValue("attachments", [...current, ...files]);
  };

  const removeFile = (index: number) => {
    if (previewUrls.has(index)) {
      URL.revokeObjectURL(previewUrls.get(index)!);
      const newUrls = new Map(previewUrls);
      newUrls.delete(index);
      setPreviewUrls(newUrls);
    }
    const newFiles = props.values.attachments.filter((_: File, i: number) => i !== index);
    props.setFieldValue("attachments", newFiles);
  };

  if (isModal) {
    return (
      <div className="bg-white my-2 dark:bg-slate-800 p-5 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="text-[0.95rem] font-extrabold mb-4 text-slate-900 dark:text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            المرفقات
          </div>
          {props.values.attachments?.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full">
              {props.values.attachments.length} ملفات
            </span>
          )}
        </div>

        <div className="space-y-4">
          {props.values.attachments?.length > 0 && (
            <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
              {props.values.attachments.map((file: File, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl group transition-all hover:border-violet-200 dark:hover:border-violet-900">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                    {file.type.startsWith("image/") ? (
                      <img src={createImagePreview(file, index) || ""} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFileUpload(Array.from(e.dataTransfer.files));
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-3 ${
              dragOver
                ? "border-violet-600 bg-violet-50 dark:bg-violet-900/10 scale-[0.99]"
                : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-600"
            }`}>
            <CloudUpload className={`w-10 h-10 transition-transform duration-300 ${dragOver ? "text-violet-600 scale-110" : "text-slate-300 dark:text-slate-600"}`} />
            <div className="text-center">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">اسحب الملفات هنا أو انقر للاختيار</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">JPG, PNG, PDF up to 10MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              onChange={(e) => {
                handleFileUpload(Array.from(e.target.files || []));
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Original design for page view
  return (
    <div className="relative">
      <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>

      <div className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm"></div>
          <div className="relative px-6 py-4 border-b border-white/10 dark:border-gray-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {t("TeacherHomeworksPage.img-info")}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="relative group">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-500 ${
                dragOver ? "border-blue-400 bg-blue-50/50" : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
              } cursor-pointer`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFileUpload(Array.from(e.dataTransfer.files));
              }}
              onClick={() => fileInputRef.current?.click()}>
              <CloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold">{t("TeacherHomeworksPage.upload-attachments")}</h3>
              <p className="text-gray-500 text-sm mt-2">Drag and drop or click to browse</p>
            </div>
          </div>

          <input ref={fileInputRef} type="file" className="hidden" multiple onChange={(e) => handleFileUpload(Array.from(e.target.files || []))} />

          {props.values.attachments?.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {props.values.attachments.map((file: File, index: number) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                  {file.type.startsWith("image/") ? (
                    <img src={createImagePreview(file, index) || ""} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
