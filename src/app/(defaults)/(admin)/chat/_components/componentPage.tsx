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
import NoMessagesIcon from "@/components/common/icons/NoMessagesIcon";
import moment from "moment";
import "moment/locale/ar";

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
  moment.locale("ar");

  const [connectionStatus, setConnectionStatus] = useState<Conn>("disconnected");
  const connectedOnceRef = useRef(false);
  const registeredRef = useRef(false);

  const adminData = useMemo(
    () => ({
      userId: session?.user?.id ?? "",
      userType: "ADMIN" as const,
      schoolId: session?.user?.schoolId ?? "",
    }),
    [session?.user?.id, session?.user?.schoolId]
  );

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
    chatType?: string;
    directUserType?: string;
  };

  const [param, setParam] = useState<QueryParam>({});

  const handleSelectStage = useCallback((value?: string) => {
    setParam((prev) => (value ? { ...prev, stageId: value } : { ...prev, stageId: undefined, classId: undefined, sectionId: undefined }));
  }, []);

  const handleSelectClass = useCallback((value?: string) => {
    setParam((prev) => (value ? { ...prev, classId: value } : { ...prev, classId: undefined, sectionId: undefined }));
  }, []);

  const handleSelectSection = useCallback((value?: string) => {
    setParam((prev) => (value ? { ...prev, sectionId: value } : { ...prev, sectionId: undefined }));
  }, []);

  const handleSelectChatType = useCallback((value?: string) => {
    setParam((prev) => (value ? { ...prev, chatType: value } : { ...prev, chatType: undefined }));
  }, []);

  const handleSelectDirectUser = useCallback((value?: string) => {
    setParam((prev) => (value ? { ...prev, directUserType: value } : { ...prev, directUserType: undefined }));
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
  // console.log(currentData);

  const tabs = [
    { key: "", chatType: "", label: "الكل" },
    { key: "STUDENT", chatType: "GROUP_CLASS_STUDENTS", label: "الطلاب" },
    { key: "TEACHER", chatType: "GROUP_SUBJECT_TEACHERS", label: "المعلمين" },
    { key: "PARENT", chatType: "GROUP_CLASS_PARENTS", label: "أولياء الأمور" },
  ];
  // const [activeTab, setActiveTab] = useState("");

  // const filteredChats = useMemo(() => {
  //   if (!currentData?.data) return [];
  //   if (activeTab === "all") return currentData.data;
  //   return currentData.data.filter((chat: IChat) => chat.type === activeTab);
  // }, [currentData, activeTab]);
  // console.log(filteredChats);

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
          setSelectedChat((prev) => {
            if (!prev) return prev;
            if (prev.id !== chatId) return prev;
            return {
              ...prev,
              isActive: updatedStatus,
            } as IChat;
          });
          return;
        }

        const res = await refetch();
        const updated = res?.data?.data?.find((c: IChat) => c.id === chatId) ?? null;
        setSelectedChat(updated);
      } catch (err) {
        console.error("Failed to refetch chats after toggle", err);
      }
    },
    [refetch]
  );

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-3 items-center">
            <h1 className="text-2xl font-bold text-gray-900">المحادثات</h1>
            <button
              className="flex items-center gap-2 bg-[#2C6E91] text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm hover:bg-[#2C6E91]/90 transition"
              onClick={() => setOpen(true)}>
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
                  options={StageData?.map((item) => ({ value: item.id, label: t(item.name as any) })) ?? []}
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
                      StageData?.find((it) => it.id === param.stageId)
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
            }`}>
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
      <div className="grid grid-cols-12 gap-2 h-[calc(100vh-170px)]">
        {/* List */}
        <div className="col-span-4 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="p-3">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12.5215 16.25C12.7358 16.25 12.9333 16.2504 13.0986 16.2617C13.2762 16.2739 13.4716 16.3007 13.6699 16.3828C14.0987 16.5604 14.4396 16.9013 14.6172 17.3301C14.6993 17.5284 14.7261 17.7238 14.7383 17.9014C14.7496 18.0667 14.75 18.2642 14.75 18.4785V19.5215C14.75 19.7358 14.7496 19.9333 14.7383 20.0986C14.7261 20.2762 14.6993 20.4716 14.6172 20.6699C14.4396 21.0987 14.0987 21.4396 13.6699 21.6172C13.4716 21.6993 13.2762 21.7261 13.0986 21.7383C12.9333 21.7496 12.7358 21.75 12.5215 21.75H12.4785C12.2642 21.75 12.0667 21.7496 11.9014 21.7383C11.7238 21.7261 11.5284 21.6993 11.3301 21.6172C10.9013 21.4396 10.5604 21.0987 10.3828 20.6699C10.3007 20.4716 10.2739 20.2762 10.2617 20.0986C10.2546 19.994 10.2519 19.8763 10.251 19.75H3C2.58579 19.75 2.25 19.4142 2.25 19C2.25 18.5858 2.58579 18.25 3 18.25H10.251C10.2519 18.1237 10.2546 18.006 10.2617 17.9014C10.2739 17.7238 10.3007 17.5284 10.3828 17.3301C10.5604 16.9013 10.9013 16.5604 11.3301 16.3828C11.5284 16.3007 11.7238 16.2739 11.9014 16.2617C12.0667 16.2504 12.2642 16.25 12.4785 16.25H12.5215ZM12.0039 17.7578C11.9371 17.7624 11.9087 17.7686 11.9014 17.7705C11.8426 17.7958 11.7958 17.8426 11.7705 17.9014C11.7686 17.9087 11.7624 17.9371 11.7578 18.0039C11.7504 18.1119 11.75 18.2568 11.75 18.5V19.5C11.75 19.7432 11.7504 19.8881 11.7578 19.9961C11.7624 20.0629 11.7686 20.0913 11.7705 20.0986C11.7958 20.1574 11.8426 20.2042 11.9014 20.2295C11.9087 20.2314 11.9371 20.2376 12.0039 20.2422C12.1119 20.2496 12.2568 20.25 12.5 20.25C12.7432 20.25 12.8881 20.2496 12.9961 20.2422C13.0629 20.2376 13.0913 20.2314 13.0986 20.2295C13.1574 20.2042 13.2042 20.1574 13.2295 20.0986C13.2314 20.0913 13.2376 20.0629 13.2422 19.9961C13.2496 19.8881 13.25 19.7432 13.25 19.5V18.5C13.25 18.2568 13.2496 18.1119 13.2422 18.0039C13.2376 17.9371 13.2314 17.9087 13.2295 17.9014C13.2042 17.8426 13.1574 17.7958 13.0986 17.7705C13.0913 17.7686 13.0629 17.7624 12.9961 17.7578C12.8881 17.7504 12.7432 17.75 12.5 17.75C12.2568 17.75 12.1119 17.7504 12.0039 17.7578ZM21 18.25C21.4142 18.25 21.75 18.5858 21.75 19C21.75 19.4142 21.4142 19.75 21 19.75H17C16.5858 19.75 16.25 19.4142 16.25 19C16.25 18.5858 16.5858 18.25 17 18.25H21ZM9.52148 8.75C9.73576 8.74999 9.93331 8.75044 10.0986 8.76172C10.2762 8.77386 10.4716 8.80066 10.6699 8.88281C11.0987 9.06043 11.4396 9.40132 11.6172 9.83008C11.6993 10.0284 11.7261 10.2238 11.7383 10.4014C11.7454 10.506 11.7481 10.6237 11.749 10.75H21C21.4142 10.75 21.75 11.0858 21.75 11.5C21.75 11.9142 21.4142 12.25 21 12.25H11.749C11.7481 12.3763 11.7454 12.494 11.7383 12.5986C11.7261 12.7762 11.6993 12.9716 11.6172 13.1699C11.4396 13.5987 11.0987 13.9396 10.6699 14.1172C10.4716 14.1993 10.2762 14.2261 10.0986 14.2383C9.93331 14.2496 9.73576 14.25 9.52148 14.25H9.47852C9.26424 14.25 9.06669 14.2496 8.90137 14.2383C8.72384 14.2261 8.52841 14.1993 8.33008 14.1172C7.90132 13.9396 7.56043 13.5987 7.38281 13.1699C7.30066 12.9716 7.27386 12.7762 7.26172 12.5986C7.25044 12.4333 7.24999 12.2358 7.25 12.0215V10.9785C7.24999 10.7642 7.25044 10.5667 7.26172 10.4014C7.27386 10.2238 7.30066 10.0284 7.38281 9.83008C7.56043 9.40132 7.90132 9.06043 8.33008 8.88281C8.52841 8.80066 8.72384 8.77386 8.90137 8.76172C9.06669 8.75044 9.26424 8.74999 9.47852 8.75H9.52148ZM9.00391 10.2578C8.9371 10.2624 8.90873 10.2686 8.90137 10.2705C8.84255 10.2958 8.79578 10.3426 8.77051 10.4014C8.76864 10.4087 8.76237 10.4371 8.75781 10.5039C8.75044 10.6119 8.75 10.7568 8.75 11V12C8.75 12.2432 8.75044 12.3881 8.75781 12.4961C8.76237 12.5629 8.76864 12.5913 8.77051 12.5986C8.79578 12.6574 8.84255 12.7042 8.90137 12.7295C8.90873 12.7314 8.9371 12.7376 9.00391 12.7422C9.11191 12.7496 9.25677 12.75 9.5 12.75C9.74323 12.75 9.88809 12.7496 9.99609 12.7422C10.0629 12.7376 10.0913 12.7314 10.0986 12.7295C10.1574 12.7042 10.2042 12.6574 10.2295 12.5986C10.2314 12.5913 10.2376 12.5629 10.2422 12.4961C10.2496 12.3881 10.25 12.2432 10.25 12V11C10.25 10.7568 10.2496 10.6119 10.2422 10.5039C10.2376 10.4371 10.2314 10.4087 10.2295 10.4014C10.2042 10.3426 10.1574 10.2958 10.0986 10.2705C10.0913 10.2686 10.0629 10.2624 9.99609 10.2578C9.88809 10.2504 9.74323 10.25 9.5 10.25C9.25677 10.25 9.11191 10.2504 9.00391 10.2578ZM5 10.75C5.41421 10.75 5.75 11.0858 5.75 11.5C5.75 11.9142 5.41421 12.25 5 12.25H3C2.58579 12.25 2.25 11.9142 2.25 11.5C2.25 11.0858 2.58579 10.75 3 10.75H5ZM14.5215 1.25C14.7358 1.24999 14.9333 1.25044 15.0986 1.26172C15.2762 1.27386 15.4716 1.30066 15.6699 1.38281C16.0987 1.56043 16.4396 1.90132 16.6172 2.33008C16.6993 2.52841 16.7261 2.72385 16.7383 2.90137C16.7496 3.06669 16.75 3.26424 16.75 3.47852V4.52148C16.75 4.73576 16.7496 4.93331 16.7383 5.09863C16.7261 5.27616 16.6993 5.47159 16.6172 5.66992C16.4396 6.09868 16.0987 6.43957 15.6699 6.61719C15.4716 6.69934 15.2762 6.72615 15.0986 6.73828C14.9333 6.74956 14.7358 6.75001 14.5215 6.75H14.4785C14.2642 6.75001 14.0667 6.74956 13.9014 6.73828C13.7238 6.72615 13.5284 6.69934 13.3301 6.61719C12.9013 6.43957 12.5604 6.09868 12.3828 5.66992C12.3007 5.47159 12.2739 5.27616 12.2617 5.09863C12.2546 4.994 12.2519 4.87631 12.251 4.75H3C2.58579 4.75 2.25 4.41421 2.25 4C2.25 3.58579 2.58579 3.25 3 3.25H12.251C12.2519 3.12369 12.2546 3.006 12.2617 2.90137C12.2739 2.72385 12.3007 2.52841 12.3828 2.33008C12.5604 1.90132 12.9013 1.56043 13.3301 1.38281C13.5284 1.30066 13.7238 1.27386 13.9014 1.26172C14.0667 1.25044 14.2642 1.24999 14.4785 1.25H14.5215ZM14.0039 2.75781C13.9371 2.76237 13.9087 2.76864 13.9014 2.77051C13.8426 2.79578 13.7958 2.84256 13.7705 2.90137C13.7686 2.90873 13.7624 2.93709 13.7578 3.00391C13.7504 3.11191 13.75 3.25677 13.75 3.5V4.5C13.75 4.74323 13.7504 4.88809 13.7578 4.99609C13.7624 5.06291 13.7686 5.09127 13.7705 5.09863C13.7958 5.15745 13.8426 5.20422 13.9014 5.22949C13.9087 5.23136 13.9371 5.23763 14.0039 5.24219C14.1119 5.24956 14.2568 5.25 14.5 5.25C14.7432 5.25 14.8881 5.24956 14.9961 5.24219C15.0629 5.23763 15.0913 5.23136 15.0986 5.22949C15.1574 5.20422 15.2042 5.15745 15.2295 5.09863C15.2314 5.09127 15.2376 5.0629 15.2422 4.99609C15.2496 4.88809 15.25 4.74323 15.25 4.5V3.5C15.25 3.25677 15.2496 3.11191 15.2422 3.00391C15.2376 2.93709 15.2314 2.90873 15.2295 2.90137C15.2042 2.84256 15.1574 2.79578 15.0986 2.77051C15.0913 2.76864 15.0629 2.76237 14.9961 2.75781C14.8881 2.75044 14.7432 2.75 14.5 2.75C14.2568 2.75 14.1119 2.75044 14.0039 2.75781ZM21 3.25C21.4142 3.25 21.75 3.58579 21.75 4C21.75 4.41421 21.4142 4.75 21 4.75H19C18.5858 4.75 18.25 4.41421 18.25 4C18.25 3.58579 18.5858 3.25 19 3.25H21Z"
                    fill="#2C6E91"
                  />
                </svg>
              </div>

              <input
                type="search"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="ابحث عن المحادثة ..."
                className="w-full rounded-md border border-gray-200 pl-10 pr-10 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#2C6E91]"
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 21l-4.35-4.35" />
                  <circle cx="11" cy="11" r="6" />
                </svg>
              </div>
            </div>
          </div>
          {/* Filter Tabs */}
          <div className="flex gap-2 px-3 pb-2 border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  handleSelectDirectUser(tab.key || undefined);
                  // handleSelectChatType(tab.chatType || undefined);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  param.directUserType === tab.key || (!param.directUserType && tab.key === "") ? "bg-[#2C6E91] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chats List (replace your original list render) */}
          {/* <div className="flex-1 overflow-y-auto">
            {isLoading || isFetching ? (
              <div className="p-6">
                <LoadingForm />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <NoMessagesIcon className="w-16 h-16 mb-4" />
                <p>لا توجد محادثات</p>
              </div>
            ) : (
              filteredChats.map((chat: IChat) => (
                <div key={chat.id} className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar src={chat.image} name={chat.name} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{chat.name}</p>
                      <p className="text-xs text-gray-500 truncate">{chat.lastMessage?.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div> */}
          <div className="flex-1 overflow-y-auto">
            {isLoading || isFetching ? (
              <div className="p-6">
                <LoadingForm />
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500 text-sm">خطأ في جلب البيانات</div>
            ) : currentData?.data?.length ? (
              <div>
                {currentData.data.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 cursor-pointer m-2 transition rounded-md hover:bg-[#E8F4F8] hover:border-gray-200 ${
                      selectedChat?.rocketChatId === chat.rocketChatId ? "bg-[#E8F4F8]" : "bg-[#FAFBFC]"
                    }`}>
                    <div className="flex items-start gap-3">
                      <div className="relative flex flex-col items-center">
                        <span className={`absolute left-2 border-2 border-white bottom-1 w-3 h-3 rounded-lg ${chat?.isActive ? "bg-green-400" : "bg-gray-400"}`} />
                        <Avatar photo={""} username={chat?.name} className="!bg-[#2C6E91]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{chat?.name}</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{chat?.ChatRoomMember?.length} عضو</p>
                      </div>
                    </div>
                    {chat?.lastMessage && (
                      <div className="mt-1 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            {chat.unreadCount > 0 && (
                              <span className="flex-shrink-0 bg-[#2C6E91] text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                                {chat.unreadCount}
                              </span>
                            )}
                            <span className="truncate">
                              {chat.lastMessage.content} <span className="text-gray-400">– {chat.lastMessage.senderName}</span>
                            </span>
                          </div>
                          <span className="ml-2 flex-shrink-0 text-gray-400">{formatTimestamp(chat.lastMessage.createdAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <div className="text-4xl mb-2">
                  <NoMessagesIcon className="w-20 h-32 mb-4 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">لا توجد محادثات</h3>
                <p className="text-sm text-gray-500">ستظهر المحادثات هنا عند توفرها</p>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="col-span-8 overflow-hidden bg-white rounded-2xl shadow-sm flex flex-col">
          {selectedChat ? (
            <>
              <div className="bg-white">
                <div className="p-4 flex items-center gap-3 justify-between">
                  <div onClick={() => setOpenChatDetails(true)} className="flex items-center gap-3 cursor-pointer">
                    <Avatar photo={""} username={selectedChat.name} className="!bg-[#2C6E91]" />
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
                        title="حذف الرسائل المحددة">
                        <DeleteIcons />
                      </button>
                    </div>
                  )}
                </div>

                {/* Decorative divider matching Figma design */}
                <div className="relative flex items-center justify-center h-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative px-4 bg-white">
                    <span className="text-xs text-gray-500 font-medium">{moment(selectedChat?.lastMessage?.createdAt || "").fromNow()}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                {selectedChat.rocketChatId ? (
                  <ChatRoom ref={chatRoomRef} roomId={selectedChat.rocketChatId} onSelectionChange={handleSelectionChange} />
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
                <div className="text-5xl mb-3 flex justify-center">
                  <NoMessagesIcon className="w-20 h-32 mb-4 text-gray-300" />
                </div>
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
