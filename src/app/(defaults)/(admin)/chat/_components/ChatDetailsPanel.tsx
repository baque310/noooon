import React from "react";
import Avatar from "@/components/common/Avatar";
import { DeleteIcons } from "@/components/common/icons/Actions";
import { IChat } from "@/services/admin/chat";
import moment from "moment";
import "moment/locale/ar";

interface ChatDetailsPanelProps {
  chat: IChat | null;
  onToggleStatus: (chatId: string, updatedStatus?: string) => void;
  onRemoveChat: () => void;
  isRemoving?: boolean;
  isLoading?: boolean;
}

const ChatDetailsPanel: React.FC<ChatDetailsPanelProps> = ({ chat, onToggleStatus, onRemoveChat, isRemoving = false, isLoading }) => {
  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 p-6">
        <div className="text-center">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-sm">اختر محادثة لعرض التفاصيل</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Profile Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Avatar and Name */}
        <div className="text-center mb-6">
          <Avatar photo={""} username={chat.name} className="!bg-[#2C6E91] !w-20 !h-20 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900">{chat.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${chat?.isActive ? "bg-green-400" : "bg-gray-400"}`} />
            <p className="text-sm text-gray-500">{chat.membersCount} عضو</p>
          </div>
        </div>

        {/* Chat Information */}
        <div className="space-y-4">
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">معلومات المحادثة</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">النوع:</span>
                <span className="font-medium text-gray-900">{chat.type}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">الحالة:</span>
                <span className={`font-medium ${chat.isActive ? "text-green-600" : "text-gray-600"}`}>{chat.isActive ? "نشط" : "غير نشط"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">تاريخ الإنشاء:</span>
                <span className="font-medium text-gray-900">{moment(chat.createdAt).format("DD/MM/YYYY")}</span>
              </div>
              {chat.lastMessage && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">آخر رسالة:</span>
                  <span className="font-medium text-gray-900">{moment(chat.lastMessage.createdAt).format("DD/MM/YYYY")}</span>
                </div>
              )}
              {chat.unreadCount > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">الرسائل غير المقروءة:</span>
                  <span className="font-medium bg-[#2C6E91] text-white px-2 py-1 rounded-full text-xs">{chat.unreadCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Members Section */}
          {chat.ChatRoomMember && chat.ChatRoomMember.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">الأعضاء</h3>
              <div className="space-y-2">
                {chat.ChatRoomMember.slice(0, 5).map((member: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <Avatar photo={member.photo || ""} username={member.name || `عضو ${index + 1}`} className="!w-8 !h-8 !bg-[#2C6E91]" />
                    <span className="text-sm text-gray-700">{member.name || `عضو ${index + 1}`}</span>
                  </div>
                ))}
                {chat.ChatRoomMember.length > 5 && <p className="text-xs text-gray-500 text-center py-2">+ {chat.ChatRoomMember.length - 5} أعضاء آخرين</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Remove Button at Bottom */}
      <div className="border-t bg-white p-4">
        <button
          onClick={onRemoveChat}
          disabled={isRemoving}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm">
          {isRemoving ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
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
    </div>
  );
};

export default ChatDetailsPanel;
