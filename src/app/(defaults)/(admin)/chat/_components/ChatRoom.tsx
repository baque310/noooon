import SocketService from "@/services/socket-io/SocketService";
import React, { useState, useEffect, useRef, useCallback } from "react";

import {
  IJoinedRoom,
  IMessage,
  IMessageSent,
} from "@/services/socket-io/types";
import { ScrollArea } from "@mantine/core";
import { LoadingForm } from "@/components/Form/loadingForm";
import Avatar from "@/components/common/Avatar";
import { getTranslation } from "@/ni18n/i18n";

interface RoomStatus {
  isRoomActive: boolean;
  canSendMessages: boolean;
}

interface ChatRoomProps {
  roomId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  const { t } = getTranslation();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const viewport = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    viewport.current?.scrollTo({
      top: viewport.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const handleJoinedRoom = useCallback((data: IJoinedRoom) => {
    console.log("data", data);
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
    SocketService.on("messageSent", (data: IMessage) => {
      setMessages((prev) => [...prev, data]);
    });
    SocketService.on("newMessage", handleNewMessage);
    SocketService.on("error", handleError);

    return () => {
      SocketService.off("joined_room", handleJoinedRoom);
      SocketService.off("roomStatus", handleRoomStatus);
      SocketService.off("messageSent");
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-600 mb-2">حدث خطأ</h3>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages Area */}
      <ScrollArea
        className="flex-1 px-4 py-2"
        viewportRef={viewport}
        offsetScrollbars
        scrollbarSize={6}
      >
        <div className="space-y-4 pb-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingForm />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                لا توجد رسائل بعد
              </h3>
              <p className="text-sm text-gray-500">
                ابدأ المحادثة بإرسال أول رسالة
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${
                  msg.senderType !== "ADMIN" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.senderType !== "ADMIN" && (
                  <div className="flex-shrink-0">
                    <Avatar username={msg.senderName} photo="" />
                  </div>
                )}

                <div
                  className={`max-w-[70%] ${
                    msg.senderType === "ADMIN" ? "order-2" : ""
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.senderType === "ADMIN"
                        ? "bg-blue-500 text-white rounded-br-md"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm"
                    }`}
                  >
                    {/* Message header for non-admin messages */}
                    {msg.senderType !== "ADMIN" && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-600">
                          {msg.senderName}
                        </span>
                        <span
                          className={`text-xs lowercase px-1 py-0.5 rounded-full ${
                            msg.senderType === "ADMIN"
                              ? "bg-primary-light text-primary"
                              : msg.senderType === "STUDENT"
                              ? "bg-green-100 text-green-700"
                              : msg.senderType === "TEACHER"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {t(msg.senderType as any)}
                        </span>
                      </div>
                    )}

                    {/* Message content */}
                    <p
                      className={`text-sm leading-relaxed ${
                        msg.senderType === "ADMIN"
                          ? "text-white"
                          : "text-gray-800"
                      }`}
                    >
                      {msg.message}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div
                    className={`text-xs text-gray-500 mt-1 px-1 ${
                      msg.senderType === "ADMIN" ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTimestamp(msg.createdAt)}
                  </div>
                </div>

                {msg.senderType === "ADMIN" && (
                  <div className="flex-shrink-0 order-1">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {msg.senderName.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك هنا..."
              disabled={!roomStatus?.canSendMessages}
              rows={1}
              autoFocus
              style={{ minHeight: "44px", maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "44px";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !roomStatus?.canSendMessages}
            className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
              newMessage.trim() && roomStatus?.canSendMessages
                ? "bg-primary hover:bg-primary text-white shadow-sm hover:shadow-md"
                : "bg-primary/10 text-primary/60 cursor-not-allowed"
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>

        {/* Status indicators */}
        {roomStatus && (
          <div className="flex items-center justify-between mt-3 text-xs">
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-1 ${
                  roomStatus.isRoomActive ? "text-green-600" : "text-red-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    roomStatus.isRoomActive ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
                <span>
                  {roomStatus.isRoomActive ? "الغرفة نشطة" : "الغرفة غير نشطة"}
                </span>
              </div>

              <div
                className={`flex items-center gap-1 ${
                  roomStatus.canSendMessages ? "text-green-600" : "text-red-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    roomStatus.canSendMessages ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
                <span>
                  {roomStatus.canSendMessages
                    ? "يمكن الإرسال"
                    : "لا يمكن الإرسال"}
                </span>
              </div>
            </div>

            <div className="text-gray-500">{messages.length} رسالة</div>
          </div>
        )}
      </div>
    </div>
  );
};

ChatRoom.displayName = "ChatRoom";

export default ChatRoom;
