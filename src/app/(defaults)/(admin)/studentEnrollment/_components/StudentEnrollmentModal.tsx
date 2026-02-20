"use client";

import React, { useState, useEffect } from "react";
import Model from "@/components/Model";
import PageComponent from "../createOrUpdate/_components/PageComponent";
import DetailsPageComponent from "../[id]/_components/PageComponent";

interface StudentEnrollmentModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: () => void;
  enrollmentId?: string;
}

const StudentEnrollmentModal = ({ open, setOpen, onSuccess, enrollmentId }: StudentEnrollmentModalProps) => {
  const [viewMode, setViewMode] = useState<"details" | "edit" | "create">("create");

  useEffect(() => {
    if (open) {
      if (enrollmentId) {
        setViewMode("details");
      } else {
        setViewMode("create");
      }
    }
  }, [open, enrollmentId]);

  const handleClose = () => {
    setOpen(false);
  };

  const getTitle = () => {
    switch (viewMode) {
      case "create":
        return "إضافة تسجيل جديد";
      case "edit":
        return "تعديل التسجيل";
      case "details":
        return "تفاصيل التسجيل";
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
        <DetailsPageComponent isModal={true} onClose={handleClose} onEdit={() => setViewMode("edit")} id={enrollmentId} />
      ) : (
        <PageComponent isModal={true} onClose={handleClose} onSuccess={onSuccess} id={enrollmentId} />
      )}
    </Model>
  );
};

export default StudentEnrollmentModal;
