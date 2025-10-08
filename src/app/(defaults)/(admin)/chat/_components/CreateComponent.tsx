"use client";

import React from "react";
import Model from "@/components/Model";
import { getTranslation } from "@/ni18n/i18n";
import { ItemList } from "@/components/common/ItemList";
import { ArrowIcons } from "@/components/common/icons/Actions";
import DirectComponent from "./DirectComponent";
import GroupComponent from "./GroupComponent";
import SchoolStaffGroupComponent from "./SchoolStaffGroupComponent";
import ClassParentsGroupComponent from "./ClassParentsGroupComponent";
import SubjectTeachersGroupComponent from "./SubjectTeachersGroupComponent";
import SchoolStudentsGroupComponent from "./SchoolStudentsGroupComponent";

// Custom SVG icons (larger size)
const DirectIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="8" stroke="#2563eb" strokeWidth="2" />
    <path d="M10 6v4l3 2" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const MessageIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 20 20">
    <rect x="3" y="5" width="14" height="10" rx="2" stroke="#22c55e" strokeWidth="2" />
    <path d="M3 5l7 5 7-5" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const StudentsGroupIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12.6 15.2C14.5882 15.2 16.2 13.5882 16.2 11.6C16.2 9.61177 14.5882 8 12.6 8C10.6118 8 9 9.61177 9 11.6C9 13.5882 10.6118 15.2 12.6 15.2Z"
      stroke="#42B6F5"
      stroke-width="1.6"
    />
    <path d="M5.5 16C6.88071 16 8 14.8807 8 13.5C8 12.1193 6.88071 11 5.5 11C4.11929 11 3 12.1193 3 13.5C3 14.8807 4.11929 16 5.5 16Z" stroke="#42B6F5" stroke-width="1.6" />
    <path
      d="M19.5 16C20.8807 16 22 14.8807 22 13.5C22 12.1193 20.8807 11 19.5 11C18.1193 11 17 12.1193 17 13.5C17 14.8807 18.1193 16 19.5 16Z"
      stroke="#42B6F5"
      stroke-width="1.6"
    />
    <path d="M20.75 18H3.25C2.55964 18 2 18.6716 2 19.5C2 20.3284 2.55964 21 3.25 21H20.75C21.4404 21 22 20.3284 22 19.5C22 18.6716 21.4404 18 20.75 18Z" fill="#42B6F5" />
  </svg>
);

const StaffGroupIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 20 20">
    <circle cx="7" cy="10" r="3" stroke="#f59e42" strokeWidth="2" />
    <circle cx="15" cy="10" r="3" stroke="#f59e42" strokeWidth="2" />
    <rect x="2" y="15" width="16" height="2" rx="1" fill="#f59e42" />
  </svg>
);

const ParentsGroupIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 20 20">
    <ellipse cx="10" cy="10" rx="6" ry="4" stroke="#a855f7" strokeWidth="2" />
    <path d="M4 16c1.5-2 10.5-2 12 0" stroke="#a855f7" strokeWidth="2" />
  </svg>
);

const SubjectTeachersGroupIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 20 20">
    <rect x="4" y="4" width="12" height="12" rx="3" stroke="#0ea5e9" strokeWidth="2" />
    <path d="M7 8h6M7 12h6" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CreateComponent = ({ open, setOpen }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const { t } = getTranslation();
  const [openDirect, setOpenDirect] = React.useState(false);
  const [openGroup, setOpenGroup] = React.useState(false);
  const [openStudentsGroup, setOpenStudentsGroup] = React.useState(false);
  const [openStaffGroup, setOpenStaffGroup] = React.useState(false);
  const [openParentsGroup, setOpenParentsGroup] = React.useState(false);
  const [openSubjectTeachersGroup, setOpenSubjectTeachersGroup] = React.useState(false);

  return (
    <Model title={t("ChatPage.add-chat")} open={open} setOpen={setOpen}>
      <div className="!bg-transparent px-6 py-8 space-y-6 transition-all duration-300">
        <div className="mb-2 text-base font-medium text-gray-700">{t("ChatPage.choose-chat-type") || "Select the type of chat you want to start."}</div>
        <hr className="border-gray-200 mb-2" />
        <ItemList
          props={{
            onClick: () => {
              setOpenDirect(true);
            },
            className: "flex items-center gap-4 p-4 rounded-lg hover:bg-blue-100 transition-all duration-200 cursor-pointer border border-gray-100 group",
          }}
          title={
            <span className="flex items-center gap-3">
              <DirectIcon />
              <span className="font-semibold text-gray-800 group-hover:text-blue-700 transition">{t("ChatPage.direct")}</span>
            </span>
          }
          value={<ArrowIcons className="rtl:rotate-180 text-[#2563eb]/50 group-hover:text-blue-700 transition" />}
        />
        <ItemList
          props={{
            onClick: () => {
              setOpenGroup(true);
            },
            className: "flex items-center gap-4 p-4 rounded-lg hover:bg-green-100 transition-all duration-200 cursor-pointer border border-gray-100 group",
          }}
          title={
            <span className="flex items-center gap-3">
              <MessageIcon />
              <span className="font-semibold text-gray-800 group-hover:text-green-700 transition">{t("ChatPage.message")}</span>
            </span>
          }
          value={<ArrowIcons className="rtl:rotate-180 text-[#22c55e]/50 group-hover:text-green-700 transition" />}
        />
        <ItemList
          props={{
            onClick: () => {
              setOpenStudentsGroup(true);
            },
            className: "flex items-center gap-4 p-4 rounded-lg hover:bg-orange-100 transition-all duration-200 cursor-pointer border border-gray-100 group",
          }}
          title={
            <span className="flex items-center gap-3">
              <StudentsGroupIcon />
              <span className="font-semibold text-gray-800 group-hover:text-orange-700 transition">
                {t("ChatPage.create-school-Students-group") || "Create School Students Group"}
              </span>
            </span>
          }
          value={<ArrowIcons className="rtl:rotate-180 text-[#f59e42]/50 group-hover:text-orange-700 transition" />}
        />
        <ItemList
          props={{
            onClick: () => {
              setOpenStaffGroup(true);
            },
            className: "flex items-center gap-4 p-4 rounded-lg hover:bg-orange-100 transition-all duration-200 cursor-pointer border border-gray-100 group",
          }}
          title={
            <span className="flex items-center gap-3">
              <StaffGroupIcon />
              <span className="font-semibold text-gray-800 group-hover:text-orange-700 transition">{t("ChatPage.create-school-staff-group") || "Create School Staff Group"}</span>
            </span>
          }
          value={<ArrowIcons className="rtl:rotate-180 text-[#f59e42]/50 group-hover:text-orange-700 transition" />}
        />
        <ItemList
          props={{
            onClick: () => {
              setOpenParentsGroup(true);
            },
            className: "flex items-center gap-4 p-4 rounded-lg hover:bg-purple-100 transition-all duration-200 cursor-pointer border border-gray-100 group",
          }}
          title={
            <span className="flex items-center gap-3">
              <ParentsGroupIcon />
              <span className="font-semibold text-gray-800 group-hover:text-purple-700 transition">{t("ChatPage.create-class-parents-group") || "Create Class Parents Group"}</span>
            </span>
          }
          value={<ArrowIcons className="rtl:rotate-180 text-[#a855f7]/50 group-hover:text-purple-700 transition" />}
        />
        <ItemList
          props={{
            onClick: () => {
              setOpenSubjectTeachersGroup(true);
            },
            className: "flex items-center gap-4 p-4 rounded-lg hover:bg-sky-100 transition-all duration-200 cursor-pointer border border-gray-100 group",
          }}
          title={
            <span className="flex items-center gap-3">
              <SubjectTeachersGroupIcon />
              <span className="font-semibold text-gray-800 group-hover:text-sky-700 transition">
                {t("ChatPage.create-subject-teachers-group") || "Create Subject Teachers Group"}
              </span>
            </span>
          }
          value={<ArrowIcons className="rtl:rotate-180 text-[#0ea5e9]/50 group-hover:text-sky-700 transition" />}
        />
      </div>
      <DirectComponent open={openDirect} setOpen={setOpenDirect} setOpenChat={setOpen} />
      <GroupComponent open={openGroup} setOpen={setOpenGroup} setOpenChat={setOpen} />
      <SchoolStudentsGroupComponent open={openStudentsGroup} setOpen={setOpenStudentsGroup} setOpenChat={setOpen} />
      <SchoolStaffGroupComponent open={openStaffGroup} setOpen={setOpenStaffGroup} setOpenChat={setOpen} />
      <ClassParentsGroupComponent open={openParentsGroup} setOpen={setOpenParentsGroup} setOpenChat={setOpen} />
      <SubjectTeachersGroupComponent open={openSubjectTeachersGroup} setOpen={setOpenSubjectTeachersGroup} setOpenChat={setOpen} />
    </Model>
  );
};

export default CreateComponent;
