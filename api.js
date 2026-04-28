// lib/api.js — RupeeMind Frontend API Client
// All calls go through YOUR secure Vercel backend — API key never exposed

const BASE_URL = import.meta.env.VITE_API_URL || ""; // empty = same origin in prod

// ── Chat ──────────────────────────────────────────────────────────────────────
/**
 * Send a message to the secure Claude proxy.
 * @param {Array} messages - Full conversation history [{role, content}]
 * @param {Object} profile  - User profile {name, income, city, goal}
 * @returns {Promise<string>} AI reply text
 */
export async function sendChat(messages, profile) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, profile }),
  });

  if (res.status === 429) {
    throw new Error("You're sending messages too fast. Wait a moment and try again.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Chat failed. Please try again.");
  }

  const data = await res.json();
  return data.reply;
}

// ── Market Data ────────────────────────────────────────────────────────────────
/**
 * Fetch live market snapshot (Nifty, Sensex, gainers, losers, sectors).
 * Cached server-side for 60s — safe to call on every tab focus.
 */
export async function fetchMarket() {
  const res = await fetch(`${BASE_URL}/api/market`);
  if (!res.ok) throw new Error("Failed to load market data.");
  return res.json();
}

// ── Utility: Format currency ───────────────────────────────────────────────────
export function fmt(n) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function fmtShort(n) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}
