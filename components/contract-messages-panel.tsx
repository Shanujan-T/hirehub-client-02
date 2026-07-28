"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card, Input } from "@/components/ui";
import { createSocket, joinConversation, leaveConversation } from "@/lib/socket";
import { getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { getContractMessages, sendContractMessage } from "@/services/message";
import type { Message } from "@/types/message";
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

export function ContractMessagesPanel({ contractId }: { contractId: number }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getContractMessages(contractId)
      .then((response) => {
        if (!active) return;
        setConversationId(response.conversation_id);
        setMessages(response.messages);
      })
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
  }, [contractId]);

  useEffect(() => {
    if (!conversationId) return;

    const socket = createSocket();
    socketRef.current = socket;

    const handleNewMessage = (message: Message) => {
      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) return current;
        return [...current, message];
      });
    };

    socket.on("connect", () => joinConversation(socket, conversationId));
    socket.on("new_message", handleNewMessage);

    return () => {
      leaveConversation(socket, conversationId);
      socket.off("new_message", handleNewMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    try {
      const message = await sendContractMessage(contractId, content);
      setDraft("");
      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) return current;
        return [...current, message];
      });
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
    <Card className="flex h-[32rem] flex-col overflow-hidden p-0">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted">No messages yet. Start the conversation below.</p>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    isMine
                      ? "bg-brand-gradient text-white"
                      : "border border-border bg-background/60 text-foreground"
                  }`}
                >
                  <p className="text-xs font-semibold opacity-80">
                    {isMine ? "You" : message.sender?.full_name ?? "Participant"}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{message.content}</p>
                  <p className="mt-1 text-[10px] opacity-70">{formatTimestamp(message.created_at)}</p>
                </div>
              </div>
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
        <Button type="submit" variant="gradient" className="rounded-full" disabled={!conversationId || sending || !draft.trim()}>
          {sending ? "Sending…" : "Send"}
        </Button>
      </form>
    </Card>
  );
}
