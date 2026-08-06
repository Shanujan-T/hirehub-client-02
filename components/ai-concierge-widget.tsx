"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { askConcierge, getConciergeStatus, type ConciergeResponse } from "@/services/ai";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const DEFAULT_CHIPS = [
  "What jobs is my community eligible for?",
  "Who on my team has the most experience?",
  "How much have I earned this month?",
];

export function AiConciergeWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [chips, setChips] = useState<string[]>(DEFAULT_CHIPS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || configured !== null) return;
    let cancelled = false;
    (async () => {
      try {
        const status = await getConciergeStatus();
        if (cancelled) return;
        setConfigured(status.configured);
        setStatusMessage(status.message ?? null);
        if (status.suggested_prompts?.length) setChips(status.suggested_prompts);
      } catch {
        if (cancelled) return;
        setConfigured(false);
        setStatusMessage("AI assistant is temporarily unavailable.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, configured]);

  useEffect(() => {
    if (!threadRef.current) return;
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, open, loading]);

  const pushAssistant = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}-${prev.length}`, role: "assistant", text },
    ]);
  }, []);

  const send = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || loading) return;

      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}-${prev.length}`, role: "user", text: q },
      ]);
      setInput("");
      setLoading(true);

      try {
        const res: ConciergeResponse = await askConcierge(q);
        if (res.suggested_prompts?.length) setChips(res.suggested_prompts);

        if (!res.configured) {
          setConfigured(false);
          pushAssistant(res.message || "AI assistant is not configured.");
          return;
        }
        setConfigured(true);

        if (res.answer) {
          pushAssistant(res.answer);
          return;
        }
        pushAssistant(res.message || "AI assistant is temporarily unavailable.");
      } catch {
        pushAssistant("AI assistant is temporarily unavailable.");
      } finally {
        setLoading(false);
      }
    },
    [loading, pushAssistant]
  );

  const notConfigured = configured === false;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="pointer-events-auto flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl dark:shadow-black/40"
          role="dialog"
          aria-label="AI Community Concierge"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border bg-brand-gradient px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">Community Concierge</p>
                <p className="truncate text-xs text-white/80">Ask about your HireHub data</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg p-1 hover:bg-white/15"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={threadRef} className="flex max-h-72 flex-col gap-2 overflow-y-auto p-3">
            {messages.length === 0 && !notConfigured && (
              <p className="text-xs text-muted">
                Ask about your jobs, communities, earnings, contracts, or team skills.
              </p>
            )}
            {notConfigured && (
              <div className="rounded-xl bg-background/80 px-3 py-2 text-sm text-muted">
                {statusMessage || "AI assistant is not configured."}
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[90%] rounded-2xl px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-auto bg-primary text-white"
                    : "mr-auto bg-background text-foreground"
                )}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="mr-auto rounded-2xl bg-background px-3 py-2 text-sm text-muted">
                Thinking…
              </div>
            )}
          </div>

          {!notConfigured && messages.length === 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={loading}
                  onClick={() => send(chip)}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-left text-[11px] text-foreground hover:border-info disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex items-center gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={notConfigured ? "Unavailable" : "Ask a question…"}
              disabled={loading || notConfigured}
              className="h-9"
              maxLength={500}
            />
            <Button
              type="submit"
              size="sm"
              variant="gradient"
              className="h-9 w-9 shrink-0 rounded-xl p-0"
              disabled={loading || notConfigured || !input.trim()}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg shadow-secondary/30 transition hover:scale-105"
        aria-label={open ? "Close AI Concierge" : "Open AI Concierge"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
