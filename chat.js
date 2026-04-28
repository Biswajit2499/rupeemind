// api/chat.js — RupeeMind secure Claude proxy
// Deployed as a Vercel Serverless Function
// Your ANTHROPIC_API_KEY lives ONLY here (server-side). Never in the frontend.

const ALLOWED_ORIGINS = [
  "https://rupeemind.vercel.app", // your production URL
  "http://localhost:5173",         // local dev (Vite)
  "http://localhost:3000",
];

// ── Simple in-memory rate limiter (per IP, resets on cold start) ──────────────
const rateLimitMap = new Map(); // ip → { count, windowStart }
const RATE_LIMIT = 20;          // max requests
const RATE_WINDOW = 60 * 1000;  // per 60 seconds

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, windowStart: now };
  if (now - entry.windowStart > RATE_WINDOW) {
    // reset window
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  rateLimitMap.set(ip, entry);
  return true;
}

// ── CORS helper ───────────────────────────────────────────────────────────────
function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  const headers = corsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).set(headers).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "unknown";
  if (!checkRateLimit(ip)) {
    return res.status(429).set(headers).json({
      error: "Too many requests. Please wait a minute before trying again.",
    });
  }

  // Validate request body
  const { messages, profile } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).set(headers).json({ error: "Invalid request: messages array required." });
  }
  if (messages.length > 40) {
    return res.status(400).set(headers).json({ error: "Conversation too long. Please start a new chat." });
  }

  // Sanitize messages — only allow role + content strings
  const safeMessages = messages
    .filter((m) => ["user", "assistant"].includes(m?.role) && typeof m?.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) })); // cap per message

  const systemPrompt = `You are RupeeMind, a sharp and friendly AI personal finance advisor for young Indians (18–35).
You know Indian finance deeply: UPI, SIP, ELSS, PPF, NPS, EPF, Section 80C, HRA, home loans, Zerodha, Groww, Paytm, CIBIL scores, RBI repo rate (currently 5.25%), Nifty50, Sensex.
${profile ? `User profile: Name=${profile.name}, Monthly Income=₹${profile.income}, City=${profile.city}, Goal=${profile.goal}.` : ""}
Rules:
- Be direct, warm, and practical. No fluff.
- Use ₹ for amounts. Use Indian numbering (lakh, crore).
- Give specific actionable advice, not generic tips.
- If calculating EMI/SIP/returns, show the math briefly.
- Keep responses concise (3–6 sentences unless a detailed breakdown is needed).
- Mix Hindi words naturally when it fits (SIP, EMI, paisa, etc.).
- Never say "I'm just an AI." Just be helpful.
- Never discuss topics unrelated to personal finance.`;

  // Call Anthropic API
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY, // ← secret, server-side only
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: safeMessages,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Anthropic API error:", err);
      return res.status(502).set(headers).json({
        error: "AI service error. Please try again shortly.",
      });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Sorry, I couldn't generate a response.";

    return res.status(200).set(headers).json({ reply });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).set(headers).json({ error: "Internal server error." });
  }
}
