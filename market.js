// api/market.js — RupeeMind Market Data endpoint
// In production, replace mock data with a real NSE/BSE data provider
// Recommended free options: Alpha Vantage (free tier), Yahoo Finance via yfinance proxy

// Cache market data for 60 seconds to avoid hammering external APIs
let cache = { data: null, fetchedAt: 0 };
const CACHE_TTL = 60 * 1000; // 60 seconds

async function fetchMarketData() {
  // ── Option A: Mock data (works instantly, no API key needed) ──────────────
  // Replace this block with Option B when you get a real data API key

  return {
    indices: {
      nifty50: { value: 24387.45, change: 0.83, points: 201.3, direction: "up" },
      sensex: { value: 80124.2, change: 0.76, points: 606.9, direction: "up" },
      bankNifty: { value: 52341.8, change: 1.02, points: 530.2, direction: "up" },
      niftyIT: { value: 38219.6, change: 1.45, points: 547.8, direction: "up" },
    },
    gainers: [
      { symbol: "HDFCBANK", name: "HDFC Bank", price: 1712.4, change: 2.31, volume: "4.2M" },
      { symbol: "RELIANCE", name: "Reliance Ind.", price: 2948.1, change: 1.87, volume: "6.8M" },
      { symbol: "INFY", name: "Infosys", price: 1834.5, change: 1.45, volume: "3.1M" },
      { symbol: "TCS", name: "TCS", price: 3912.0, change: 1.12, volume: "2.9M" },
      { symbol: "BAJFINANCE", name: "Bajaj Finance", price: 7284.3, change: 0.98, volume: "1.8M" },
    ],
    losers: [
      { symbol: "ADANIPORTS", name: "Adani Ports", price: 1287.3, change: -1.92, volume: "3.4M" },
      { symbol: "ONGC", name: "ONGC", price: 261.8, change: -1.44, volume: "5.2M" },
      { symbol: "COALINDIA", name: "Coal India", price: 408.5, change: -0.98, volume: "4.1M" },
      { symbol: "BPCL", name: "BPCL", price: 311.2, change: -0.72, volume: "2.7M" },
    ],
    sectors: [
      { name: "Fintech / Banking", change: 2.8, trend: "up" },
      { name: "IT / AI", change: 1.9, trend: "up" },
      { name: "EV & Green Energy", change: 3.1, trend: "up" },
      { name: "Healthcare / Pharma", change: 0.7, trend: "up" },
      { name: "FMCG", change: -0.4, trend: "down" },
      { name: "Defence", change: 1.2, trend: "up" },
      { name: "Metals", change: -0.8, trend: "down" },
      { name: "Realty", change: 0.5, trend: "up" },
    ],
    repoRate: 5.25,
    upiTransactions: "500Cr+",
    lastUpdated: new Date().toISOString(),
  };

  // ── Option B: Alpha Vantage (uncomment + set ALPHA_VANTAGE_KEY in Vercel env) ──
  // const key = process.env.ALPHA_VANTAGE_KEY;
  // const symbols = ["^NSEI", "^BSESN"]; // NSE, BSE
  // const results = await Promise.all(
  //   symbols.map(s =>
  //     fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${s}&apikey=${key}`)
  //       .then(r => r.json())
  //   )
  // );
  // ... parse and return structured data
}

export default async function handler(req, res) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "s-maxage=60, stale-while-revalidate=30",
  };

  if (req.method === "OPTIONS") return res.status(200).set(headers).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const now = Date.now();
  if (cache.data && now - cache.fetchedAt < CACHE_TTL) {
    return res.status(200).set(headers).json({ ...cache.data, cached: true });
  }

  try {
    const data = await fetchMarketData();
    cache = { data, fetchedAt: now };
    return res.status(200).set(headers).json(data);
  } catch (err) {
    console.error("Market data error:", err);
    return res.status(500).set(headers).json({ error: "Failed to fetch market data." });
  }
}
