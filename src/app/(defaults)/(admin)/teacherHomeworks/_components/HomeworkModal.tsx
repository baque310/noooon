"use client";

import React, { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
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

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" onClose={handleClose} className="relative z-[2000]">
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-[800px] max-h-[90vh] bg-slate-50 dark:bg-slate-900 rounded-[30px] shadow-2xl flex flex-col overflow-hidden transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span>{getTitle()}</span>
                  </h3>

                  <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Scrollable Body (overlay scrollbar) */}
                <div className="flex-1 overflow-y-auto overlay-scrollbar p-2 pl-1 space-y-6">
                  {viewMode === "details" ? (
                    <DetailsPageComponent isModal={true} onClose={handleClose} onEdit={() => setViewMode("edit")} id={homeworkId} />
                  ) : (
                    <PageComponent isModal={true} onClose={handleClose} onSuccess={onSuccess} id={homeworkId} />
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default HomeworkModal;
