"use client";

import React, { useState, useEffect } from "react";
import Model from "@/components/Model";
import PageComponent from "../createOrUpdate/_components/PageComponent";
import DetailsPageComponent from "../[id]/_components/PageComponent";

interface HomeworkModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: () => void;
  homeworkId?: string;
}

const HomeworkModal = ({ open, setOpen, onSuccess, homeworkId }: HomeworkModalProps) => {
  const [viewMode, setViewMode] = useState<"details" | "edit" | "create">("create");

  useEffect(() => {
    if (open) {
      if (homeworkId) {
        setViewMode("details");
      } else {
        setViewMode("create");
      }
    }
  }, [open, homeworkId]);

  const handleClose = () => {
    setOpen(false);
  };

  const getTitle = () => {
    switch (viewMode) {
      case "create":
        return "إضافة واجب جديد";
      case "edit":
        return "تعديل الواجب";
      case "details":
        return "تفاصيل الواجب";
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
    <Model
      open={open}
      setOpen={setOpen}
      title={getTitle()}
      variant="premium"
      icon={Icon}
      size="4xl" // ~896px, HomeworkModal was 800px. or use "3xl" for 768px. Let's use custom if needed.
      panelClassName="max-w-[800px]" // Explicitly setting 800px as per original design
      className="z-[2000]">
      {viewMode === "details" ? (
        <DetailsPageComponent isModal={true} onClose={handleClose} onEdit={() => setViewMode("edit")} id={homeworkId} />
      ) : (
        <PageComponent isModal={true} onClose={handleClose} onSuccess={onSuccess} id={homeworkId} />
      )}
    </Model>
  );
};

export default HomeworkModal;
