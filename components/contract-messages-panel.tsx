"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button, Card, Input } from "@/components/ui";
import { createSocket, joinConversation, leaveConversation } from "@/lib/socket";
import { cn, getErrorMessage } from "@/lib/utils";
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
  const [menuShiftX, setMenuShiftX] = useState(0);
  const longPressRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isDeleted = message.is_deleted || message.deleted_for_everyone || message.message_type === "deleted";

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setMenuShiftX(0);
  }, []);

  const openMenu = useCallback(() => {
    if (isDeleted) return;
    setMenuOpen(true);
  }, [isDeleted]);

  const handleTouchStart = () => {
    if (isDeleted) return;
    longPressRef.current = window.setTimeout(() => {
      openMenu();
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
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      closeMenu();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("scroll", closeMenu, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("scroll", closeMenu, true);
    };
  }, [menuOpen, closeMenu]);

  // Keep menu fully on-screen: sent bubbles open left-aligned (align=end),
  // received open right-aligned (align=start), then clamp any residual overflow.
  useLayoutEffect(() => {
    if (!menuOpen || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const padding = 8;
    let shift = 0;
    if (rect.right > window.innerWidth - padding) {
      shift = window.innerWidth - padding - rect.right;
    } else if (rect.left < padding) {
      shift = padding - rect.left;
    }
    setMenuShiftX(shift);
  }, [menuOpen, isMine]);

  return (
    <div className={`group flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        ref={rootRef}
        className={cn("relative max-w-[80%]", isMine ? "items-end" : "items-start")}
        onContextMenu={(event) => {
          event.preventDefault();
          openMenu();
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
      >
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm",
            isDeleted
              ? "border border-dashed border-border bg-muted/20 italic text-muted"
              : isMine
                ? "bg-brand-gradient text-white"
                : "border border-border bg-background/60 text-foreground"
          )}
        >
          <div className="flex items-start gap-1">
            <div className="min-w-0 flex-1">
              {!isDeleted && (
                <p className="text-xs font-semibold opacity-80">
                  {isMine ? "You" : message.sender?.full_name ?? "Participant"}
                </p>
              )}
              <p className={cn("mt-1 whitespace-pre-wrap", isDeleted && "text-xs")}>
                {isDeleted ? "This message was deleted" : message.content}
              </p>
              <p className={cn("mt-1 text-[10px]", isDeleted ? "opacity-60" : "opacity-70")}>
                {formatTimestamp(message.created_at)}
              </p>
            </div>

            {!isDeleted && (
              <button
                type="button"
                aria-label="Message actions"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className={cn(
                  "mt-0.5 shrink-0 rounded-md p-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
                  isMine
                    ? "text-white/80 hover:bg-white/15 hover:text-white"
                    : "text-muted hover:bg-border/60 hover:text-foreground",
                  menuOpen && "opacity-100"
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuOpen((open) => !open);
                }}
              >
                <MoreVertical className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </div>

        {menuOpen && (
          <div
            ref={menuRef}
            role="menu"
            className={cn(
              "absolute z-50 mt-1 min-w-[160px] overflow-hidden rounded-lg border border-border bg-card py-1 text-card-foreground shadow-lg shadow-secondary/10 dark:shadow-black/40",
              // Sent (right) → align end so menu opens leftward; received → open rightward
              isMine ? "right-0" : "left-0"
            )}
            style={menuShiftX ? { transform: `translateX(${menuShiftX}px)` } : undefined}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-info/10"
              onClick={() => {
                closeMenu();
                onDeleteForMe(message);
              }}
            >
              Delete for me
            </button>
            {isMine && (
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                onClick={() => {
                  closeMenu();
                  onDeleteForEveryone(message);
                }}
              >
                Delete for everyone
              </button>
            )}
          </div>
        )}
      </div>
    </div>
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
