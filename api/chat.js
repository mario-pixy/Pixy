export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
console.log("REQ", req.method, req.url);
console.log("BODY", req.body);
console.log("HAS_KEY", !!process.env.OPENAI_API_KEY);
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: "Missing text" });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY on server" });

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          { role: "system", content: "Sei Pixy: risposte brevi, chiare, in italiano." },
          { role: "user", content: text }
        ],
      }),
    });

    const data = await r.json();
    console.log("OPENAI_STATUS", r.status);
console.log("OPENAI_DATA", data);
    if (!r.ok) return res.status(r.status).json({ error: data });

    return res.status(200).json({ text: (data.output_text || "").trim() });

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
