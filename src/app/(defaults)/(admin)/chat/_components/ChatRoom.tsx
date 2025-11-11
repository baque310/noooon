"use client";

import { useChatMessageRemoveMutation, useChatWithFileMessageMutation } from "@/services/admin/chat";
import SocketService from "@/services/socket-io/SocketService";
import React, { useState, useEffect, useRef, useCallback, useImperativeHandle } from "react";
import { IJoinedRoom, IMessage } from "@/services/socket-io/types";
import { ScrollArea } from "@mantine/core";
import { LoadingForm } from "@/components/Form/loadingForm";
import Avatar from "@/components/common/Avatar";
import { getTranslation } from "@/ni18n/i18n";
import cookie from "cookie";
import { BASE_URL } from "@/services/api";
import NoMessagesIcon from "@/components/common/icons/NoMessagesIcon";

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

const toAbsUrl = (maybePath?: string) => {
  if (!maybePath) return "";
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  const joined = `${BASE_URL}${maybePath}`.replace("//uploads/", "/uploads/");
  return joined;
};

const ChatRoom = React.forwardRef<ChatRoomHandle, ChatRoomProps>(({ roomId, onSelectionChange }, ref) => {
  const { t } = getTranslation();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [chatMessageRemove] = useChatMessageRemoveMutation();
  const [ChatWithFileMessage] = useChatWithFileMessageMutation();

  const scrollToBottom = useCallback(() => {
    viewport.current?.scrollTo({
      top: viewport.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const handleJoinedRoom = useCallback((data: IJoinedRoom) => {
    if (data?.success) {
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

  const handleError = useCallback((e: { message?: string }) => {
    setError(e?.message || "حدث خطأ غير متوقع");
  }, []);

  useEffect(() => {
    setIsLoading(true);
    SocketService.emit("join_room", { roomId });

    SocketService.on("joined_room", handleJoinedRoom);
    SocketService.on("roomStatus", handleRoomStatus);
    SocketService.on("messageSent", handleNewMessage);
    SocketService.on("newMessage", handleNewMessage);
    SocketService.on("error", handleError);

    return () => {
      SocketService.off("joined_room", handleJoinedRoom);
      SocketService.off("roomStatus", handleRoomStatus);
      SocketService.off("messageSent", handleNewMessage);
      SocketService.off("newMessage", handleNewMessage);
      SocketService.off("error", handleError);
    };
  }, [roomId, handleJoinedRoom, handleRoomStatus, handleNewMessage, handleError]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    // cleanup preview objectURL if any
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = newMessage.trim();
    if ((!trimmed && !attachedImage) || !roomStatus?.canSendMessages || sending) return;

    setSending(true);
    try {
      let uploadedFileUrl: string | undefined;
      if (attachedImage) {
        const formData = new FormData();
        formData.append("roomId", roomId);
        formData.append("message", trimmed || "");
        formData.append("file", attachedImage);

        await ChatWithFileMessage(formData).unwrap();
      } else {
        const payload = {
          roomId,
          message: trimmed || "-",
          messageType: attachedImage ? "image+text" : "text",
          file: uploadedFileUrl,
        };

        SocketService.emit("sendMessage", payload);
      }

      setNewMessage("");
      setAttachedImage(null);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }

      // actual message will arrive via "messageSent"/"newMessage"
      // you could also reconcile tmp by replacing it when same timestamp etc.
    } catch (e) {
      // rollback optimistic
      setMessages((prev) => prev.filter((m) => !m._id?.toString().startsWith("tmp-")));
      console.error("Error sending message:", e);
      setError("تعذر إرسال الرسالة");
    } finally {
      setSending(false);
    }
  }, [newMessage, attachedImage, roomId, roomStatus?.canSendMessages, ChatWithFileMessage, sending]);

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
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  const handleSelectMessage = useCallback(
    (msg: IMessage) => {
      setSelectedMessages((prev) => {
        const exists = prev.includes(msg._id);
        const next = exists ? prev.filter((id) => id !== msg._id) : [...prev, msg._id];
        onSelectionChange?.(next);
        return next;
      });
    },
    [onSelectionChange]
  );

  const handleDeleteSelected = useCallback(async () => {
    if (selectedMessages.length === 0) return;
    const ids = [...selectedMessages];
    try {
      await Promise.all(ids.map((messageId) => chatMessageRemove({ messageId }).unwrap()));
      setMessages((prev) => prev.filter((m) => !ids.includes(m._id)));
    } catch (e) {
      console.error("Failed to delete messages", e);
      setError("تعذر حذف بعض الرسائل");
    } finally {
      setSelectedMessages([]);
      onSelectionChange?.([]);
    }
  }, [selectedMessages, chatMessageRemove, onSelectionChange]);

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
    <div className="flex flex-col h-full bg-white">
      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3" viewportRef={viewport} offsetScrollbars scrollbarSize={6}>
        <div className="pb-4 flex flex-col">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingForm />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
              <div className="text-4xl mb-3">
                <NoMessagesIcon className="w-20 h-32 mb-4 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium mb-1">لا توجد رسائل بعد</h3>
              <p className="text-sm">ابدأ المحادثة بإرسال أول رسالة</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const sender = (msg.senderType || "").toString().toUpperCase();
              const isAdmin = sender === "ADMIN";
              const isSelected = selectedMessages.includes(msg._id);
              const imgSrc = msg.image ? toAbsUrl(msg.image) : toAbsUrl(msg.fileUrl);
              // console.log(msg.fileUrl);

              const prevMsg = messages[index - 1];
              const prevSender = prevMsg ? (prevMsg.senderType || "").toString().toUpperCase() : null;
              const sameSender = prevSender === sender;

              // const sameDay = prevMsg && new Date(msg.createdAt).toDateString() === new Date(prevMsg.createdAt).toDateString();
              const sameHour =
                prevMsg &&
                new Date(msg.createdAt).getFullYear() === new Date(prevMsg.createdAt).getFullYear() &&
                new Date(msg.createdAt).getMonth() === new Date(prevMsg.createdAt).getMonth() &&
                new Date(msg.createdAt).getDate() === new Date(prevMsg.createdAt).getDate() &&
                new Date(msg.createdAt).getHours() === new Date(prevMsg.createdAt).getHours();

              const isGrouped = sameSender && sameHour;

              const isLastInGroup =
                !messages[index + 1] ||
                messages[index + 1].senderType !== msg.senderType ||
                new Date(messages[index + 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

              return (
                <div
                  key={msg._id}
                  className={`flex w-full ${isAdmin ? "justify-start" : "justify-end"} transition-all duration-200 ${isGrouped ? "mt-[2px]" : "mt-3"}`}
                  onDoubleClick={() => {
                    if (selectedMessages.length === 0) {
                      setSelectedMessages([msg._id]);
                      onSelectionChange?.([msg._id]);
                    }
                  }}
                  onClick={() => {
                    if (selectedMessages.length > 0) handleSelectMessage(msg);
                  }}>
                  {/* Avatar or reserved space */}
                  <div className="flex-shrink-0 w-9">
                    {isAdmin && (
                      <div className={isGrouped ? "invisible" : ""}>
                        <Avatar username={msg.senderName} photo="" className="bg-[#E3E3E3] text-[#767676]" />
                      </div>
                    )}
                  </div>

                  <div className={`relative max-w-[75%] mx-2 group ${isSelected ? "bg-blue-50 rounded-2xl" : ""}`}>
                    {/* Show sender info only for first message in group */}
                    {!isGrouped && (
                      <div className={`flex items-center gap-2 ${isAdmin ? "justify-start pl-2" : "justify-end pr-2"}`}>
                        <span className={`text-xs font-semibold ${isAdmin ? "text-primary" : "text-gray-700"}`}>{msg.senderName === "current_user" ? "أنت" : msg.senderName}</span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            sender === "STUDENT" ? "bg-green-100 text-green-700" : sender === "ADMIN" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                          }`}>
                          {t(sender as any)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`px-4 py-2 rounded-2xl shadow-sm ${
                        isAdmin ? "bg-[#2C6E91] text-white rounded-tr-sm" : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm"
                      }`}>
                      {imgSrc ? (
                        <div className="flex flex-col gap-2">
                          <img src={imgSrc} alt="sent image" className="rounded-lg max-w-xs" />
                          {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                      )}
                    </div>

                    {/* Timestamp only for last message in the group */}
                    {isLastInGroup && <div className={`text-[10px] text-gray-400 px-1 mt-0.5 ${isAdmin ? "text-right" : "text-left"}`}>{formatTimestamp(msg.createdAt)}</div>}
                  </div>

                  {/* Placeholder for non-admin to keep alignment */}
                  <div className="flex-shrink-0 w-9">
                    {!isAdmin && (
                      <div className={isGrouped ? "invisible" : ""}>
                        <Avatar username={msg.senderName} photo="" className="bg-[#2C6E91]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-gray-200 bg-[#FAFBFC] p-4 flex flex-col gap-2">
        {attachedImage && (
          <div className="relative w-32 h-32">
            <img src={attachedImage ? (previewUrlRef.current ||= URL.createObjectURL(attachedImage)) : ""} alt="preview" className="w-full h-full object-cover rounded-lg border" />
            <button
              onClick={() => {
                setAttachedImage(null);
                if (previewUrlRef.current) {
                  URL.revokeObjectURL(previewUrlRef.current);
                  previewUrlRef.current = null;
                }
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white w-7 rounded-full p-1 shadow"
              title="إزالة الصورة">
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            id="chat-image-upload"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setAttachedImage(file);
              e.currentTarget.value = "";
            }}
          />

          <div className="relative flex-1 bg-[#FAFBFC]">
            <textarea
              className="w-full resize-none bg-[#FAFBFC] rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-all"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك هنا..."
              disabled={!roomStatus?.canSendMessages || sending}
              rows={1}
              style={{ minHeight: 44, maxHeight: 120 }}
            />

            {/* Attachment button moved to the right side */}
            <button
              type="button"
              onClick={() => document.getElementById("chat-image-upload")?.click()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              title="إرفاق صورة">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  fill="currentColor"
                  d="M20 7.3c0-.875-.347-1.714-.965-2.334a3.31 3.31 0 0 0-4.673-.001h.001l-9.397 9.398h-.001a3.31 3.31 0 0 0 0 4.671l.119.113a3.31 3.31 0 0 0 4.554-.113l6.35-6.354a1.35 1.35 0 0 0 0-1.907l-.098-.09a1.35 1.35 0 0 0-1.809.09L7.425 17.43a1 1 0 0 1-1.414-1.414l6.656-6.658a3.35 3.35 0 0 1 4.614-.114l.12.114l.001.001a3.35 3.35 0 0 1 0 4.734l-6.352 6.356a5.31 5.31 0 0 1-7.498 0H3.55a5.31 5.31 0 0 1 0-7.499l9.4-9.4a5.31 5.31 0 0 1 7.306-.18l.191.18l.001.002a5.31 5.31 0 0 1 0 7.498l-.138.137a1 1 0 1 1-1.413-1.414l.136-.136c.619-.62.966-1.46.966-2.336"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={sendMessage}
            disabled={(!newMessage.trim() && !attachedImage) || !roomStatus?.canSendMessages || sending}
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
              (newMessage.trim() || attachedImage) && roomStatus?.canSendMessages && !sending
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                : "bg-blue-100 text-blue-400 cursor-not-allowed"
            } transition`}
            title={sending ? "جاري الإرسال..." : "إرسال"}>
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 18V15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path
                d="M11.7483 2.81997L3.66332 8.36997C2.75332 8.98997 2.16998 10.3 2.36832 11.28L3.91998 19.24C4.19998 20.66 5.78665 21.81 7.46665 21.81H20.5333C22.2017 21.81 23.8 20.65 24.08 19.24L25.6317 11.28C25.8183 10.3 25.235 8.98997 24.3367 8.36997L16.2517 2.82997C15.0033 1.96997 12.985 1.96997 11.7483 2.81997Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

ChatRoom.displayName = "ChatRoom";
export default ChatRoom;
