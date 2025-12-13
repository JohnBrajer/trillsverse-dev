import type { NextRequest } from "next/server";

/**
 * POST /api/chat
 * Body: { content: string, stream?: boolean }
 *
 * This route proxies to the LM_API_URL (OpenAI-compatible) and forwards the
 * upstream response directly so the client can consume streaming responses.
 *
 * Notes:
 * - Keep LM_API_KEY and LM_API_URL server-side only (do not expose to client).
 * - Upstream streaming responses (text/event-stream) will be proxied through.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));
    const content: string = payload.content || "";
    const stream: boolean = !!payload.stream;

    if (!content) {
      return new Response(JSON.stringify({ error: "Missing `content` in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = {
      model: "local-model",
      messages: [
        { role: "system", content: "You are the Trillsverse Logic Bot. Answer concisely and with swagger." },
        { role: "user", content },
      ],
      stream,
    };

    const upstreamRes = await fetch(process.env.LM_API_URL || "http://localhost:1234/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // LM_Studio ignores auth by default, but keep header for compatibility
        Authorization: `Bearer ${process.env.LM_API_KEY || ""}`,
      },
      body: JSON.stringify(body),
    });

    // If upstream failed and returned JSON/text, forward an error JSON
    if (!upstreamRes.ok && !upstreamRes.body) {
      const errText = await upstreamRes.text();
      return new Response(JSON.stringify({ error: errText || "Upstream error" }), {
        status: upstreamRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Proxy the upstream response body directly (works for streaming and non-streaming).
    const headers = new Headers(upstreamRes.headers);

    // Remove headers that could cause problems when re-sending
    headers.delete("transfer-encoding");
    // Ensure we explicitly tell client JSON when upstream is JSON.
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message || "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}