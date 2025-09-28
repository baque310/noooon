"use client";

import { useChatMessageRemoveMutation } from "@/services/admin/chat";
import SocketService from "@/services/socket-io/SocketService";
import React, { useState, useEffect, useRef, useCallback, useImperativeHandle } from "react";
import { IJoinedRoom, IMessage } from "@/services/socket-io/types";
import { ScrollArea } from "@mantine/core";
import { LoadingForm } from "@/components/Form/loadingForm";
import Avatar from "@/components/common/Avatar";
import { getTranslation } from "@/ni18n/i18n";
import { DeleteIcons } from "@/components/common/icons/Actions";

interface RoomStatus {
  isRoomActive: boolean;
  canSendMessages: boolean;
}

interface ChatRoomProps {
  roomId: string;
  onSelectionChange?: (ids: string[]) => void;
}

export interface ChatRoomHandle {
  deleteSelected: () => Promise<void>;
  getSelectedMessages: () => string[];
}

const ChatRoom = React.forwardRef<ChatRoomHandle, ChatRoomProps>(({ roomId, onSelectionChange }, ref) => {
  const { t } = getTranslation();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

  const [chatMessageRemove] = useChatMessageRemoveMutation();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const viewport = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    viewport.current?.scrollTo({
      top: viewport.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const handleJoinedRoom = useCallback((data: IJoinedRoom) => {
    if (data.success) {
      setMessages(data.previousMessages || []);
      setIsLoading(false);
      setError(null);
    } else {
      setError("فشل في الانضمام للغرفة");
      setIsLoading(false);
    }
  }, []);

  const handleRoomStatus = useCallback((data: RoomStatus) => {
    setRoomStatus(data);
  }, []);

  const handleNewMessage = useCallback((data: IMessage) => {
    setMessages((prev) => [...prev, data]);
  }, []);

  const handleError = useCallback((error: { message: string }) => {
    setError(error.message || "حدث خطأ غير متوقع");
  }, []);

  useEffect(() => {
    setIsLoading(true);
    SocketService.emit("join_room", { roomId });
    SocketService.on("joined_room", handleJoinedRoom);
    SocketService.on("roomStatus", handleRoomStatus);
    SocketService.on("messageSent", (data: IMessage) => setMessages((prev) => [...prev, data]));
    SocketService.on("newMessage", handleNewMessage);
    SocketService.on("error", handleError);

    return () => {
      SocketService.off("joined_room", handleJoinedRoom);
      SocketService.off("roomStatus", handleRoomStatus);
      SocketService.off("messageSent");
      SocketService.off("newMessage", handleNewMessage);
      SocketService.off("error", handleError);
    };
  }, [roomId, handleJoinedRoom, handleRoomStatus, handleNewMessage, handleError]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(() => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || !roomStatus?.canSendMessages) return;

    SocketService.emit("sendMessage", {
      roomId,
      message: trimmedMessage,
      messageType: "text",
    });
    setNewMessage("");
  }, [newMessage, roomId, roomStatus?.canSendMessages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const formatTimestamp = useCallback((timestamp: string | number | Date) => {
    return new Date(timestamp).toLocaleString("ar", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    });
  }, []);

  const handleSelectMessage = useCallback(
    (msg: IMessage) => {
      setSelectedMessages((prev) => {
        const newArray = [...prev];
        if (newArray.includes(msg._id)) {
          const filtered = newArray.filter((id) => id !== msg._id);
          onSelectionChange?.(filtered);
          return filtered;
        } else {
          newArray.push(msg._id);
          onSelectionChange?.(newArray);
          return newArray;
        }
      });
    },
    [onSelectionChange]
  );

  const handleDeleteSelected = useCallback(async () => {
    if (selectedMessages.length === 0) return;
    const idsToDelete = [...selectedMessages];
    try {
      for (const messageId of idsToDelete) {
        await chatMessageRemove({ messageId }).unwrap();
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      }
    } catch (err) {
      console.error("Failed to delete messages", err);
    } finally {
      setSelectedMessages([]);
      onSelectionChange?.([]);
    }
  }, [selectedMessages, chatMessageRemove, onSelectionChange]);

  // expose methods to parent
  useImperativeHandle(
    ref,
    () => ({
      deleteSelected: handleDeleteSelected,
      getSelectedMessages: () => selectedMessages,
    }),
    [handleDeleteSelected, selectedMessages]
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">حدث خطأ</h3>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3" viewportRef={viewport} offsetScrollbars scrollbarSize={6}>
        <div className="space-y-4 pb-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingForm />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="text-lg font-medium mb-1">لا توجد رسائل بعد</h3>
              <p className="text-sm">ابدأ المحادثة بإرسال أول رسالة</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex items-end gap-2 ${msg.senderType !== "ADMIN" ? "justify-end" : "justify-start"} ${
                  selectedMessages.includes(msg._id) ? "bg-blue-100" : ""
                } p-1 rounded-lg transition`}
                onDoubleClick={() => {
                  if (selectedMessages.length === 0) {
                    setSelectedMessages([msg._id]);
                    onSelectionChange?.([msg._id]);
                  }
                }}
                onClick={() => {
                  if (selectedMessages.length > 0) handleSelectMessage(msg);
                }}>
                {msg.senderType !== "ADMIN" && <Avatar username={msg.senderName} photo="" />}
                <div className={`max-w-[70%] ${msg.senderType === "ADMIN" ? "order-2" : ""}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      msg.senderType === "ADMIN" ? "bg-blue-500 text-white rounded-br-md shadow-md" : "bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm"
                    }`}>
                    {msg.senderType !== "ADMIN" && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-600">{msg.senderName}</span>
                        <span
                          className={`text-[10px] px-1 py-0.5 rounded-full ${
                            msg.senderType === "STUDENT"
                              ? "bg-green-100 text-green-700"
                              : msg.senderType === "TEACHER"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                          {t(msg.senderType as any)}
                        </span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                  </div>
                  <div className={`text-[10px] text-gray-400 px-1 ${msg.senderType === "ADMIN" ? "text-right" : "text-left"}`}>{formatTimestamp(msg.createdAt)}</div>
                </div>
                {msg.senderType === "ADMIN" && (
                  <div className="flex-shrink-0 order-1">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow">
                      <span className="text-white text-xs font-medium">{msg.senderName.charAt(0)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-gray-200 scrollbar-hide bg-white p-4 flex items-end gap-3">
        <textarea
          className="w-full resize-none border scrollbar-hide border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-all"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالتك هنا..."
          disabled={!roomStatus?.canSendMessages}
          rows={1}
          autoFocus
          style={{ minHeight: 44, maxHeight: 120 }}
          onInput={(e) => {
            // const target = e.target as HTMLTextAreaElement;
            // target.style.height = "44px";
            // target.style.height = Math.min(target.scrollHeight, 110) + "px";
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim() || !roomStatus?.canSendMessages}
          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
            newMessage.trim() && roomStatus?.canSendMessages ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" : "bg-blue-100 text-blue-400 cursor-not-allowed"
          } transition`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
});

ChatRoom.displayName = "ChatRoom";
export default ChatRoom;
