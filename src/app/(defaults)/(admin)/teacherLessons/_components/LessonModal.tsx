"use client";

import React, { useState, useEffect } from "react";
import Model from "@/components/Model";
import PageComponent from "../createOrUpdate/_components/PageComponent";
import DetailsPageComponent from "../[id]/_components/PageComponent";

interface LessonModalProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onSuccess?: () => void;
    lessonId?: string;
}

const LessonModal = ({ open, setOpen, onSuccess, lessonId }: LessonModalProps) => {
    const [viewMode, setViewMode] = useState<"details" | "edit" | "create">("create");

    useEffect(() => {
        if (open) {
            if (lessonId) {
                setViewMode("details");
            } else {
                setViewMode("create");
            }
        }
    }, [open, lessonId]);

    const handleClose = () => {
        setOpen(false);
    };

    const getTitle = () => {
        switch (viewMode) {
            case "create":
                return "إضافة درس منجز جديد";
            case "edit":
                return "تعديل الدرس المنجز";
            case "details":
                return "تفاصيل الدرس المنجز";
            default:
                return "";
        }
    };

    const Icon = (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    );

    return (
        <Model
            open={open}
            setOpen={setOpen}
            title={getTitle()}
            variant="premium"
            icon={Icon}
            size="4xl"
            panelClassName="max-w-[800px]"
            className="z-[2000]">
            {viewMode === "details" ? (
                <DetailsPageComponent isModal={true} onClose={handleClose} onEdit={() => setViewMode("edit")} id={lessonId} />
            ) : (
                <PageComponent isModal={true} onClose={handleClose} onSuccess={onSuccess} id={lessonId} />
            )}
        </Model>
    );
};

export default LessonModal;
