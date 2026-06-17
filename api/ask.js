// api/ask.js — Vercel serverless function
// Proxies requests to OpenRouter. API key lives in Vercel env vars only.

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "nvidia/llama-3.1-nemotron-ultra-253b-v1:free";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question } = req.body || {};

  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: question.trim() }],
      }),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Upstream API error" });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;

    if (answer) {
      return res.status(200).json({ answer });
    } else {
      return res.status(500).json({ error: "No answer received" });
    }
  } catch (error) {
    console.error("OpenRouter error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
