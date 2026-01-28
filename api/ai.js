export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY env var" });

  const { kind, text } = req.body || {};
  if (typeof text !== "string") return res.status(400).json({ error: "Invalid text" });

  const system =
    kind === "recipe"
      ? "You are a security analyst. Suggest a safe transform recipe (steps) to decode/inspect the provided text. Do not claim certainty; be explicit about assumptions."
      : "You are a security analyst. Explain what the provided text might be (encoding/format indicators) and what to try next. Do not guess beyond evidence.";

  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          { role: "system", content: system },
          { role: "user", content: text.slice(0, 20000) }
        ]
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data?.error?.message ?? "OpenAI error" });

    const result =
      data?.output_text ??
      data?.output?.map(o => o?.content?.map(c => c?.text).join("")).join("\n") ??
      "No output.";

    return res.status(200).json({ result });
  } catch (e) {
    return res.status(500).json({ error: e?.message ?? String(e) });
  }
}
