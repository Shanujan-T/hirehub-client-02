import { io, type Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export function createSocket(token: string): Socket {
  return io(API_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    // Callers attach listeners before explicitly connecting. This prevents a
    // React effect cleanup from closing an in-flight handshake during dev remounts.
    autoConnect: false,
  });
}

export function joinConversation(socket: Socket, conversationId: number) {
  socket.emit("join_conversation", { conversation_id: conversationId });
}

export function leaveConversation(socket: Socket, conversationId: number) {
  socket.emit("leave_conversation", { conversation_id: conversationId });
}
