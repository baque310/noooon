"use client";

import React from "react";
import Model, { openProps } from "@/components/Model";
import PageComponent from "../createOrUpdate/_components/PageComponent";

interface HomeworkModalProps extends openProps {
  onSuccess?: () => void;
}

const HomeworkModal = ({ open, setOpen, onSuccess }: HomeworkModalProps) => {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Model
      open={open}
      setOpen={setOpen}
      isNot512={true}
      title={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <span>إضافة واجب منزلي جديد</span>
        </div>
      }>
      <div className="max-h-[80vh] overflow-y-auto">
        <PageComponent isModal={true} onClose={handleClose} onSuccess={onSuccess} />
      </div>
    </Model>
  );
};

export default HomeworkModal;
