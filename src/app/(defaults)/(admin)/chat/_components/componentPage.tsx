"use client";

import { IChat, useChatGetDataQuery } from "@/services/admin/chat";
import SocketService from "@/services/socket-io/SocketService";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import ChatRoom from "./ChatRoom";
import { LoadingForm } from "@/components/Form/loadingForm";
import Avatar from "@/components/common/Avatar";
import { getTranslation } from "@/ni18n/i18n";
import CreateComponent from "./CreateComponent";
import { AddIcons } from "@/components/common/icons/Actions";
import { useSearchParams } from "next/navigation";
import { DataTableSortStatus } from "mantine-datatable";
import SelectFilter from "@/components/Filter/SelectFilter";
import { useStageGetDataQuery } from "@/services/admin/stage";

interface ComponentPageProps {
  token_refresh: string;
  token_access: string;
}

const ComponentPage: React.FC<ComponentPageProps> = ({ token_refresh, token_access }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const adminData = useMemo(
    () => ({
      userId: session?.user?.id || "",
      userType: "ADMIN" as const,
      schoolId: session?.user?.schoolId || "",
    }),
    [session?.user?.id, session?.user?.schoolId]
  );

  const handleRegistered = useCallback((data: { success: boolean }) => {
    if (data.success) {
      setIsRegistered(true);
      setConnectionStatus("connected");
    }
  }, []);

  const handleConnect = useCallback(() => {
    setConnectionStatus("connected");
    if (adminData.userId && adminData.schoolId) {
      SocketService.register(adminData);
    }
  }, [adminData]);

  useEffect(() => {
    if (!token_access || !adminData.userId) return;

    setConnectionStatus("connecting");
    SocketService.connect(token_access);

    SocketService.on("registered", handleRegistered);
    SocketService.on("connect", handleConnect);
    SocketService.on("connect_error", () => setConnectionStatus("error"));
    SocketService.on("disconnect", () => {
      setConnectionStatus("disconnected");
      setIsRegistered(false);
    });

    return () => {
      SocketService.off("registered", handleRegistered);
      SocketService.off("connect", handleConnect);
      SocketService.off("connect_error");
      SocketService.off("disconnect");
      SocketService.disconnect();
    };
  }, [token_access, adminData.userId, adminData.schoolId, handleRegistered, handleConnect]);

  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });
  const [param, setParam] = useState<
    | {
        search?: string;
        range?: string;
        classId?: string;
        sectionId?: string;
        stageId?: string;
      }
    | undefined
  >();
  const params = {
    skip: 1,
    take: 100,
    sortBy: sortStatus.columnAccessor,
    sortDirection: sortStatus.direction,
    ...(search && { search: search as string }),
    ...param,
  };
  const { currentData, isLoading, error, isFetching } = useChatGetDataQuery({ ...params });

  const handleSelectClass = (value: any) => {
    if (value) {
      setParam({ ...param, classId: value });
    } else {
      setParam({ ...param, classId: undefined, sectionId: undefined });
    }
  };
  const handleSelectSection = (value: any) => {
    if (value) {
      setParam({ ...param, sectionId: value });
    } else {
      setParam({ ...param, sectionId: undefined });
    }
  };
  const handleSelectStage = (value: any) => {
    if (value) {
      setParam({ ...param, stageId: value });
    } else {
      setParam({
        ...param,
        stageId: undefined,
        classId: undefined,
        sectionId: undefined,
      });
    }
  };

  const { isFetching: isFetchingStageData, currentData: StageData } = useStageGetDataQuery();

  const [selectedChat, setSelectedChat] = useState<IChat | null>(null);

  const formatTimestamp = useCallback((timestamp: string | number | Date) => {
    return new Date(timestamp).toLocaleString("ar", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    });
  }, []);
  const { t } = getTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-900">المحادثات</h1>
            <button className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100" onClick={() => setOpen(true)}>
              إضافة محادثة
              <AddIcons className="size-5" />
            </button>

            <div className={"flex justify-start max-md:flex-col gap-3"}>
              <div className="flex items-center gap-2 border border-gray-300 rounded-sm hover:bg-gray-100">
                <SelectFilter
                  placement="bottom-end"
                  title={t("StudentEnrollmentPage.StageName")}
                  handleChange={handleSelectStage}
                  options={
                    StageData?.map((item) => {
                      return {
                        value: item.id,
                        label: t(item.name as any),
                      };
                    }) ?? []
                  }
                />
              </div>

              {param?.stageId && (
                <div className="flex items-center gap-2 border border-gray-300 rounded-sm hover:bg-gray-100">
                  <SelectFilter
                    title={t("SectionPage.ClassName")}
                    placement="bottom-end"
                    handleChange={handleSelectClass}
                    options={
                      StageData?.find((it) => it.id == param?.stageId)?.Class?.map((item) => {
                        return {
                          value: item.id,
                          label: t(item.name as any),
                        };
                      }) ?? []
                    }
                  />
                </div>
              )}
              {param?.classId && (
                <div className="flex items-center gap-2 border border-gray-300 rounded-sm hover:bg-gray-100">
                  <SelectFilter
                    title={t("StudentEnrollmentPage.SectionName")}
                    placement="bottom-end"
                    handleChange={handleSelectSection}
                    options={
                      StageData?.find((it) => it.id == param?.stageId)
                        ?.Class.find((it) => it.id == param?.classId)
                        ?.Section?.map((item) => {
                          return {
                            value: item.id,
                            label: t(item.name as any),
                          };
                        }) ?? []
                    }
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                connectionStatus === "connected"
                  ? "bg-green-100 text-green-800"
                  : connectionStatus === "connecting"
                  ? "bg-yellow-100 text-yellow-800"
                  : connectionStatus === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
              <div
                className={`w-2 h-2 rounded-full mr-2 px-1 ${
                  connectionStatus === "connected"
                    ? "bg-green-400"
                    : connectionStatus === "connecting"
                    ? "bg-yellow-400"
                    : connectionStatus === "error"
                    ? "bg-red-400"
                    : "bg-gray-400"
                }`}
              />
              <div className="px-1">{t(connectionStatus as any)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Layout */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Chat List */}
        <div className="col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">قائمة المحادثات</h2>
          </div>

          <div className="overflow-y-auto h-full">
            {isLoading || isFetching ? (
              <div className="p-6">
                <LoadingForm />
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="text-red-500 text-sm">خطأ في جلب البيانات</div>
              </div>
            ) : currentData?.data.length ? (
              <div className="divide-y divide-gray-100">
                {currentData.data.map((chat, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-primary/10 ${selectedChat?.rocketChatId === chat.rocketChatId ? "bg-primary/10 " : ""}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <Avatar photo={""} username={chat?.name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {chat?.name}
                            <span className="inline-flex px-1 items-center ml-2">
                              <span className={chat?.isActive ? "w-2 h-2 rounded-full bg-green-400" : "w-2 h-2 rounded-full bg-gray-400"}></span>
                            </span>
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500">{chat?.membersCount} عضو</span>
                        </div>

                        {chat?.lastMessage && (
                          <div className="rounded-lg p-2 space-y-1">
                            <p className="text-xs text-gray-600 truncate">{chat.lastMessage.content}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{chat.lastMessage.senderName}</span>
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
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد محادثات</h3>
                <p className="text-sm text-gray-500">ستظهر المحادثات هنا عند توفرها</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Details */}
        <div className="col-span-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {selectedChat ? (
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar photo={""} username={selectedChat.name} />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedChat.name}
                        <span className="inline-flex px-1 items-center ml-2">
                          <span className={selectedChat?.isActive ? "w-2 h-2 rounded-full bg-green-400" : "w-2 h-2 rounded-full bg-gray-400"}></span>
                        </span>
                      </h2>
                      <p className="text-sm text-gray-600">{selectedChat.participantInfo}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Message Preview */}
              {/* {selectedChat.lastMessage?.content && (
                <div className="p-4 bg-blue-50 border-b border-gray-200">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-600">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        آخر رسالة:
                      </p>
                      <p className="text-sm text-blue-800">
                        {selectedChat.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </div>
              )} */}

              {/* Chat Room */}
              <div className="flex-1 overflow-hidden">
                {selectedChat.rocketChatId ? (
                  <ChatRoom roomId={selectedChat.rocketChatId} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🚫</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد معرف غرفة</h3>
                      <p className="text-sm text-gray-500">لا يمكن عرض المحادثة بدون معرف الغرفة</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-6">💬</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">اختر محادثة</h2>
                <p className="text-sm text-gray-500">اختر محادثة من القائمة لعرض التفاصيل والرسائل</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <CreateComponent open={open} setOpen={setOpen} />
    </div>
  );
};

export default ComponentPage;
