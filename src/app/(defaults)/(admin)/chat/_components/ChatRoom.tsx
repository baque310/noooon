"use client";

import {
  useChatMessageRemoveMutation,
  useChatWithFileMessageMutation,
} from "@/services/admin/chat";
import SocketService from "@/services/socket-io/SocketService";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
} from "react";
import { IJoinedRoom, IMessage } from "@/services/socket-io/types";
import { ScrollArea } from "@mantine/core";
import { LoadingForm } from "@/components/Form/loadingForm";
import Avatar from "@/components/common/Avatar";
import { getTranslation } from "@/ni18n/i18n";
import cookie from "cookie";
import { BASE_URL } from "@/services/api";

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

const ChatRoom = React.forwardRef<ChatRoomHandle, ChatRoomProps>(
  ({ roomId, onSelectionChange }, ref) => {
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
    }, [
      roomId,
      handleJoinedRoom,
      handleRoomStatus,
      handleNewMessage,
      handleError,
    ]);

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
      if (
        (!trimmed && !attachedImage) ||
        !roomStatus?.canSendMessages ||
        sending
      )
        return;

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
        setMessages((prev) =>
          prev.filter((m) => !m._id?.toString().startsWith("tmp-"))
        );
        console.error("Error sending message:", e);
        setError("تعذر إرسال الرسالة");
      } finally {
        setSending(false);
      }
    }, [
      newMessage,
      attachedImage,
      roomId,
      roomStatus?.canSendMessages,
      ChatWithFileMessage,
      sending,
    ]);

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
          const exists = prev.includes(msg._id);
          const next = exists
            ? prev.filter((id) => id !== msg._id)
            : [...prev, msg._id];
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
        await Promise.all(
          ids.map((messageId) => chatMessageRemove({ messageId }).unwrap())
        );
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
      <div className="flex flex-col h-full bg-gray-50">
        {/* Messages */}
        <ScrollArea
          className="flex-1 px-4 py-3"
          viewportRef={viewport}
          offsetScrollbars
          scrollbarSize={6}
        >
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
              messages.map((msg) => {
                const sender = (msg.senderType || "").toString().toUpperCase();
                const isAdmin = sender === "ADMIN";
                const isSelected = selectedMessages.includes(msg._id);

                const imgSrc = msg.image
                  ? toAbsUrl(msg.image)
                  : toAbsUrl(msg.fileUrl);

                return (
                  <div
                    key={msg._id}
                    className={`flex w-full ${
                      isAdmin ? "justify-start" : "justify-end"
                    } transition-all duration-200`}
                    onDoubleClick={() => {
                      if (selectedMessages.length === 0) {
                        setSelectedMessages([msg._id]);
                        onSelectionChange?.([msg._id]);
                      }
                    }}
                    onClick={() => {
                      if (selectedMessages.length > 0) handleSelectMessage(msg);
                    }}
                  >
                    {isAdmin && (
                      <div className="flex-shrink-0">
                        <Avatar username={msg.senderName} photo="" />
                      </div>
                    )}

                    <div
                      className={`relative max-w-[75%] mx-2 group ${
                        isSelected ? "bg-blue-50 rounded-2xl" : ""
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 mb-1 ${
                          isAdmin ? "justify-start pl-2" : "justify-end pr-2"
                        }`}
                      >
                        <span
                          className={`text-xs font-semibold ${
                            isAdmin ? "text-primary" : "text-gray-700"
                          }`}
                        >
                          {msg.senderName}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            sender === "STUDENT"
                              ? "bg-green-100 text-green-700"
                              : sender === "ADMIN"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {t(sender as any)}
                        </span>
                      </div>

                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm ${
                          isAdmin
                            ? "bg-blue-500 text-white rounded-tr-md"
                            : "bg-white text-gray-800 border border-gray-200 rounded-tl-md"
                        }`}
                      >
                        {imgSrc ? (
                          <div className="flex flex-col gap-2">
                            <img
                              src={imgSrc}
                              alt="sent image"
                              className="rounded-lg border border-gray-200 max-w-xs"
                            />
                            {msg.message && (
                              <p className="text-sm leading-relaxed">
                                {msg.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {msg.message}
                          </p>
                        )}
                      </div>

                      <div
                        className={`text-[10px] text-gray-400 px-1 ${
                          isAdmin ? "text-right" : "text-left"
                        }`}
                      >
                        {formatTimestamp(msg.createdAt)}
                      </div>
                    </div>

                    {!isAdmin && (
                      <div className="flex-shrink-0">
                        <Avatar username={msg.senderName} photo="" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-4 flex flex-col gap-2">
          {attachedImage && (
            <div className="relative w-32 h-32">
              <img
                src={
                  attachedImage
                    ? (previewUrlRef.current ||=
                        URL.createObjectURL(attachedImage))
                    : ""
                }
                alt="preview"
                className="w-full h-full object-cover rounded-lg border"
              />
              <button
                onClick={() => {
                  setAttachedImage(null);
                  if (previewUrlRef.current) {
                    URL.revokeObjectURL(previewUrlRef.current);
                    previewUrlRef.current = null;
                  }
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white w-7 rounded-full p-1 shadow"
                title="إزالة الصورة"
              >
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

            <div className="relative flex-1">
              <textarea
                className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-all"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالتك هنا..."
                disabled={!roomStatus?.canSendMessages || sending}
                rows={1}
                style={{ minHeight: 44, maxHeight: 120 }}
              />
              <button
                type="button"
                onClick={() =>
                  document.getElementById("chat-image-upload")?.click()
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                title="إرفاق صورة"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                >
                  <path
                    fill="currentColor"
                    d="M20 7.3c0-.875-.347-1.714-.965-2.334a3.31 3.31 0 0 0-4.673-.001h.001l-9.397 9.398h-.001a3.31 3.31 0 0 0 0 4.671l.119.113a3.31 3.31 0 0 0 4.554-.113l6.35-6.354a1.35 1.35 0 0 0 0-1.907l-.098-.09a1.35 1.35 0 0 0-1.809.09L7.425 17.43a1 1 0 0 1-1.414-1.414l6.656-6.658a3.35 3.35 0 0 1 4.614-.114l.12.114l.001.001a3.35 3.35 0 0 1 0 4.734l-6.352 6.356a5.31 5.31 0 0 1-7.498 0H3.55a5.31 5.31 0 0 1 0-7.499l9.4-9.4a5.31 5.31 0 0 1 7.306-.18l.191.18l.001.002a5.31 5.31 0 0 1 0 7.498l-.138.137a1 1 0 1 1-1.413-1.414l.136-.136c.619-.62.966-1.46.966-2.336"
                  />
                </svg>
              </button>
            </div>

            <button
              onClick={sendMessage}
              disabled={
                (!newMessage.trim() && !attachedImage) ||
                !roomStatus?.canSendMessages ||
                sending
              }
              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                (newMessage.trim() || attachedImage) &&
                roomStatus?.canSendMessages &&
                !sending
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  : "bg-blue-100 text-blue-400 cursor-not-allowed"
              } transition`}
              title={sending ? "جاري الإرسال..." : "إرسال"}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ChatRoom.displayName = "ChatRoom";
export default ChatRoom;
