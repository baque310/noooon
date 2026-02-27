"use client";

import React, { useState, useEffect } from "react";
import Model from "@/components/Model";
import PageComponent from "../[id]/_components/PageComponent";
import ParentAddEdit from "../createOrUpdate/_components/PageComponent";

interface ParentModalProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onSuccess?: () => void;
    parentId?: string;
}

const ParentModal = ({ open, setOpen, onSuccess, parentId }: ParentModalProps) => {
    const [viewMode, setViewMode] = useState<"details" | "create" | "edit">("details");

    useEffect(() => {
        if (open) {
            setViewMode("details");
        }
    }, [open, parentId]);

    const handleClose = () => {
        setOpen(false);
    };

    const getTitle = () => {
        switch (viewMode) {
            case "details":
                return "تفاصيل ولي الأمر";
            case "edit":
                return "تعديل بيانات ولي الأمر";
            default:
                return "";
        }
    };

    const Icon = (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );

    return (
        <Model open={open} setOpen={setOpen} title={getTitle()} variant="premium" icon={Icon} size="4xl" panelClassName="max-w-[800px]" className="z-[2000]">
            {viewMode === "details" && parentId ? (
                <PageComponent id={parentId} isModal={true} onClose={handleClose} onEdit={() => setViewMode("edit")} />
            ) : viewMode === "edit" && parentId ? (
                <ParentAddEdit id={parentId} isModal={true} onClose={() => setViewMode("details")} onSuccess={onSuccess} />
            ) : null}
        </Model>
    );
};

export default ParentModal;
