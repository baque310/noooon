"use client";
import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Heart,
  Star,
  BookOpen,
  Lightbulb,
  Eye,
  Smile,
  Trophy,
  Flame,
  Leaf,
  Rocket,
  Sprout,
  Flag,
  Cloud,
  Crown,
  Sun,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  CheckCircle,
  Medal,
  Frown,
  Meh,
  Sliders,
  Tags,
  SquarePen,
  Trash2,
  PlusCircle,
} from "lucide-react";
import {
  useBehaviorSectionCreateMutation,
  useBehaviorSectionGetDataQuery,
  useBehaviorSectionRemoveMutation,
  useBehaviorSectionUpdateMutation,
} from "@/services/admin/BehaviorSection";
import { useBehaviorTypeCreateMutation, useBehaviorTypeGetDataQuery, useBehaviorTypeRemoveMutation, useBehaviorTypeUpdateMutation } from "@/services/admin/BehaviorType";
import Model from "@/components/Model";
import DeleteModel from "@/components/Model/DeleteModel";

// Memoized Metric Card Component
const MetricCard = React.memo(
  ({ metric, style, onEdit, onDelete }: { metric: any; style: any; onEdit: (id: string, name: string) => void; onDelete: (id: string, name: string) => void }) => {
    const IconComponent = style.icon;
    return (
      <div className="group flex items-center justify-between rounded-[18px] border border-[#f1f5f9] bg-white px-6 py-[18px] transition-all hover:border-violet-500 hover:bg-[#fafbff]">
        <div className="flex items-center gap-4">
          <div className={`flex h-[42px] w-[42px] items-center justify-center rounded-xl ${style.bg} ${style.text}`}>
            <IconComponent size={20} />
          </div>
          <div>
            <div className="text-[0.95rem] font-extrabold text-slate-800">{metric.name}</div>
          </div>
        </div>
        <div className="flex gap-2 transition-opacity group-hover:opacity-100 md:opacity-0">
          <button
            onClick={() => onEdit(metric.id, metric.name)}
            className="flex items-center justify-center gap-1.5 rounded-[10px] bg-[#f1f5f9] px-3 py-2 text-[0.8rem] font-bold text-slate-500 transition-all hover:bg-violet-600 hover:text-white"
            title="تعديل الاسم">
            <SquarePen size={14} /> <span>تعديل</span>
          </button>
          <button
            onClick={() => onDelete(metric.id, metric.name)}
            className="flex items-center justify-center gap-1.5 rounded-[10px] bg-[#fff1f2] px-3 py-2 text-[0.8rem] font-bold text-[#f43f5e] transition-all hover:bg-[#ffe4e6] hover:text-[#e11d48]"
            title="حذف المعيار">
            <Trash2 size={14} /> <span>حذف</span>
          </button>
        </div>
      </div>
    );
  },
);
MetricCard.displayName = "MetricCard";

// Memoized Type Card Component
const TypeCard = React.memo(
  ({ type, style, onEdit, onDelete }: { type: any; style: any; onEdit: (id: string, name: string) => void; onDelete: (id: string, name: string) => void }) => {
    const IconComponent = style.icon;
    return (
      <div className="group flex items-center justify-between rounded-[18px] border border-[#f1f5f9] bg-white px-6 py-[18px] transition-all hover:border-emerald-500 hover:bg-[#fafbff]">
        <div className="flex items-center gap-4">
          <div className={`flex h-[42px] w-[42px] items-center justify-center rounded-xl ${style.bg} ${style.text}`}>
            <IconComponent size={20} />
          </div>
          <div>
            <div className="text-[0.95rem] font-extrabold text-slate-800">{type.name}</div>
          </div>
        </div>
        <div className="flex gap-2 transition-opacity group-hover:opacity-100 md:opacity-0">
          <button
            onClick={() => onEdit(type.id, type.name)}
            className="flex items-center justify-center gap-1.5 rounded-[10px] bg-[#f1f5f9] px-3 py-2 text-[0.8rem] font-bold text-slate-500 transition-all hover:bg-emerald-600 hover:text-white"
            title="تعديل الاسم">
            <SquarePen size={14} /> <span>تعديل</span>
          </button>
          <button
            onClick={() => onDelete(type.id, type.name)}
            className="flex items-center justify-center gap-1.5 rounded-[10px] bg-[#fff1f2] px-3 py-2 text-[0.8rem] font-bold text-[#f43f5e] transition-all hover:bg-[#ffe4e6] hover:text-[#e11d48]"
            title="حذف نوع السلوك">
            <Trash2 size={14} /> <span>حذف</span>
          </button>
        </div>
      </div>
    );
  },
);
TypeCard.displayName = "TypeCard";

