"use client";

import Model from "@/components/Model";
import React, { useEffect, useState } from "react";
import { getTranslation } from "../../../../../ni18n/i18n";
import { ButtonForm } from "../../../../../components/Form/ButtonForm";
import DeleteModel from "@/components/Model/DeleteModel";

const GroupedUpdateModal = ({
    setOpen,
    open,
    title,
    records,
    onSubmit,
    isLoading,
    onDelete,
    isDeleting,
}: {
    setOpen: any;
    open: boolean;
    title: string;
    records: any[];
    onSubmit: (updates: Record<string, "Absent" | "Present" | "Vacation">) => void;
    onDelete?: (ids: string[]) => void;
    isLoading: boolean;
    isDeleting?: boolean;
}) => {
    const { t } = getTranslation();

    // State to track changes for each record id
    const [updates, setUpdates] = useState<Record<string, "Absent" | "Present" | "Vacation">>({});
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [openDelete, setOpenDelete] = useState(false);

    // Reset updates when modal opens processing new records
    useEffect(() => {
        if (open) {
            setUpdates({});
            setSelectedIds([]);
        }
    }, [open]);

    const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(records.map(r => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleToggleOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const handleStatusChange = (id: string, newStatus: "Absent" | "Present" | "Vacation") => {
        setUpdates((prev) => ({
            ...prev,
            [id]: newStatus,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(updates);
    };

    return (
        <Model title={title} open={open} setOpen={setOpen} size="4xl">
            <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[70vh]">
                <div className="overflow-y-auto pr-2 pb-4 -mx-2 px-2 flex-1">
                    <div className="bg-white dark:bg-[#0e1726] border border-[#f1f5f9] dark:border-[#1b2e4b] rounded-xl overflow-hidden shadow-sm">
                        {/* Table Header */}
                        <div className="grid grid-cols-[40px_1fr_150px] gap-4 p-4 bg-primary/5 dark:bg-primary/10 text-primary font-bold text-sm items-center">
                            <div className="flex justify-center">
                                <input
                                    type="checkbox"
                                    className="form-checkbox w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/50 cursor-pointer transition-all"
                                    checked={records.length > 0 && selectedIds.length === records.length}
                                    onChange={handleToggleAll}
                                />
                            </div>
                            <div className="font-bold">اسم الطالب</div>
                            <div className="text-center font-bold">الحالة</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-gray-100 dark:divide-[#1b2e4b]">
                            {records.map((record, index) => {
                                const currentStatus = updates[record.id] || record.Status;

                                // Colors based on status
                                const selectColors: Record<string, string> = {
                                    Present: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-800",
                                    Absent: "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/30 dark:border-red-800",
                                    Vacation: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-900/30 dark:border-amber-800"
                                };

                                return (
                                    <div key={record.id} className="grid grid-cols-[40px_1fr_150px] gap-4 items-center p-4 hover:bg-gray-50 dark:hover:bg-[#1b2e4b]/20 transition-colors">
                                        <div className="flex justify-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/50 cursor-pointer transition-all"
                                                checked={selectedIds.includes(record.id)}
                                                onChange={(e) => handleToggleOne(record.id, e.target.checked)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20 shadow-sm shrink-0">
                                                {record.StudentEnrollment?.Student?.fullName?.charAt(0) || "-"}
                                            </div>
                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                {record.StudentEnrollment?.Student?.fullName || "-"}
                                            </span>
                                        </div>

                                        <div>
                                            <select
                                                value={currentStatus}
                                                onChange={(e) => handleStatusChange(record.id, e.target.value as any)}
                                                className={`w-full text-sm font-semibold rounded-lg border focus:ring-2 focus:ring-primary/20 px-3 py-1.5 outline-none transition-colors cursor-pointer text-center appearance-none ${selectColors[currentStatus] || selectColors["Absent"]}`}
                                            >
                                                <option value="Present">{t("SuperTeacherAttendancesPage.Present" as any)}</option>
                                                <option value="Absent">{t("SuperTeacherAttendancesPage.Absent" as any)}</option>
                                                <option value="Vacation">{t("SuperTeacherAttendancesPage.Vacation" as any)}</option>
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="pt-4 mt-2 border-t border-gray-100 dark:border-[#1b2e4b] flex gap-3">
                    {selectedIds.length > 0 && onDelete && (
                        <button
                            type="button"
                            onClick={() => setOpenDelete(true)}
                            disabled={isDeleting}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors font-bold text-sm min-w-32"
                        >
                            {isDeleting ? "..." : "حذف المحدد"}
                        </button>
                    )}
                    <div className="flex-1">
                        <ButtonForm
                            title={"تحديث"}
                            isLoading={isLoading}
                            props={{
                                type: "submit",
                                className: "w-full !bg-primary text-white py-2.5",
                                disabled: Object.keys(updates).length === 0,
                            }}
                        />
                    </div>
                </div>
            </form>

            <DeleteModel
                title={"حذف البيانات"}
                description={"هل أنت متأكد من عملية الحذف؟"}
                open={openDelete}
                setOpen={setOpenDelete}
                handleRemove={() => {
                    if (onDelete) {
                        onDelete(selectedIds);
                        setOpenDelete(false);
                    }
                }}
                isLoading={isDeleting || false}
                name={`(${selectedIds.length}) طلاب`}
            />
        </Model>
    );
};

export default GroupedUpdateModal;
