import { io, type Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export function createSocket(): Socket {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return io(API_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });
}

export function joinConversation(socket: Socket, conversationId: number) {
  socket.emit("join_conversation", { conversation_id: conversationId });
}

export function leaveConversation(socket: Socket, conversationId: number) {
  socket.emit("leave_conversation", { conversation_id: conversationId });
}
