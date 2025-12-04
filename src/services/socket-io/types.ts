export interface IJoinedRoom {
  success: true;
  roomId: string;
  currentUserId: string;
  message: string;
  previousMessages: IMessage[];
}

export interface IMessage {
  fileSize: any;
  _id: string;
  message: string;
  createdAt: string;
  senderId: string;
  senderType: string;
  fileUrl: string;
  senderName: string;
  image?: string;
  roomId: string;
  messageType: string;
}

export interface IMessageSent {
  messageId: string;
  timestamp: string;
}
