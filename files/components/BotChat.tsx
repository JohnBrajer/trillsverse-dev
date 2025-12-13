"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

/**
 * BotChat with streaming support:
 * - Sends {content, stream:true} to /api/chat
 * - If server proxies an event-stream (OpenAI-style "data: ..."), we parse and append tokens.
 * - Falls back to JSON when content-type is application/json.
 */
export function BotChat() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);

  const send = async () => {
    const content = inputRef.current?.value?.trim();
    if (!content || sending) return;
    // Add user message
    setMessages((m) => [...m, { role: "user", content }]);
    inputRef.current!.value = "";
    setSending(true);

    // Add assistant placeholder and keep its index to update progressively
    let assistantIndex = -1;
    setMessages((prev) => {
      assistantIndex = prev.length;
      return [...prev, { role: "assistant", content: "" }];
    });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ content, stream: true }),
        headers: { "Content-Type": "application/json" },
      });

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream")) {
        // Streamed response (OpenAI-style): parse lines "data: {...}\n\n"
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Process any complete lines
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const line = part.trim();
            if (!line) continue;
            // Each line might be "data: [DONE]" or "data: {...}"
            const dataLines = line.split("\n").filter(Boolean);
            for (const dl of dataLines) {
              const trimmed = dl.replace(/^data:\s*/, "");
              if (trimmed === "[DONE]") {
                // stream finished
                setSending(false);
                return;
              }
              try {
                const parsed = JSON.parse(trimmed);
                // Support both chat/completions delta and older text styles
                const delta =
                  parsed.choices?.[0]?.delta?.content ||
                  parsed.choices?.[0]?.text ||
                  parsed.choices?.[0]?.message?.content ||
                  "";
                if (delta) {
                  setMessages((prev) => {
                    const copy = prev.slice();
                    copy[assistantIndex] = {
                      ...copy[assistantIndex],
                      content: (copy[assistantIndex]?.content || "") + delta,
                    };
                    return copy;
                  });
                }
              } catch (e) {
                // ignore JSON parse errors for malformed chunk
              }
            }
          }
        }
        setSending(false);
      } else if (contentType.includes("application/json")) {
        const json = await res.json();
        const reply = json.reply || json.choices?.[0]?.message?.content || json.text || "(no reply)";
        setMessages((prev) => {
          const copy = prev.slice();
          copy[assistantIndex] = { ...copy[assistantIndex], content: reply };
          return copy;
        });
        setSending(false);
      } else {
        // Fallback: treat as text
        const text = await res.text();
        setMessages((prev) => {
          const copy = prev.slice();
          copy[assistantIndex] = { ...copy[assistantIndex], content: text };
          return copy;
        });
        setSending(false);
      }
    } catch (err) {
      setSending(false);
      setMessages((prev) => {
        const copy = prev.slice();
        copy[assistantIndex] = { ...copy[assistantIndex], content: `Error: ${(err as Error).message}` };
        return copy;
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2 space-y-1 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={`${m.role === "user" ? "text-right" : ""}`}>
            <span className={`${m.role === "assistant" ? "text-fuchsia-400" : ""}`}>{m.content}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-zinc-800 p-2 flex gap-2">
        <input
          ref={inputRef}
          placeholder="Talk to your bot…"
          className="flex-1 bg-zinc-900 px-2 py-1 rounded-md outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          disabled={sending}
        />
        <Button onClick={send} disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}