"use client";

import React, { useState, useEffect } from "react";
import Model from "@/components/Model";
import PageComponent from "../createOrUpdate/_components/PageComponent";
import DetailsPageComponent from "../[id]/_components/PageComponent";

interface StudentModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: () => void;
  studentId?: string;
}

const StudentModal = ({ open, setOpen, onSuccess, studentId }: StudentModalProps) => {
  const [viewMode, setViewMode] = useState<"details" | "edit" | "create">("create");

  useEffect(() => {
    if (open) {
      if (studentId) {
        setViewMode("details");
      } else {
        setViewMode("create");
      }
    }
  }, [open, studentId]);

  const handleClose = () => {
    setOpen(false);
  };

  const getTitle = () => {
    switch (viewMode) {
      case "create":
        return "إضافة طالب جديد";
      case "edit":
        return "تعديل بيانات الطالب";
      case "details":
        return "تفاصيل الطالب";
      default:
        return "";
    }
  };

  const Icon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  return (
    <Model open={open} setOpen={setOpen} title={getTitle()} variant="premium" icon={Icon} size="4xl" panelClassName="max-w-[800px]" className="z-[2000]">
      {viewMode === "details" ? (
        <DetailsPageComponent isModal={true} onClose={handleClose} onEdit={() => setViewMode("edit")} id={studentId} />
      ) : (
        <PageComponent isModal={true} onClose={handleClose} onSuccess={onSuccess} id={studentId} />
      )}
    </Model>
  );
};

export default StudentModal;
