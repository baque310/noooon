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
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError("تعذر الوصول إلى الميكروفون");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioBlob(null);
      setRecordingTime(0);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (["pdf"].includes(ext || "")) {
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.5,15.5C15.5,17.7 13.7,19.5 11.5,19.5C9.3,19.5 7.5,17.7 7.5,15.5V10H9.5V15.5C9.5,16.6 10.4,17.5 11.5,17.5C12.6,17.5 13.5,16.6 13.5,15.5V10H15.5V15.5M13,9V3.5L18.5,9H13Z" />
        </svg>
      );
    }

    if (["doc", "docx"].includes(ext || "")) {
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.5,18H13.5L11,13L8.5,18H6.5L10,11L6.5,4H8.5L11,9L13.5,4H15.5L12,11L15.5,18M13,9V3.5L18.5,9H13Z" />
        </svg>
      );
    }

    if (["xls", "xlsx"].includes(ext || "")) {
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M15.2,18H13.8L12,15.2L10.2,18H8.8L11.1,14.5L8.8,11H10.2L12,13.8L13.8,11H15.2L12.9,14.5L15.2,18M13,9V3.5L18.5,9H13Z" />
        </svg>
      );
    }

    return (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    );
  };

  const sendMessage = useCallback(async () => {
    const trimmed = newMessage.trim();
    if ((!trimmed && !attachedImage && !attachedFile && !audioBlob) || !roomStatus?.canSendMessages || sending) return;
    // console.log(newMessage);

    setSending(true);
    try {
      // If there's any file attachment (image, file, or audio), use FormData
      if (audioBlob || attachedImage || attachedFile) {
        const formData = new FormData();
        formData.append("roomId", roomId);
        formData.append("message", trimmed || "");

        if (audioBlob) {
          const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
          formData.append("file", audioFile);
        } else if (attachedImage) {
          formData.append("file", attachedImage);
        } else if (attachedFile) {
          // console.log(attachedFile);
          formData.append("file", attachedFile);
        }

        await ChatWithFileMessage(formData).unwrap();
      } else {
        // For text-only messages, use socket emit
        const payload = {
          roomId,
          message: trimmed,
          messageType: "text",
        };

        SocketService.emit("sendMessage", payload);
      }

      setNewMessage("");
      setAttachedImage(null);
      setAttachedFile(null);
      setAudioBlob(null);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    } catch (e) {
      setMessages((prev) => prev.filter((m) => !m._id?.toString().startsWith("tmp-")));
      console.error("Error sending message:", e);
      setError("تعذر إرسال الرسالة");
    } finally {
      setSending(false);
    }
  }, [newMessage, attachedImage, attachedFile, audioBlob, roomId, roomStatus?.canSendMessages, ChatWithFileMessage, sending]);
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

  const renderMessageContent = (msg: IMessage) => {
    const imgSrc = msg.image ? toAbsUrl(msg.image) : toAbsUrl(msg.fileUrl);
    const fileUrl = toAbsUrl(msg.fileUrl);

    // Check if it's a voice message
    if (fileUrl && (fileUrl.includes(".webm") || fileUrl.includes(".mp3") || fileUrl.includes(".wav"))) {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
            </svg>
            <audio controls className="flex-1" src={fileUrl}>
              متصفحك لا يدعم عنصر الصوت.
            </audio>
          </div>
          {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}
        </div>
      );
    }

    // Check if it's an image
    if (imgSrc && (msg.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || msg.image)) {
      return (
        <div className="flex flex-col gap-2">
          <img src={imgSrc} alt="sent image" className="rounded-lg max-w-xs" />
          {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}
        </div>
      );
    }

    // Check if it's a file
    if (fileUrl && msg.fileUrl) {
      const fileName = msg.fileUrl.split("/").pop() || "file";
      const fileSize = msg.fileSize ? `${(msg.fileSize / 1024).toFixed(1)} KB` : "";

      return (
        <div className="flex flex-col gap-2">
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white/10 rounded-lg p-3 hover:bg-white/20 transition">
            <div className="text-white/80">{getFileIcon(fileName)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName}</p>
              {fileSize && <p className="text-xs opacity-70">{fileSize}</p>}
            </div>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </a>
          {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}
        </div>
      );
    }

    // Text only
    return <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>;
  };

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

              const prevMsg = messages[index - 1];
              const prevSender = prevMsg ? (prevMsg.senderType || "").toString().toUpperCase() : null;
              const sameSender = prevSender === sender;

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
                  <div className="flex-shrink-0 w-9">
                    {isAdmin && (
                      <div className={isGrouped ? "invisible" : ""}>
                        <Avatar username={msg.senderName} photo="" className="!bg-[#2C6E91]" />
                      </div>
                    )}
                  </div>

                  <div className={`relative max-w-[75%] mx-2 group ${isSelected ? "bg-blue-50 rounded-2xl" : ""}`}>
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
                      {renderMessageContent(msg)}
                    </div>

                    {isLastInGroup && <div className={`text-[10px] text-gray-400 px-1 mt-0.5 ${isAdmin ? "text-right" : "text-left"}`}>{formatTimestamp(msg.createdAt)}</div>}
                  </div>

                  <div className="flex-shrink-0 w-9">
                    {!isAdmin && (
                      <div className={isGrouped ? "invisible" : ""}>
                        <Avatar username={msg.senderName} photo="" className="!bg-[#E3E3E3] !text-[#767676]" />
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
        {/* Voice recording indicator */}
        {isRecording && (
          <div className="flex items-center gap-3 bg-red-50 rounded-lg p-3 border border-red-200">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-600">جاري التسجيل...</span>
              <span className="text-sm text-red-500">{formatRecordingTime(recordingTime)}</span>
            </div>
            <button onClick={cancelRecording} className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition">
              إلغاء
            </button>
            <button onClick={stopRecording} className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition">
              إيقاف
            </button>
          </div>
        )}

        {/* Audio preview */}
        {audioBlob && !isRecording && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 shadow-sm">
            <div className="flex-shrink-0 p-2.5 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-600 mb-1">تسجيل صوتي</p>
              <audio controls className="w-full h-6" src={URL.createObjectURL(audioBlob)}>
                متصفحك لا يدعم عنصر الصوت.
              </audio>
              <p className="text-xs text-gray-500 mt-1">الحجم: {(audioBlob.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => setAudioBlob(null)} className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition hover:text-red-600" title="إزالة التسجيل">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
        )}

        {/* Image preview */}
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

        {/* File preview */}
        {attachedFile && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="text-gray-600">{getFileIcon(attachedFile.name)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachedFile.name}</p>
              <p className="text-xs text-gray-500">{(attachedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => setAttachedFile(null)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition" title="إزالة الملف">
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              // Set as image if the selected file is an image, otherwise as a generic file
              if (file.type.startsWith("image/")) {
                setAttachedImage(file);
                setAttachedFile(null);
              } else {
                setAttachedFile(file);
                setAttachedImage(null);
              }
              e.currentTarget.value = "";
            }}
          />

          {/* Attachment buttons: combined attach + record */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
                aria-label="إرفاق ملف أو صورة"
                title="إرفاق ملف أو صورة"
                className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    fill="currentColor"
                    d="M20 7.3c0-.875-.347-1.714-.965-2.334a3.31 3.31 0 0 0-4.673-.001h.001l-9.397 9.398h-.001a3.31 3.31 0 0 0 0 4.671l.119.113a3.31 3.31 0 0 0 4.554-.113l6.35-6.354a1.35 1.35 0 0 0 0-1.907l-.098-.09a1.35 1.35 0 0 0-1.809.09L7.425 17.43a1 1 0 0 1-1.414-1.414l6.656-6.658a3.35 3.35 0 0 1 4.614-.114l.12.114l.001.001a3.35 3.35 0 0 1 0 4.734l-6.352 6.356a5.31 5.31 0 0 1-7.498 0H3.55a5.31 5.31 0 0 1 0-7.499l9.4-9.4a5.31 5.31 0 0 1 7.306-.18l.191.18l.001.002a5.31 5.31 0 0 1 0 7.498l-.138.137a1 1 0 1 1-1.413-1.414l.136-.136c.619-.62.966-1.46.966-2.336"
                  />
                </svg>
              </button>

              {/* show selected filename or image name (if any) */}
              {(attachedImage || attachedFile) && <div className="max-w-[10rem] truncate text-xs text-gray-700 pl-1">{attachedImage?.name || attachedFile?.name}</div>}
            </div>

            <div>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                aria-pressed={isRecording}
                aria-label={isRecording ? "إيقاف التسجيل" : "تسجيل صوتي"}
                title={isRecording ? "إيقاف التسجيل" : "تسجيل صوتي"}
                className={`p-2 rounded-lg transition ${
                  isRecording ? "bg-red-500 text-white hover:bg-red-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                } focus:outline-none focus:ring-2 focus:ring-blue-300`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="relative flex-1 bg-[#FAFBFC]">
            <textarea
              className="w-full resize-none bg-[#FAFBFC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-all"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك هنا..."
              disabled={!roomStatus?.canSendMessages || sending || isRecording}
              rows={1}
              style={{ minHeight: 44, maxHeight: 120 }}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={(!newMessage.trim() && !attachedImage && !attachedFile && !audioBlob) || !roomStatus?.canSendMessages || sending || isRecording}
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
              (newMessage.trim() || attachedImage || attachedFile || audioBlob) && roomStatus?.canSendMessages && !sending && !isRecording
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                : "bg-blue-100 text-blue-400 cursor-not-allowed"
            } transition`}
            title={sending ? "جاري الإرسال..." : "إرسال"}>
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 18V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