export default function SettingsView() {
  // BehaviorSection hooks
  const { data: behaviorSections, isLoading } = useBehaviorSectionGetDataQuery({});
  const [createBehaviorSection] = useBehaviorSectionCreateMutation();
  const [updateBehaviorSection] = useBehaviorSectionUpdateMutation();
  const [removeBehaviorSection, { isLoading: isLoadingDeleteMetric }] = useBehaviorSectionRemoveMutation();

  // BehaviorType hooks
  const { data: behaviorTypes, isLoading: isLoadingTypes } = useBehaviorTypeGetDataQuery({});
  const [createBehaviorType] = useBehaviorTypeCreateMutation();
  const [updateBehaviorType] = useBehaviorTypeUpdateMutation();
  const [removeBehaviorType, { isLoading: isLoadingDeleteType }] = useBehaviorTypeRemoveMutation();

  // Modal State for BehaviorSection
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [metricName, setMetricName] = useState("");

  // Modal State for BehaviorType
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [typeModalMode, setTypeModalMode] = useState<"add" | "edit">("add");
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [typeName, setTypeName] = useState("");

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingMetricId, setDeletingMetricId] = useState<string | null>(null);
  const [deletingMetricName, setDeletingMetricName] = useState("");
  const [isDeleteTypeModalOpen, setIsDeleteTypeModalOpen] = useState(false);
  const [deletingTypeId, setDeletingTypeId] = useState<string | null>(null);
  const [deletingTypeName, setDeletingTypeName] = useState("");

  // Memoized style variants with Lucide React icons
  const styleVariants = useMemo(
    () => [
      { bg: "bg-rose-50", text: "text-rose-500", icon: Heart },
      { bg: "bg-emerald-50", text: "text-emerald-500", icon: Star },
      { bg: "bg-blue-50", text: "text-blue-500", icon: BookOpen },
      // { bg: "bg-purple-50", text: "text-purple-500", icon: HandPointer },
      { bg: "bg-amber-50", text: "text-amber-500", icon: Lightbulb },
      { bg: "bg-cyan-50", text: "text-cyan-500", icon: Eye },
      { bg: "bg-pink-50", text: "text-pink-500", icon: Smile },
      { bg: "bg-indigo-50", text: "text-indigo-500", icon: Trophy },
      { bg: "bg-orange-50", text: "text-orange-500", icon: Flame },
      { bg: "bg-teal-50", text: "text-teal-500", icon: Leaf },
      { bg: "bg-violet-50", text: "text-violet-500", icon: Rocket },
      { bg: "bg-lime-50", text: "text-lime-500", icon: Sprout },
      { bg: "bg-red-50", text: "text-red-500", icon: Flag },
      { bg: "bg-sky-50", text: "text-sky-500", icon: Cloud },
      { bg: "bg-fuchsia-50", text: "text-fuchsia-500", icon: Crown },
      { bg: "bg-yellow-50", text: "text-yellow-500", icon: Sun },
    ],
    [],
  );

  const typeStyleVariants = useMemo(
    () => [
      { bg: "bg-emerald-50", text: "text-emerald-500", icon: ThumbsUp },
      { bg: "bg-rose-50", text: "text-rose-500", icon: ThumbsDown },
      { bg: "bg-amber-50", text: "text-amber-500", icon: MinusCircle },
      { bg: "bg-blue-50", text: "text-blue-500", icon: Star },
      { bg: "bg-purple-50", text: "text-purple-500", icon: Smile },
      { bg: "bg-orange-50", text: "text-orange-500", icon: Meh },
      { bg: "bg-red-50", text: "text-red-500", icon: Frown },
      { bg: "bg-teal-50", text: "text-teal-500", icon: CheckCircle },
      { bg: "bg-pink-50", text: "text-pink-500", icon: Heart },
      { bg: "bg-indigo-50", text: "text-indigo-500", icon: Medal },
    ],
    [],
  );

  // Handlers
  const openAddModal = () => {
    setModalMode("add");
    setMetricName("");
    setEditingId(null);
    setIsModalOpen(true);
  };
  const openEditModal = (id: string, name: string) => {
    setModalMode("edit");
    setMetricName(name);
    setEditingId(id);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setMetricName("");
    setEditingId(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricName.trim()) return toast.warn("يجب كتابة اسم المعيار!");
    try {
      if (modalMode === "add") {
        await createBehaviorSection({ name: metricName }).unwrap();
        toast.success("تم إضافة المعيار بنجاح");
      } else if (editingId) {
        await updateBehaviorSection({ id: editingId, body: { name: metricName } }).unwrap();
        toast.success("تم تعديل المعيار بنجاح");
      }
      closeModal();
    } catch {
      toast.error("حدث خطأ أثناء العملية");
    }
  };
  const openDeleteMetricModal = (id: string, name: string) => {
    setDeletingMetricId(id);
    setDeletingMetricName(name);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteMetric = async () => {
    if (!deletingMetricId) return;
    try {
      await removeBehaviorSection({ id: deletingMetricId }).unwrap();
      toast.success("تم حذف المعيار بنجاح");
      setIsDeleteModalOpen(false);
      setDeletingMetricId(null);
      setDeletingMetricName("");
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const openAddTypeModal = () => {
    setTypeModalMode("add");
    setTypeName("");
    setEditingTypeId(null);
    setIsTypeModalOpen(true);
  };
  const openEditTypeModal = (id: string, name: string) => {
    setTypeModalMode("edit");
    setTypeName(name);
    setEditingTypeId(id);
    setIsTypeModalOpen(true);
  };
  const closeTypeModal = () => {
    setIsTypeModalOpen(false);
    setTypeName("");
    setEditingTypeId(null);
  };
  const handleTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) return toast.warn("يجب كتابة اسم نوع السلوك!");
    try {
      if (typeModalMode === "add") {
        await createBehaviorType({ name: typeName }).unwrap();
        toast.success("تم إضافة نوع السلوك بنجاح");
      } else if (editingTypeId) {
        await updateBehaviorType({ id: editingTypeId, body: { name: typeName } }).unwrap();
        toast.success("تم تعديل نوع السلوك بنجاح");
      }
      closeTypeModal();
    } catch {
      toast.error("حدث خطأ أثناء العملية");
    }
  };
  const openDeleteTypeModal = (id: string, name: string) => {
    setDeletingTypeId(id);
    setDeletingTypeName(name);
    setIsDeleteTypeModalOpen(true);
  };

  const handleDeleteType = async () => {
    if (!deletingTypeId) return;
    try {
      await removeBehaviorType({ id: deletingTypeId }).unwrap();
      toast.success("تم حذف نوع السلوك بنجاح");
      setIsDeleteTypeModalOpen(false);
      setDeletingTypeId(null);
      setDeletingTypeName("");
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <>
      {/* Behavior Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/60 p-8 shadow-[0_10px_25px_-5px_rgba(139,92,246,0.1),0_8px_10px_-6px_rgba(0,0,0,0.05)] backdrop-blur-[10px]">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-3 text-xl font-extrabold text-violet-600">
            <Sliders size={20} /> معايير التقييم المفعلة
          </h3>
          <span className="rounded-full bg-violet-50 px-4 py-1.5 text-xs font-extrabold text-violet-600">إعدادات النظام</span>
        </div>
        <div className="flex flex-col gap-[15px] max-w-[800px]">
          {isLoading && <p className="text-center text-gray-500">جاري التحميل...</p>}
          {!isLoading &&
            behaviorSections?.data?.map((metric: any, index: number) => {
              const style = styleVariants[index % styleVariants.length];
              return <MetricCard key={metric.id} metric={metric} style={style} onEdit={openEditModal} onDelete={openDeleteMetricModal} />;
            })}

          <div
            onClick={openAddModal}
            className="flex cursor-pointer flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-violet-400 bg-[rgba(139,92,246,0.02)] p-[18px] text-violet-500 transition-all hover:border-solid hover:bg-violet-50 font-bold">
            <PlusCircle className="mb-1.5" size={22} />
            <span>إضافة معيار مخصص</span>
          </div>
        </div>
      </div>

      {/* BehaviorType Section */}
      <div className="rounded-3xl mt-5 border border-slate-200/80 bg-white/60 p-8 shadow-[0_10px_25px_-5px_rgba(139,92,246,0.1),0_8px_10px_-6px_rgba(0,0,0,0.05)] backdrop-blur-[10px]">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-3 text-xl font-extrabold text-emerald-600">
            <Tags size={20} /> أنواع السلوك
          </h3>
          <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-extrabold text-emerald-600">تقييمات السلوك</span>
        </div>

        <div className="flex flex-col gap-[15px] max-w-[800px]">
          {isLoadingTypes && <p className="text-center text-gray-500">جاري التحميل...</p>}
          {!isLoadingTypes &&
            behaviorTypes?.data?.map((type: any, index: number) => {
              const style = typeStyleVariants[index % typeStyleVariants.length];
              return <TypeCard key={type.id} type={type} style={style} onEdit={openEditTypeModal} onDelete={openDeleteTypeModal} />;
            })}

          <div
            onClick={openAddTypeModal}
            className="flex cursor-pointer flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-emerald-400 bg-[rgba(16,185,129,0.02)] p-[18px] text-emerald-500 transition-all hover:border-solid hover:bg-emerald-50 font-bold">
            <PlusCircle className="mb-1.5" size={22} />
            <span>إضافة نوع سلوك جديد</span>
          </div>
        </div>
      </div>

      {/* Conditionally Render Modals */}
      {isModalOpen && (
        <Model
          open={isModalOpen}
          setOpen={setIsModalOpen}
          title={modalMode === "add" ? "إضافة معيار جديد" : "تعديل المعيار"}
          variant="premium"
          icon={
            <div className="flex bg-violet-50 text-violet-600 rounded-lg w-10 h-10 items-center justify-center">
              <Sliders size={20} />
            </div>
          }
          size="lg"
          className="z-[2000]">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-slate-700">اسم المعيار</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm font-bold outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200"
                  placeholder="مثال: النظافة، المشاركة..."
                  value={metricName}
                  onChange={(e) => setMetricName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={closeModal} className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700 transition-colors">
                  {modalMode === "add" ? "إضافة" : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </Model>
      )}

      {isTypeModalOpen && (
        <Model
          open={isTypeModalOpen}
          setOpen={setIsTypeModalOpen}
          title={typeModalMode === "add" ? "إضافة نوع سلوك جديد" : "تعديل نوع السلوك"}
          variant="premium"
          icon={
            <div className="flex bg-emerald-50 text-emerald-600 rounded-lg w-10 h-10 items-center justify-center">
              <Tags size={20} />
            </div>
          }
          size="lg"
          className="z-[2000]">
          <div className="p-6">
            <form onSubmit={handleTypeSubmit}>
              <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-slate-700">اسم نوع السلوك</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200"
                  placeholder="مثال: ممتاز، جيد، سيء..."
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={closeTypeModal} className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-colors">
                  {typeModalMode === "add" ? "إضافة" : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </Model>
      )}

      {/* Delete Modals */}
      {isDeleteModalOpen && (
        <DeleteModel
          open={isDeleteModalOpen}
          setOpen={setIsDeleteModalOpen}
          title="حذف معيار التقييم"
          description="هل أنت متأكد من حذف معيار التقييم"
          name={deletingMetricName}
          handleRemove={handleDeleteMetric}
          isLoading={isLoadingDeleteMetric}
        />
      )}

      {isDeleteTypeModalOpen && (
        <DeleteModel
          open={isDeleteTypeModalOpen}
          setOpen={setIsDeleteTypeModalOpen}
          title="حذف نوع السلوك"
          description="هل أنت متأكد من حذف نوع السلوك"
          name={deletingTypeName}
          handleRemove={handleDeleteType}
          isLoading={isLoadingDeleteType}
        />
      )}
    </>
  );
}
