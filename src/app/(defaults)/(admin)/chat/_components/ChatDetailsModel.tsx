"use client";

import React from "react";
import Model from "@/components/Model";
import Avatar from "@/components/common/Avatar";
import { getTranslation } from "@/ni18n/i18n";
import moment from "moment";
import { Loader2 } from "lucide-react"; // spinner icon
import { useState } from "react";
import { useToggleGroupChatUpdateMutation } from "@/services/admin/chat";

interface ChatDetailsModelProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chat: any | null;
  onToggleStatus?: (chatId: string, currentStatus: string) => void;
  isLoading?: boolean;
}

const ChatDetailsModel: React.FC<ChatDetailsModelProps> = ({ open, setOpen, chat, onToggleStatus, isLoading = false }) => {
  const { t } = getTranslation() as any;
  const [showConfirm, setShowConfirm] = useState(false);
  const [patchToggle, { isLoading: isPatching }] = useToggleGroupChatUpdateMutation();

  if (!chat) return null;

  const createdAt = chat.createdAt ? moment(chat.createdAt).format("LLL") : "-";
  const lastMessageTime = chat.lastMessage?.createdAt ? moment(chat.lastMessage.createdAt).format("LLL") : "-";

  const members = chat.ChatRoomMember ?? [];
  const unreadCount = chat.unreadCount ?? 0;
  const isActive = chat.isActive === "TRUE";
  const status = isActive ? t("common.active") : t("common.inactive");

  const handleToggle = () => {
    // open confirmation modal
    setShowConfirm(true);
  };

  const confirmToggle = async () => {
    try {
      const action = isActive ? "DISABLE" : "ENABLE";
      // TODO this is duplicated to refresh the data: use other method
      const result = await patchToggle({ roomId: chat.id, body: { action } }).unwrap();
      await patchToggle({ roomId: chat.id, body: { action } }).unwrap();

      setShowConfirm(false);
      if (onToggleStatus) onToggleStatus(chat.id, result?.isActive);
    } catch (err) {
      console.error("Toggle group chat failed", err);
    }
  };
  console.log(chat);

  return (
    <Model title={t("ChatPage.chat-details") || "Chat Details"} open={open} setOpen={setOpen}>
      <div className="space-y-6 p-5">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-4">
            <Avatar photo={chat.photo || ""} username={chat.name} />
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900">{chat.name}</h2>
              <span className={`mt-1 w-fit rounded-full px-2 py-0.5 text-xs font-medium ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{status}</span>
            </div>
          </div>
        </div>

        {/* General Information */}
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 text-sm">
          <div>
            <div className="text-xs text-gray-500">{t("ChatPage.members")}</div>
            <div className="font-medium text-gray-800">{members.length}</div>
          </div>

          {/* <div>
            <div className="text-xs text-gray-500">{t("common.unread") || "Unread"}</div>
            <div className="font-medium text-gray-800">{unreadCount}</div>
          </div> */}

          <div>
            <div className="text-xs text-gray-500">{t("common.createdAt")}</div>
            <div className="font-medium text-gray-800">{moment(createdAt).format("YYYY/MM/DD")}</div>
          </div>

          {/* <div>
            <div className="text-xs text-gray-500">{t("ChatPage.last-message") || "Last Message"}</div>
            <div className="font-medium text-gray-800 truncate">{chat.lastMessage?.content || "-"}</div>
            <div className="text-xs text-gray-500 mt-1">{lastMessageTime}</div>
          </div> */}
        </div>

        {/* Members List */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">{t("ChatPage.members-list") || "Members"}</h3>
            <>
              {chat.type !== "DIRECT_MESSAGE" && (
                <button
                  onClick={handleToggle}
                  disabled={isLoading || isPatching}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isActive ? "bg-red-500 hover:bg-red-600 focus:ring-red-400 text-white" : "bg-green-500 hover:bg-green-600 focus:ring-green-400 text-white"}
              disabled:opacity-70 disabled:cursor-not-allowed`}>
                  {(isLoading || isPatching) && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading || isPatching
                    ? t("common.loading") || "Processing..."
                    : isActive
                    ? t("ChatPage.disable-chat") || "Disable Chat"
                    : t("ChatPage.enable-chat") || "Enable Chat"}
                </button>
              )}

              {/* Confirmation modal */}
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
            </>
          </div>

          <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
            {members.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {members.map((member: any) => (
                  <li key={member.id} className="flex justify-between items-center py-2 text-sm">
                    <span className="font-medium text-gray-700">{member.memberName}</span>
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
    </Model>
  );
};

export default ChatDetailsModel;
