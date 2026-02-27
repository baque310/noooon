"use client";

import React, { useState, useEffect } from "react";
import Model from "@/components/Model";
import PageComponent from "../[id]/_components/PageComponent";
import TeacherAddEdit from "../createOrUpdate/_components/PageComponent";

interface TeacherModalProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onSuccess?: () => void;
    teacherId?: string;
}

const TeacherModal = ({ open, setOpen, onSuccess, teacherId }: TeacherModalProps) => {
    const [viewMode, setViewMode] = useState<"details" | "create" | "edit">("details");

    useEffect(() => {
        if (open) {
            setViewMode("details");
        }
    }, [open, teacherId]);

    const handleClose = () => {
        setOpen(false);
    };

    const getTitle = () => {
        switch (viewMode) {
            case "details":
                return "تفاصيل المعلم";
            case "edit":
                return "تعديل بيانات المعلم";
            default:
                return "";
        }
    };

    const Icon = (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );

    return (
        <Model open={open} setOpen={setOpen} title={getTitle()} variant="premium" icon={Icon} size="4xl" panelClassName="max-w-[800px]" className="z-[2000]">
            {viewMode === "details" && teacherId ? (
                <PageComponent id={teacherId} isModal={true} onClose={handleClose} onEdit={() => setViewMode("edit")} />
            ) : viewMode === "edit" && teacherId ? (
                <TeacherAddEdit id={teacherId} isModal={true} onClose={() => setViewMode("details")} onSuccess={onSuccess} />
            ) : null}
        </Model>
    );
};

export default TeacherModal;
