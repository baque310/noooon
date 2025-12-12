"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Model from "@/components/Model";
import { getTranslation } from "@/ni18n/i18n";
import { Loader2, Search, X } from "lucide-react";
import Avatar from "@/components/common/Avatar";
import { LoadingForm } from "@/components/Form/loadingForm";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useStudentEnrollmentGetDataQuery } from "@/services/admin/studentEnrollment";
import { useTeacherGetDataQuery } from "@/services/admin/teacher";
import { useParentGetDataQuery } from "@/services/admin/parent";

interface Member {
  userId: string;
  userType: string;
  name?: string;
  photo?: string;
}

interface AddMembersModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAddMembers: (members: Array<{ userId: string; userType: string }>) => Promise<void>;
  isLoading?: boolean;
  existingMembers: any[];
  roomId?: string;
  chatType?: string;
}

const AddMembersModal: React.FC<AddMembersModalProps> = ({ open, setOpen, onAddMembers, isLoading = false, existingMembers = [], roomId, chatType }) => {
  const { t } = getTranslation() as any;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [userType, setUserType] = useState<"TEACHER" | "STUDENT" | "PARENT">("TEACHER");

  useEffect(() => {
    if (!chatType) return;

    if (chatType === "GROUP_CUSTOM_TEACHERS" || chatType === "GROUP_SCHOOL_STAFF") {
      setUserType("TEACHER");
    } else if (chatType === "GROUP_CLASS_STUDENTS") {
      setUserType("STUDENT");
    } else if (chatType === "GROUP_CLASS_PARENTS") {
      setUserType("PARENT");
    }
  }, [chatType]);

  const debouncedSearch = useDebouncedValue(searchQuery, 400);

  // Fetch teachers
  const { currentData: teachersData, isFetching: isFetchingTeachers } = useTeacherGetDataQuery(
    {
      skip: 1,
      take: 100,
      search: debouncedSearch || undefined,
    },
    { skip: !open || userType !== "TEACHER" }
  );

  // Fetch students
  const { currentData: studentsData, isFetching: isFetchingStudents } = useStudentEnrollmentGetDataQuery(
    {
      skip: 1,
      take: 100,
      search: debouncedSearch || undefined,
    },
    { skip: !open || userType !== "STUDENT" }
  );

  // Fetch parents
  const { currentData: parentsData, isFetching: isFetchingParents } = useParentGetDataQuery(
    {
      skip: 1,
      take: 100,
      search: debouncedSearch || undefined,
    },
    { skip: !open || userType !== "PARENT" }
  );

  // Extract existing member user IDs
  const existingMemberIds = useMemo(() => {
    // existingMembers may come in different shapes depending on API (userId, id, Student.id, etc.)
    return existingMembers
      .map((m) => {
        // try several possible fields
        const id = m?.userId ?? m?.id ?? m?.user?.id ?? m?.Student?.id ?? m?.Teacher?.id ?? m?.parentId ?? m?.studentId ?? null;
        return id != null ? String(id) : null;
      })
      .filter(Boolean) as string[];
  }, [existingMembers]);

  // Get available users based on selected type
  const availableUsers = useMemo(() => {
    let users: any[] = [];
    console.log(parentsData);

    if (userType === "TEACHER" && teachersData?.data) {
      users = teachersData.data.map((teacher) => ({
        id: String(teacher.User.id),
        name: teacher.fullName,
        photo: teacher.photo,
        userType: "TEACHER",
      }));
    } else if (userType === "STUDENT" && studentsData?.data) {
      users = studentsData.data
        .map((student) => {
          const id = student?.Student?.User?.id ?? student?.id;
          const name = student?.Student?.fullName ?? student?.Student?.fullName;
          const photo = student?.Student?.photo ?? student?.Student?.photo;
          return id ? { id: String(id), name, photo, userType: "STUDENT" } : null;
        })
        .filter(Boolean) as any[];
    } else if (userType === "PARENT" && parentsData?.data) {
      users = parentsData.data.map((parent) => ({
        id: String(parent.User.id),
        name: parent.fullName,
        photo: parent.photo,
        userType: "PARENT",
      }));
    }

    // Filter out existing members
    return users.filter((user) => !existingMemberIds.includes(String(user.id)));
  }, [userType, teachersData, studentsData, parentsData, existingMemberIds]);

  const isLoadingUsers = (userType === "TEACHER" && isFetchingTeachers) || (userType === "STUDENT" && isFetchingStudents) || (userType === "PARENT" && isFetchingParents);

  // Select all checkbox ref for indeterminate state
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const allSelected = availableUsers.length > 0 && selectedMembers.length === availableUsers.length;
  const partialSelected = selectedMembers.length > 0 && selectedMembers.length < availableUsers.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = partialSelected;
    }
  }, [partialSelected, allSelected, selectedMembers.length, availableUsers.length]);

  const handleSelectAllToggle = (checked: boolean) => {
    if (checked) {
      // select all available users
      const all = availableUsers.map((u) => ({ userId: String(u.id), userType: u.userType ?? "TEACHER", name: u.name, photo: u.photo }));
      setSelectedMembers(all);
    } else {
      setSelectedMembers([]);
    }
  };

  const handleToggleMember = (user: any) => {
    // Accept either a user from availableUsers (has .id) or an already selected member (has .userId)
    const id = user?.id ?? user?.userId;
    if (!id) return;
    const sid = String(id);

    const isSelected = selectedMembers.some((m) => String(m.userId) === sid);

    if (isSelected) {
      setSelectedMembers((prev) => prev.filter((m) => String(m.userId) !== sid));
    } else {
      setSelectedMembers((prev) => [
        ...prev,
        {
          userId: sid,
          userType: user?.userType ?? user?.type ?? "TEACHER",
          name: user?.name ?? user?.fullName ?? "",
          photo: user?.photo ?? "",
        },
      ]);
    }
  };

  const handleSubmit = async () => {
    if (selectedMembers.length === 0) {
      return;
    }

    const membersToAdd = selectedMembers.map((m) => ({
      userId: m.userId,
      userType: m.userType,
    }));

    await onAddMembers(membersToAdd);

    // Reset state after successful submission
    setSelectedMembers([]);
    setSearchQuery("");
  };

  const handleClose = () => {
    setSelectedMembers([]);
    setSearchQuery("");
    setOpen(false);
  };

  // Reset selected members when user type changes
  useEffect(() => {
    setSelectedMembers([]);
    setSearchQuery("");
  }, [userType]);

  return (
    <Model title={t("ChatPage.add-members") || "إضافة أعضاء"} open={open} setOpen={handleClose}>
      <div className="p-4">
        {/* User Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("ChatPage.user-type") || "نوع المستخدم"}</label>
          <div className="flex gap-2">
            <button
              disabled={chatType !== "GROUP_CUSTOM_TEACHERS" && chatType !== "GROUP_SCHOOL_STAFF"}
              onClick={() => setUserType("TEACHER")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${userType === "TEACHER" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"} ${
                chatType !== "GROUP_CUSTOM_TEACHERS" && chatType !== "GROUP_SCHOOL_STAFF" ? "opacity-50 cursor-not-allowed" : ""
              }`}>
              {t("ChatPage.teacher")}
            </button>

            <button
              disabled={chatType !== "GROUP_CLASS_STUDENTS"}
              onClick={() => setUserType("STUDENT")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${userType === "STUDENT" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"} ${
                chatType !== "GROUP_CLASS_STUDENTS" ? "opacity-50 cursor-not-allowed" : ""
              }`}>
              {t("ChatPage.student")}
            </button>

            <button
              disabled={chatType !== "GROUP_CLASS_PARENTS"}
              onClick={() => setUserType("PARENT")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${userType === "PARENT" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"} ${
                chatType !== "GROUP_CLASS_PARENTS" ? "opacity-50 cursor-not-allowed" : ""
              }`}>
              {t("ChatPage.parent")}
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("common.search") || "ابحث عن مستخدم..."}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Selected Members Display */}
        {selectedMembers.length > 0 && (
          <div className="mb-4">
            {/* <div className="text-sm font-medium text-gray-700 mb-2">
              {t("ChatPage.selected-members") || "الأعضاء المختارون"} ({selectedMembers.length})
            </div> */}
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map((member) => (
                <div key={member.userId} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  <span>{member.name}</span>
                  <button onClick={() => handleToggleMember(member)} className="hover:bg-blue-100 rounded-full p-0.5">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Users List */}
        <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50">
          {/* Select all header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <div className="text-xs text-gray-500">
              {t("common.items") || "نتيجة"} {availableUsers.length}
            </div>
            <label className="inline-flex items-center gap-2">
              <span className="text-sm text-gray-700">{t("common.select-all") || "تحديد الكل"}</span>
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={(e) => handleSelectAllToggle(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          </div>
          {isLoadingUsers ? (
            <div className="p-6">
              <LoadingForm />
            </div>
          ) : availableUsers.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {availableUsers.map((user) => {
                const isSelected = selectedMembers.some((m) => m.userId === user.id);
                return (
                  <li
                    key={user.id}
                    onClick={() => handleToggleMember(user)}
                    className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50 hover:bg-blue-100" : "bg-white hover:bg-gray-50"
                    }`}>
                    <div className="flex items-center gap-3">
                      <Avatar photo={user.photo || ""} username={user.name} className="!bg-[#2C6E91] !w-10 !h-10" />
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{t(`ChatPage.${user.userType?.toLowerCase()}`) || user.userType}</div>
                      </div>
                    </div>
                    <input type="checkbox" checked={isSelected} onChange={() => handleToggleMember(user)} className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {debouncedSearch ? t("ChatPage.no-users-found") || "لا توجد نتائج" : t("ChatPage.no-available-users") || "لا يوجد مستخدمون متاحون"}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            {t("common.cancel") || "إلغاء"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || selectedMembers.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading
              ? t("common.loading") || "جاري الإضافة..."
              : `${t("ChatPage.add-members") || "إضافة أعضاء"} ${selectedMembers.length > 0 ? `(${selectedMembers.length})` : ""}`}
          </button>
        </div>
      </div>
    </Model>
  );
};

export default AddMembersModal;
