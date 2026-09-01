import type { MessageType } from "../enums/message-type.enum";
import type { MessageFile } from "./message-file.type";

export interface SocketUser {
    userId: string;
}

export interface PresenceUpdateData {
    userId: string;
    isOnline: boolean;
    lastSeen: Date;
}

export interface JoinConversationData {
    conversationId: string;
}

export interface LeaveConversationData {
    conversationId: string;
}

export interface SendMessageData {
    conversationId: string;
    content?: string;
    messageType?: MessageType;
    file?: MessageFile | null;
    tempId?: string;
}

export interface MarkAsReadData {
    conversationId: string;
}

export interface TypingData {
    conversationId: string;
    userId: string;
}

export interface EditMessageData {
    messageId: string;
    content: string;
}

export interface DeleteMessageData {
    messageId: string;
}
