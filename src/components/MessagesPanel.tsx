"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";

interface MessageAuthor {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
}

interface Message {
  id: string;
  body: string;
  createdAt: string;
  author: MessageAuthor;
}

interface MessagesPanelProps {
  orderId: string;
  currentUserId: string;
  /** Polling interval in ms (default: 15000) */
  pollingInterval?: number;
}

export function MessagesPanel({ orderId, currentUserId, pollingInterval = 15000 }: Readonly<MessagesPanelProps>) {
  const t = useTranslations("portal");
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/orders/${orderId}/messages`);
    if (res.ok) {
      const data = await res.json() as { messages: Message[] };
      setMessages(data.messages);
    }
  }, [orderId]);

  // Initial load + polling
  useEffect(() => {
    void fetchMessages();
    const interval = setInterval(() => { void fetchMessages(); }, pollingInterval);
    return () => clearInterval(interval);
  }, [fetchMessages, pollingInterval]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = body.trim();
    if (!text || text.length > 2000) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (res.ok) {
        setBody("");
        await fetchMessages();
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error ?? t("messagesErrSend"));
      }
    } catch {
      setError(t("messagesErrNetwork"));
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
      <div className="border-b border-white/10 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-300">{t("messagesTitle")}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{t("messagesSubtitle")}</p>
      </div>

      {/* Message list */}
      <div className="flex flex-col gap-3 px-5 py-4 min-h-30 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-xs text-slate-600 text-center mt-6">
            {t("messagesEmpty")}
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.author.id === currentUserId;
            const isAdmin = msg.author.role === "ADMIN";
            return (
              <div key={msg.id} className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                <div className={`flex items-center gap-1.5 mb-0.5 ${isMe ? "flex-row-reverse" : ""}`}>
                  <span className={`text-[10px] font-medium ${isAdmin ? "text-violet-400" : "text-accent-light"}`}>
                    {isAdmin ? "Admin" : (msg.author.name ?? msg.author.email ?? t("messagesClient"))}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {new Date(msg.createdAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                    {" · "}
                    {new Date(msg.createdAt).toLocaleDateString(locale, { day: "2-digit", month: "short" })}
                  </span>
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    isMe
                      ? "bg-accent/20 text-accent-light rounded-tr-sm"
                      : "bg-white/7 text-slate-200 rounded-tl-sm"
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-white/10 px-5 py-4">
        {error && (
          <p className="mb-2 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400">{error}</p>
        )}
        <div className="flex items-end gap-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("messagesPlaceholder")}
            maxLength={2000}
            rows={2}
            className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-accent/50 focus:bg-white/8 focus:outline-none transition"
          />
          <button
            onClick={() => { void handleSend(); }}
            disabled={sending || body.trim().length === 0}
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? "…" : t("messagesSend")}
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-slate-600">{t("messagesCharCount", { count: body.length })}</p>
      </div>
    </section>
  );
}
