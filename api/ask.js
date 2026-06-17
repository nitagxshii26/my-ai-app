export default async function handler(req) {
  // ── Pre-flight CORS so the browser can call us ──
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed. Use POST." });
  }

  let question;
  try {
    var body = await req.json();
    question = (body.question || "").trim();
  } catch {
    return json(400, { error: "Request body must be valid JSON with a 'question' field." });
  }

  if (!question) {
    return json(400, { error: "The 'question' field is required." });
  }

  // ── Call OpenRouter ─────────────────────
  try {
    var openRouterResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.OPENROUTER_API_KEY,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: question }],
      }),
    });

    if (!openRouterResp.ok) {
      console.error("OpenRouter error:", openRouterResp.status, await openRouterResp.text());
      return json(502, { error: "Something went wrong, please try again." });
    }

    var data = await openRouterResp.json();
    var answer = data.choices[0].message.content;

    return json(200, { answer: answer });
  } catch (err) {
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
    status: status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}
