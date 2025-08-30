export interface IJoinedRoom {
  success: true;
  roomId: string;
  currentUserId: string;
  message: string;
  previousMessages: IMessage[];
}

export interface IMessage {
  _id: string;
  message: string;
  createdAt: string;
  senderId: string;
  senderType: string;
  senderName: string;
  roomId: string;
  messageType: string;
}

export interface IMessageSent {
  messageId: string;
  timestamp: string;
}
