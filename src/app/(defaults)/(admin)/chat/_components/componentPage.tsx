"use client";

import { IChat, useChatGetDataQuery } from "@/services/admin/chat";
import SocketService from "@/services/socket-io/SocketService";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ChatRoom, { ChatRoomHandle } from "./ChatRoom";
import { LoadingForm } from "@/components/Form/loadingForm";
import Avatar from "@/components/common/Avatar";
import { getTranslation } from "@/ni18n/i18n";
import CreateComponent from "./CreateComponent";
import ChatDetailsModel from "./ChatDetailsModel";
import { AddIcons, DeleteIcons } from "@/components/common/icons/Actions";
import { useSearchParams } from "next/navigation";
import { DataTableSortStatus } from "mantine-datatable";
import SelectFilter from "@/components/Filter/SelectFilter";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

type Conn = "disconnected" | "connecting" | "connected" | "error";

interface ComponentPageProps {
  token_refresh: string;
  token_access: string;
}

const ComponentPage: React.FC<ComponentPageProps> = ({ token_access }) => {
  const { data: session } = useSession();
  const { t } = getTranslation();

  const [open, setOpen] = useState(false);
  const [openChatDetails, setOpenChatDetails] = useState(false);
  const [selectedChat, setSelectedChat] = useState<IChat | null>(null);
  const [selectedMessagesCount, setSelectedMessagesCount] = useState(0);
  const chatRoomRef = useRef<ChatRoomHandle | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<Conn>("disconnected");
  const connectedOnceRef = useRef(false); // avoid double connect
  const registeredRef = useRef(false);

  const adminData = useMemo(
    () => ({
      userId: session?.user?.id ?? "",
      userType: "ADMIN" as const,
      schoolId: session?.user?.schoolId ?? "",
    }),
    [session?.user?.id, session?.user?.schoolId]
  );

  // ——— socket lifecycle
  const handleRegistered = useCallback((data: { success: boolean }) => {
    if (data?.success) {
      registeredRef.current = true;
      setConnectionStatus("connected");
    }
  }, []);

  const handleConnect = useCallback(() => {
    setConnectionStatus("connected");
    if (!registeredRef.current && adminData.userId && adminData.schoolId) {
      SocketService.register(adminData);
    }
  }, [adminData]);

  useEffect(() => {
    if (!token_access || !adminData.userId || connectedOnceRef.current) return;
    connectedOnceRef.current = true;
    setConnectionStatus("connecting");

    SocketService.connect(token_access);
    SocketService.on("registered", handleRegistered);
    SocketService.on("connect", handleConnect);
    SocketService.on("connect_error", () => setConnectionStatus("error"));
    SocketService.on("disconnect", () => {
      setConnectionStatus("disconnected");
      registeredRef.current = false;
    });

    return () => {
      SocketService.off("registered", handleRegistered);
      SocketService.off("connect", handleConnect);
      SocketService.off("connect_error");
      SocketService.off("disconnect");
      SocketService.disconnect();
      connectedOnceRef.current = false;
      registeredRef.current = false;
    };
  }, [token_access, adminData.userId, handleRegistered, handleConnect]);

  // ——— filters / query params
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [localSearch, setLocalSearch] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(localSearch, 400);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  type QueryParam = {
    search?: string;
    range?: string;
    classId?: string;
    sectionId?: string;
    stageId?: string;
  };

  const [param, setParam] = useState<QueryParam>({});

  // always use functional set to avoid stale spreads
  const handleSelectStage = useCallback((value?: string) => {
    setParam((prev) =>
      value
        ? { ...prev, stageId: value }
        : { ...prev, stageId: undefined, classId: undefined, sectionId: undefined }
    );
  }, []);

  const handleSelectClass = useCallback((value?: string) => {
    setParam((prev) =>
      value ? { ...prev, classId: value } : { ...prev, classId: undefined, sectionId: undefined }
    );
  }, []);

  const handleSelectSection = useCallback((value?: string) => {
    setParam((prev) => (value ? { ...prev, sectionId: value } : { ...prev, sectionId: undefined }));
  }, []);

  const params = useMemo(
    () => ({
      skip: 1,
      take: 100,
      sortBy: sortStatus.columnAccessor,
      sortDirection: sortStatus.direction,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...param,
    }),
    [sortStatus, debouncedSearch, param]
  );

  const { currentData, isLoading, error, isFetching, refetch } = useChatGetDataQuery(params);
  const { isFetching: isFetchingStageData, currentData: StageData } = useStageGetDataQuery();

  const formatTimestamp = useCallback((ts: string | number | Date) => {
    return new Date(ts).toLocaleString("ar", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    });
  }, []);

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedMessagesCount(ids.length);
  }, []);

  const handleDeleteSelectedFromHeader = useCallback(async () => {
    await chatRoomRef.current?.deleteSelected();
    setSelectedMessagesCount(0);
  }, []);

  const handleChatToggle = useCallback(
    async (chatId: string, updatedStatus?: string) => {
      try {
        if (updatedStatus) {
          setSelectedChat((prev) => (prev?.id === chatId ? ({ ...prev, isActive: updatedStatus } as IChat) : prev));
          return;
        }
        const res = await refetch();
        const updated = res?.data?.data?.find((c: IChat) => c.id === chatId) ?? null;
        setSelectedChat(updated);
      } catch (e) {
        console.error("Refetch after toggle failed", e);
      }
    },
    [refetch]
  );

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-3 items-center">
            <h1 className="text-2xl font-bold text-gray-900">المحادثات</h1>
            <button
              className="flex items-center gap-2 bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm hover:bg-primary/90 transition"
              onClick={() => setOpen(true)}
            >
              <AddIcons className="size-5" />
              إضافة محادثة
            </button>

            {/* Filters */}
            <div className="flex justify-start max-md:flex-col gap-3">
              <div className="flex flex-wrap gap-2 border border-gray-200 rounded">
                <SelectFilter
                  placement="bottom-end"
                  title={t("StudentEnrollmentPage.StageName")}
                  handleChange={handleSelectStage}
                  options={
                    StageData?.map((item) => ({ value: item.id, label: t(item.name as any) })) ?? []
                  }
                />
              </div>

              {param.stageId && (
                <div className="flex items-center gap-2 border border-gray-300 rounded-sm hover:bg-gray-100">
                  <SelectFilter
                    title={t("SectionPage.ClassName")}
                    placement="bottom-end"
                    handleChange={handleSelectClass}
                    options={
                      StageData?.find((it) => it.id === param.stageId)?.Class?.map((c) => ({
                        value: c.id,
                        label: t(c.name as any),
                      })) ?? []
                    }
                  />
                </div>
              )}

              {param.classId && (
                <div className="flex items-center gap-2 border border-gray-300 rounded-sm hover:bg-gray-100">
                  <SelectFilter
                    title={t("StudentEnrollmentPage.SectionName")}
                    placement="bottom-end"
                    handleChange={handleSelectSection}
                    options={
                      StageData
                        ?.find((it) => it.id === param.stageId)
                        ?.Class.find((it) => it.id === param.classId)
                        ?.Section?.map((s) => ({ value: s.id, label: t(s.name as any) })) ?? []
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Connection Status */}
          <div
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
              connectionStatus === "connected"
                ? "bg-green-100 text-green-800"
                : connectionStatus === "connecting"
                ? "bg-yellow-100 text-yellow-800"
                : connectionStatus === "error"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "connecting"
                  ? "bg-yellow-500"
                  : connectionStatus === "error"
                  ? "bg-red-500"
                  : "bg-gray-400"
              }`}
            />
            {t(connectionStatus as any)}
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-12 gap-2 h-[calc(100vh-200px)]">
        {/* List */}
        <div className="col-span-4 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">قائمة المحادثات</h2>
            <button
              onClick={() => setLocalSearch((s) => (s ? "" : s))}
              className="p-2 rounded-lg hover:bg-gray-200 transition"
              aria-label="Clear search"
              title="تفريغ البحث"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 5a6 6 0 100 12 6 6 0 000-12z" />
              </svg>
            </button>
          </div>

          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <input
                type="search"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="ابحث عن المحادثة ..."
                className="w-full rounded-md border border-gray-200 pl-10 pr-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading || isFetching ? (
              <div className="p-6">
                <LoadingForm />
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500 text-sm">خطأ في جلب البيانات</div>
            ) : currentData?.data?.length ? (
              <div className="divide-y divide-gray-100">
                {currentData.data.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 cursor-pointer transition rounded-md ${
                      selectedChat?.rocketChatId === chat.rocketChatId ? "bg-primary/10" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex flex-col items-center">
                        <span className={`absolute left-3 -top-0 w-2 h-2 rounded-full ${chat?.isActive ? "bg-green-400" : "bg-gray-400"}`} />
                        <Avatar photo={""} username={chat?.name} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{chat?.name}</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{chat?.ChatRoomMember?.length} عضو</p>
                        {chat?.lastMessage && (
                          <div className="text-xs text-gray-600 truncate">
                            <div className="flex justify-between text-gray-400 mt-1">
                              <span className="text-gray-600">
                                {chat.lastMessage.content} - {chat.lastMessage.senderName}
                              </span>
                              <span>{formatTimestamp(chat.lastMessage.createdAt)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <div className="text-4xl mb-2">💬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">لا توجد محادثات</h3>
                <p className="text-sm text-gray-500">ستظهر المحادثات هنا عند توفرها</p>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="col-span-8 overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
          {selectedChat ? (
            <>
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3 justify-between">
                <div onClick={() => setOpenChatDetails(true)} className="flex items-center gap-3 cursor-pointer">
                  <Avatar photo={""} username={selectedChat.name} />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      {selectedChat.name}
                      <span className={`w-2 h-2 rounded-full ${selectedChat?.isActive ? "bg-green-400" : "bg-gray-400"}`} />
                    </h2>
                    <p className="text-sm text-gray-500">{selectedChat.participantInfo}</p>
                  </div>
                </div>

                {selectedMessagesCount > 0 && (
                  <div className="inline-flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">الرسائل المحددة: {selectedMessagesCount}</span>
                    <button
                      onClick={handleDeleteSelectedFromHeader}
                      className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500 hover:bg-red-600 text-white shadow transition"
                      title="حذف الرسائل المحددة"
                    >
                      <DeleteIcons />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-hidden">
                {selectedChat.rocketChatId ? (
                  <ChatRoom
                    ref={chatRoomRef}
                    roomId={selectedChat.rocketChatId}
                    onSelectionChange={handleSelectionChange}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <div className="text-4xl mb-2">🚫</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">لا يوجد معرف غرفة</h3>
                      <p className="text-sm text-gray-500">لا يمكن عرض المحادثة بدون معرف الغرفة</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <div className="text-5xl mb-3">💬</div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">اختر محادثة</h2>
                <p className="text-sm text-gray-500">اختر محادثة من القائمة لعرض التفاصيل والرسائل</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateComponent open={open} setOpen={setOpen} />
      <ChatDetailsModel open={openChatDetails} setOpen={setOpenChatDetails} chat={selectedChat} onToggleStatus={handleChatToggle} />
    </div>
  );
};

export default ComponentPage;
