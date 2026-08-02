"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button, Card, Input } from "@/components/ui";
import { createSocket, joinConversation, leaveConversation } from "@/lib/socket";
import { getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  deleteMessageForEveryone,
  deleteMessageForMe,
  getContractMessages,
  sendContractMessage,
} from "@/services/message";
import { isMessageVisible, type Message } from "@/types/message";
import type { Socket } from "socket.io-client";

function formatTimestamp(value: string) {
  try {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function mergeMessage(current: Message[], incoming: Message): Message[] {
  const index = current.findIndex((item) => item.id === incoming.id);
  if (index === -1) return [...current, incoming];
  const next = [...current];
  next[index] = { ...next[index], ...incoming };
  return next;
}

function MessageBubble({
  message,
  isMine,
  onDeleteForMe,
  onDeleteForEveryone,
}: {
  message: Message;
  isMine: boolean;
  onDeleteForMe: (message: Message) => void;
  onDeleteForEveryone: (message: Message) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const longPressRef = useRef<number | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  const isDeleted = message.is_deleted || message.deleted_for_everyone || message.message_type === "deleted";

  const openMenu = (clientX: number, clientY: number) => {
    if (isDeleted) return;
    setMenuPos({ x: clientX, y: clientY });
    setMenuOpen(true);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    openMenu(event.clientX, event.clientY);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    if (isDeleted) return;
    const touch = event.touches[0];
    longPressRef.current = window.setTimeout(() => {
      openMenu(touch.clientX, touch.clientY);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener("click", close);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("scroll", close, true);
    };
  }, [menuOpen]);

  return (
    <>
      <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
        <div
          ref={bubbleRef}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchEnd}
          className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
            isDeleted
              ? "border border-dashed border-border bg-muted/20 italic text-muted"
              : isMine
                ? "bg-brand-gradient text-white"
                : "border border-border bg-background/60 text-foreground"
          }`}
        >
          {!isDeleted && (
            <p className="text-xs font-semibold opacity-80">
              {isMine ? "You" : message.sender?.full_name ?? "Participant"}
            </p>
          )}
          <p className={`mt-1 whitespace-pre-wrap ${isDeleted ? "text-xs" : ""}`}>
            {isDeleted ? "This message was deleted" : message.content}
          </p>
          <p className={`mt-1 text-[10px] ${isDeleted ? "opacity-60" : "opacity-70"}`}>
            {formatTimestamp(message.created_at)}
          </p>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed z-[300] min-w-[11rem] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg"
          style={{ left: menuPos.x, top: menuPos.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm hover:bg-border/40"
            onClick={() => {
              setMenuOpen(false);
              onDeleteForMe(message);
            }}
          >
            Delete for me
          </button>
          {isMine && (
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
              onClick={() => {
                setMenuOpen(false);
                onDeleteForEveryone(message);
              }}
            >
              Delete for everyone
            </button>
          )}
        </div>
      )}
    </>
  );
}

export function ContractMessagesPanel({ contractId }: { contractId: number }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteEveryone, setConfirmDeleteEveryone] = useState<Message | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const visibleMessages = messages.filter((message) => isMessageVisible(message, user?.id));

  const loadMessages = useCallback(async () => {
    const response = await getContractMessages(contractId);
    setConversationId(response.conversation_id);
    setMessages(response.messages);
  }, [contractId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    loadMessages()
      .catch((err) => {
        if (!active) return;
        setError(getErrorMessage(err, "Unable to load messages for this contract."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadMessages]);

  useEffect(() => {
    if (!conversationId) return;

    const socket = createSocket();
    socketRef.current = socket;

    const handleNewMessage = (message: Message) => {
      setMessages((current) => mergeMessage(current, message));
    };

    const handleMessageUpdated = (message: Message) => {
      setMessages((current) => mergeMessage(current, message));
    };

    socket.on("connect", () => joinConversation(socket, conversationId));
    socket.on("new_message", handleNewMessage);
    socket.on("message_updated", handleMessageUpdated);

    return () => {
      leaveConversation(socket, conversationId);
      socket.off("new_message", handleNewMessage);
      socket.off("message_updated", handleMessageUpdated);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages]);

  const handleDeleteForMe = async (message: Message) => {
    try {
      await deleteMessageForMe(message.id);
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id
            ? {
                ...item,
                deleted_for_sender: item.sender_id === user?.id ? true : item.deleted_for_sender,
                deleted_for_receiver: item.sender_id !== user?.id ? true : item.deleted_for_receiver,
              }
            : item
        )
      );
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete message."));
    }
  };

  const handleDeleteForEveryone = async () => {
    if (!confirmDeleteEveryone) return;
    try {
      const updated = await deleteMessageForEveryone(confirmDeleteEveryone.id);
      setMessages((current) => mergeMessage(current, updated));
      setConfirmDeleteEveryone(null);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete message for everyone."));
      setConfirmDeleteEveryone(null);
    }
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    try {
      const message = await sendContractMessage(contractId, content);
      setDraft("");
      setMessages((current) => mergeMessage(current, message));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send message."));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted">Loading conversation…</p>;
  }

  if (error && !conversationId) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <>
      <Card className="flex h-[32rem] flex-col overflow-hidden p-0">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {visibleMessages.length === 0 ? (
            <p className="text-sm text-muted">No messages yet. Start the conversation below.</p>
          ) : (
            visibleMessages.map((message) => {
              const isMine = message.sender_id === user?.id;
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isMine={isMine}
                  onDeleteForMe={(item) => void handleDeleteForMe(item)}
                  onDeleteForEveryone={(item) => setConfirmDeleteEveryone(item)}
                />
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {error && conversationId && (
          <p className="px-4 pb-2 text-xs text-destructive">{error}</p>
        )}

        <form onSubmit={(event) => void handleSend(event)} className="flex gap-2 border-t border-border p-4">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a message…"
            disabled={!conversationId || sending}
          />
          <Button
            type="submit"
            variant="gradient"
            className="rounded-full"
            disabled={!conversationId || sending || !draft.trim()}
          >
            {sending ? "Sending…" : "Send"}
          </Button>
        </form>
      </Card>

      <ConfirmDialog
        open={!!confirmDeleteEveryone}
        onClose={() => setConfirmDeleteEveryone(null)}
        onConfirm={() => void handleDeleteForEveryone()}
        title="Delete for everyone?"
        description="Delete this message for everyone? This cannot be undone."
        confirmLabel="Delete for everyone"
        confirmVariant="destructive"
        titleId="delete-message-everyone-title"
        descId="delete-message-everyone-desc"
      />
    </>
  );
}
