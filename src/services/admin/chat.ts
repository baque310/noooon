import { api } from "@/services/api";
import { BaseGetDataResponse, GetDataRequestParams } from "../types/BaseType";

export interface IChat {
  id: string;
  name: string;
  type: string;
  rocketChatId: string;
  isActive: string;
  createdAt: string;
  lastMessage: {
    content: string;
    senderName: string;
    createdAt: string;
  };
  participantInfo: null;
  membersCount: number;
}
export interface IChatGetDataResponse extends BaseGetDataResponse<IChat> {
  success: boolean;
  message: string;
}

export interface AddChatPayload {
  targetUserId: string;
  targetUserType: ChatTargetUserType;
  initialMessage: string;
}

export type ChatTargetUserType = "teacher" | "student" | "parent";

export interface AddChatMessagePayload {
  roomId: string;
  message: string;
  messageType: "text";
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
  stageId: string;
  classId: string;
  sectionId: string;
}

export const Chat = api.injectEndpoints({
  endpoints: (build) => ({
    ChatGetData: build.query<IChatGetDataResponse, GetDataRequestParams>({
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
    ChatMessage: build.mutation<IChat, AddChatMessagePayload>({
      query: (body) => ({
        url: `admin/chat/message`,
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

    ChatMessageRemove: build.mutation<void, { messageId: string }>({
      query: ({ messageId }) => ({
        url: `admin/chat/message/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ChatMessageRemoved", "ChatGetData"],
    }),
  }),
});
export const {
  useChatGetDataQuery,
  useLazyChatGetDataQuery,
  useChatCreateClassParentsGroupMutation,
  useChatCreateSchoolStaffGroupMutation,
  useChatCreateSubjectTeachersGroupMutation,
  useChatCreateClassStudentsGroupMutation,
  useChatToggleGroupChatMutation,
  useChatDirectMutation,
  useChatMessageMutation,
  useChatMessageRemoveMutation,
} = Chat;
