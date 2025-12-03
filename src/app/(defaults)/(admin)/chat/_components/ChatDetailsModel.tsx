"use client";

import React from "react";
import Avatar from "@/components/common/Avatar";
import { getTranslation } from "@/ni18n/i18n";
import moment from "moment";
import { Loader2, UserPlus, Lock, Unlock } from "lucide-react";
import { useState } from "react";
import { useToggleGroupChatUpdateMutation, useChatRemoveMutation, useChatAddMembersMessageMutation } from "@/services/admin/chat";
import { DeleteIcons, UpdateIcons } from "@/components/common/icons/Actions";
import RenameChatModel from "./RenameChatModel";
import Model from "@/components/Model";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import AddMembersModal from "./AddMembersModal";

interface ChatDetailsPanelProps {
  chat: any | null;
  onToggleStatus?: (chatId: string, currentStatus: string) => void;
  onChatRemoved?: () => void;
  isLoading?: boolean;
}

const ChatDetailsPanel: React.FC<ChatDetailsPanelProps> = ({ chat, onToggleStatus, onChatRemoved, isLoading = false }) => {
  const { t } = getTranslation() as any;
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [patchToggle, { isLoading: isPatching }] = useToggleGroupChatUpdateMutation();
  const [chatRemove, { isLoading: isRemoving }] = useChatRemoveMutation();
  const [addMembers, { isLoading: isAddingMembers }] = useChatAddMembersMessageMutation();

  if (!chat) return null;

  const createdAt = chat.createdAt ? moment(chat.createdAt).format("LLL") : "-";
  const members = chat.ChatRoomMember ?? [];
  const isActive = chat.isActive === "TRUE";
  const status = isActive ? t("common.active") : t("common.inactive");

  const handleToggle = () => {
    setShowConfirm(true);
  };

  const confirmToggle = async () => {
    try {
      const action = isActive ? "DISABLE" : "ENABLE";
      const result = await patchToggle({ roomId: chat.id, body: { action } }).unwrap();

      setShowConfirm(false);
      toast.success(isActive ? t("ChatPage.chat-disabled-successfully") || "Chat disabled successfully" : t("ChatPage.chat-enabled-successfully") || "Chat enabled successfully", {
        autoClose: 3000,
      });
      if (onToggleStatus) onToggleStatus(chat.id, result?.isActive);
    } catch (err) {
      console.error("Toggle group chat failed", err);
      toast.error(t("common.operation-failed"), { autoClose: 3000 });
    }
  };

  const handleRemoveChat = async () => {
    try {
      await chatRemove({ roomId: chat.rocketChatId }).unwrap();
      toast.success(t("common.deleted-successfully"), { autoClose: 3000 });
      setShowDeleteConfirm(false);
      if (onChatRemoved) {
        onChatRemoved();
      }
      window.location.reload();
    } catch (error: any) {
      console.error("Failed to remove chat:", error);
      if (error?.data?.message) {
        toast.error(t(error.data.message), { autoClose: 3000 });
      } else {
        toast.error(t("common.operation-failed"), { autoClose: 3000 });
      }
    }
  };

  const handleAddMembers = async (selectedMembers: Array<{ userId: string; userType: string }>) => {
    try {
      await addMembers({
        roomId: chat.rocketChatId,
        body: { members: selectedMembers },
      }).unwrap();

      toast.success(t("ChatPage.members-added-successfully") || "Members added successfully", {
        autoClose: 3000,
      });
      setShowAddMembersModal(false);
    } catch (error: any) {
      console.error("Failed to add members:", error);
      if (error?.data?.message) {
        toast.error(t(error.data.message), { autoClose: 3000 });
      } else {
        // console.log(error?.data);
        toast.error(t("common.operation-failed"), { autoClose: 3000 });
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-5">
          {/* Header Section */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-center gap-4">
              <Avatar photo={chat.photo || ""} username={chat.name} className="!bg-[#2C6E91]" />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-gray-900">{chat.name}</h2>
                <div className="text-xs text-gray-500">
                  {members.length} أعضاء | {status}
                </div>
              </div>
            </div>
            <button onClick={() => setShowRenameModal(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit chat name">
              <UpdateIcons className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* General Information */}
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 text-sm">
            <div>
              <div className="text-xs text-gray-500">{t("ChatPage.members")}</div>
              <div className="font-medium text-gray-800">{members.length}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">{t("common.createdAt")}</div>
              <div className="font-medium text-gray-800 text-xs">{createdAt}</div>
            </div>
          </div>

          {/* Members List */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">{t("ChatPage.members-list") || "Members"}</h3>

              <div className="flex items-center gap-2">
                {/* Toggle Chat Status Button */}
                <button
                  onClick={handleToggle}
                  disabled={isLoading || isPatching}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isActive ? "تعطيل المحادثة" : "تفعيل المحادثة"}>
                  {isLoading || isPatching ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                  ) : isActive ? (
                    <Unlock className="w-5 h-5 text-green-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-red-600" />
                  )}
                </button>

                {/* Add Members Button */}
                {/* <button onClick={() => setShowAddMembersModal(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="إضافة أعضاء">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </button> */}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
              {members.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {members.map((member: any) => (
                    <li key={member.id} className="flex justify-between items-center py-2 text-sm">
                      <span className="font-medium flex items-center gap-2 text-gray-700">
                        <Avatar photo={member.photo || ""} username={member.memberName} className="!bg-[#2C6E91] !w-8 !h-8" />
                        {member.memberName}
                        {/* <div className="text-xs text-gray-500">{t(`ChatPage.${member.userType?.toLowerCase()}`) || member.userType}</div> */}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${member.userType === "ADMIN" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                        {t(member.userType)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-sm text-gray-500">{t("ChatPage.no-members") || "No members found"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Remove Button at Bottom */}
      <div className="border-t bg-white p-4">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isRemoving}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm">
          {isRemoving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>جاري الحذف...</span>
            </>
          ) : (
            <>
              <DeleteIcons className="w-5 h-5" />
              <span>حذف المحادثة</span>
            </>
          )}
        </button>
      </div>

      {/* Confirmation modal for toggle */}
      {showConfirm && (
        <Model title={isActive ? t("ChatPage.disable-chat") : t("ChatPage.enable-chat")} open={showConfirm} setOpen={setShowConfirm}>
          <div className="p-4">
            <p className="mb-4">
              {isActive
                ? t("ChatPage.are you sure you want to disable this chat?") || "Are you sure you want to disable this chat?"
                : t("ChatPage.are you sure you want to enable this chat?") || "Are you sure you want to enable this chat?"}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowConfirm(false)} className="rounded-md px-3 py-2 bg-gray-100 text-sm">
                {t("common.cancel") || "Cancel"}
              </button>
              <button onClick={confirmToggle} disabled={isPatching} className="rounded-md px-3 py-2 bg-blue-600 text-white text-sm">
                {isPatching ? t("common.loading") || "Processing..." : t("common.confirm") || "Confirm"}
              </button>
            </div>
          </div>
        </Model>
      )}

      {/* Confirmation modal for delete */}
      {showDeleteConfirm && (
        <Model title={t("ChatPage.delete-chat") || "Delete Chat"} open={showDeleteConfirm} setOpen={setShowDeleteConfirm}>
          <div className="p-4">
            <p className="mb-4">
              {t("ChatPage.are-you-sure-you-want-to-delete-this-chat") || `Are you sure you want to delete the chat "${chat?.name}"? This action cannot be undone.`}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="rounded-md px-3 py-2 bg-gray-100 text-sm">
                {t("common.cancel") || "Cancel"}
              </button>
              <button
                onClick={handleRemoveChat}
                disabled={isRemoving}
                className="rounded-md px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm flex items-center gap-2">
                {isRemoving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isRemoving ? t("common.loading") || "Deleting..." : t("common.delete") || "Delete"}
              </button>
            </div>
          </div>
        </Model>
      )}

      {/* Rename modal */}
      <RenameChatModel open={showRenameModal} setOpen={setShowRenameModal} chat={chat} />

      {/* Add Members modal */}
      <AddMembersModal open={showAddMembersModal} setOpen={setShowAddMembersModal} onAddMembers={handleAddMembers} isLoading={isAddingMembers} existingMembers={members} />
    </div>
  );
};

export default ChatDetailsPanel;
