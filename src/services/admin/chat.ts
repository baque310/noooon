import { api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface IChat {
  id: string;
  name: string;
  type: string;
  rocketChatId: string;
  isActive: string;
  createdAt: string;
  unreadCount: number;
  lastMessage: {
    content: string;
    senderName: string;
    createdAt: string;
  };
  participantInfo: null;
  membersCount: number;
  ChatRoomMember: any[];
}
export interface IChatGetDataResponse extends BaseGetDataResponse<IChat> {
  success: boolean;
  message: string;
}

export interface AddChatPayload {
  targetUserId?: string;
  targetUserType: ChatTargetUserType;
  initialMessage: string;
}

export type ChatTargetUserType = "teacher" | "student" | "parent";

export interface AddChatMessagePayload {
  roomId: string;
  message: string;
  messageType?: "text";
  duration?: string;
  file?: string;
}

export interface AddChatCreateSchoolStaffGroupPayload {
  schoolId: string;
  groupName: string;
  description: string;
}
export interface AddChatCreateSubjectTeachersGroupPayload {
  subjectId: string;
  schoolId: string;
  groupName: string;
  description: string;
}

export interface AddChatCreateClassParentsGroupPayload {
  classId: string;
  teacherId: string;
  groupName: string;
  description: string;
}
export interface AddChatCreateClassStudentsGroupPayload {
  groupName?: string;
  stageId: string;
  classId: string;
  sectionId: string;
}

export interface AddChatCreateCustomTeachersGroupPayload {
  schoolId: string;
  teacherIds: string[];
  groupName: string;
  description: string;
}

export const Chat = api.injectEndpoints({
  endpoints: (build) => ({
    ChatGetData: build.query<IChatGetDataResponse, GetDataRequestParams & { chatType?: string; directUserType?: string }>({
      query: (params) => ({
        url: `admin/chat/my-chats`,
        params,
        method: "GET",
      }),
      providesTags: ["ChatGetData"],
    }),

    ChatDirect: build.mutation<IChat, AddChatPayload>({
      query: (body) => ({
        url: `admin/chat/direct`,
        body,
        method: "POST",
      }),
      invalidatesTags: (res) => (res ? ["ChatDirect", "ChatGetData"] : []),
    }),
    renameChat: build.mutation<IChat, { roomId: string } & AddChatPayload>({
      query: ({ roomId, ...body }) => ({
        url: `admin/chat/room/${roomId}/name`,
        method: "POST",
        body,
      }),
      invalidatesTags: (res) => (res ? ["ChatDirect", "ChatGetData"] : []),
    }),

    ChatMessage: build.mutation<IChat, AddChatMessagePayload>({
      query: (body) => ({
        url: `admin/chat/message`,
        body,
        method: "POST",
      }),
      invalidatesTags: (res) => (res ? ["ChatMessage", "ChatGetData"] : []),
    }),
    ChatWithFileMessage: build.mutation<
      {
        messageId: string;
        messageType: string;
        fileUrl: string;
        fileName: string;
        fileSize: number;
        fileMimeType: string;
        createdAt: string;
      },
      AddChatMessagePayload | FormData
    >({
      query: (body) => ({
        url: `admin/chat/files/upload`,
        body,
        method: "POST",
      }),
      invalidatesTags: (res) => (res ? ["ChatMessage", "ChatGetData"] : []),
    }),
    ChatCreateSchoolStaffGroup: build.mutation<IChat, AddChatCreateSchoolStaffGroupPayload>({
      query: (body) => ({
        url: `admin/chat/create-school-staff-group`,
        body,
        method: "POST",
      }),
      invalidatesTags: (res) => (res ? ["ChatCreateSchoolStaffGroup", "ChatGetData"] : []),
    }),
    ChatCreateSubjectTeachersGroup: build.mutation<IChat, AddChatCreateSubjectTeachersGroupPayload>({
      query: (body) => ({
        url: `admin/chat/create-subject-teachers-group`,
        body,
        method: "POST",
      }),
      invalidatesTags: (res) => (res ? ["ChatCreateSubjectTeachersGroup", "ChatGetData"] : []),
    }),
    ChatCreateClassParentsGroup: build.mutation<IChat, AddChatCreateClassParentsGroupPayload>({
      query: (body) => ({
        url: `admin/chat/create-class-parents-group`,
        body,
        method: "POST",
      }),
      invalidatesTags: (res) => (res ? ["ChatCreateClassParentsGroup", "ChatGetData"] : []),
    }),
    ChatCreateClassStudentsGroup: build.mutation<IChat, AddChatCreateClassStudentsGroupPayload>({
      query: (body) => ({
        url: `admin/chat/create-class-group`,
        body,
        method: "POST",
      }),
      invalidatesTags: (res) => (res ? ["ChatCreateClassStudentsGroup", "ChatGetData"] : []),
    }),
    // ChatCreateClassStudentsGroup: build.mutation<IChat, AddChatCreateClassStudentsGroupPayload>({
    //   query: (body) => ({
    //     url: `admin/chat/create-class-group`,
    //     body,
    //     method: "POST",
    //   }),
    //   invalidatesTags: (res) => (res ? ["ChatCreateClassStudentsGroup", "ChatGetData"] : []),
    // }),
    ChatToggleGroupChat: build.mutation<
      IChat,
      {
        roomId: string;
      }
    >({
      query: ({ roomId }) => ({
        url: `a/admin/chat/toggle-group-chat/${roomId}`,
        method: "POST",
      }),
      invalidatesTags: (res) => (res ? ["ChatToggleGroupChat", "ChatGetData"] : []),
    }),

    ToggleGroupChatUpdate: build.mutation<IChat, { roomId: string; body: { action: "ENABLE" | "DISABLE" } }>({
      query: ({ body, roomId }) => ({
        url: `admin/chat/toggle-group-chat/${roomId}`,
        body,
        method: "PATCH",
      }),
      invalidatesTags: ["ChatGetData", "ClassUpdate", "ClassGetDataById", "ClassGetData"],
    }),

    ChatMessageRemove: build.mutation<void, { messageId: string }>({
      query: ({ messageId }) => ({
        url: `admin/chat/message/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ChatMessageRemoved", "ChatGetData"],
    }),

    // ToggleGroupChatUpdate: build.mutation<IChat, { roomId: string; body: { action: "ENABLE" | "DISABLE" } }>({
    //   query: ({ body, roomId }) => ({
    //     url: `admin/chat/toggle-group-chat/${roomId}`,
    //     body,
    //     method: "PATCH",
    //   }),
    //   invalidatesTags: ["ChatGetData", "ClassUpdate", "ClassGetDataById", "ClassGetData"],
    // }),

    // ChatMessageRemove: build.mutation<void, { messageId: string }>({
    //   query: ({ messageId }) => ({
    //     url: `admin/chat/message/${messageId}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: ["ChatMessageRemoved", "ChatGetData"],
    // }),
    ///admin/chat/create-custom-teachers-group
    ChatCreateCustomTeachersGroup: build.mutation<IChat, AddChatCreateCustomTeachersGroupPayload>({
      query: (body) => ({
        url: `admin/chat/create-custom-teachers-group`,
        body,
        method: "POST",
      }),
      invalidatesTags: (res) => (res ? ["ChatCreateCustomTeachersGroup", "ChatGetData"] : []),
    }),

    ChatRemove: build.mutation<void, { roomId: string }>({
      query: ({ roomId }) => ({
        url: `admin/chat/room/${roomId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ChatRemove", "ChatGetData"],
      // Add this to force immediate refetch:
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Force refetch all ChatGetData queries
          dispatch(api.util.invalidateTags(["ChatGetData"]));
        } catch {}
      },
    }),
  }),
});
export const {
  useChatGetDataQuery,
  useLazyChatGetDataQuery,
  useRenameChatMutation,
  useChatCreateClassParentsGroupMutation,
  useChatCreateSchoolStaffGroupMutation,
  useChatCreateSubjectTeachersGroupMutation,
  useChatCreateClassStudentsGroupMutation,
  useChatToggleGroupChatMutation,
  useToggleGroupChatUpdateMutation,
  useChatDirectMutation,
  useChatMessageMutation,
  useChatWithFileMessageMutation,
  useChatMessageRemoveMutation,
  useChatCreateCustomTeachersGroupMutation,
  useChatRemoveMutation,
} = Chat;
