export default async function handler(req) {
  // ── Pre-flight CORS ──────────────────────
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed. Use POST." });
  }

  // ── Parse the question ──────────────────
  let question;
  try {
    const body = await req.json();
    question = (body.question || "").trim();
  } catch {
    return json(400, { error: "Request body must be valid JSON with a 'question' field." });
  }

  if (!question) {
    return json(400, { error: "The 'question' field is required." });
  }

  // ── Call OpenRouter with a timeout ──────
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout

  try {
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: question }],
      }),
    });

    clearTimeout(timeout);

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("OpenRouter error:", resp.status, errText);
      return json(502, { error: "Something went wrong, please try again." });
    }

    const data = await resp.json();
    const answer = data.choices[0].message.content;
    return json(200, { answer });
  } catch (err) {
    clearTimeout(timeout);
    console.error("OpenRouter request failed:", err);
    return json(502, { error: "Something went wrong, please try again." });
  }
}

// ── Helpers ──────────────────────────────────
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}
