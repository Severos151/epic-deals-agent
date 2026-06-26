const SA_HUMOUR_GUIDE = `
SA Humour guidelines — use naturally, never forced:
- Load shedding references where relevant
- Relatable price sensitivity: "your wallet called, it says thank you"
- Payday energy on timing-related posts
- Light vernacular where natural: eish, yoh, sharp sharp, lekker — only if it fits
- Self-aware humour about buying smart vs buying new
- Ubuntu angle: buying smart for yourself and your family

STRICT GUARDRAILS — never include:
- Racial jokes or stereotypes of any kind
- Religious references or jokes
- Harsh political mockery or party references
- Content that punches down at any group
- Forced slang that feels like a brand trying too hard
`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { brand, type, caption, fixes, suggestion, saFlavour, language } = req.body;
  const isAfrikaans = language === "afrikaans";

  const BRAND_VOICE = {
    "Epic Deals": "Smart, confident, value-driven. SA tone. Pre-loved tech — quality at a smarter price.",
    "Orange ADV": "Adventurous, technical, passionate. KTM adventure bike community.",
    "GS Gear": "Premium, technical, adventurous. BMW GS adventure bike community.",
    "Epic Rentals": "Empathetic, practical, empowering. Quality products, no big upfront cost.",
    "Kirks Plumbing": "Trustworthy, professional, no-nonsense. Residential and commercial construction.",
    "Epic Marketing": "Creative, bold, results-focused. Makes brands epic."
  };

  const sys = `You are a senior copywriter rewriting a social media caption for ${brand}, a South African brand.

Brand voice: ${BRAND_VOICE[brand] || brand}

Rules:
- Hook in the first line — no warm-up
- Short sentences hit harder
- Match the brand's specific voice and audience above
- Strong CTA at the end
- Relevant hashtags

${saFlavour ? SA_HUMOUR_GUIDE : "Keep tone professional and relatable. No humour required."}

Fixes to address: ${fixes?.join(", ") || "general improvement"}
Direction: ${suggestion || "improve overall quality"}

${isAfrikaans ? "IMPORTANT: Write the entire rewritten caption in Afrikaans. Keep it natural and colloquial, not stiff." : "Write in English."}

Return ONLY the rewritten caption as plain text. No explanation, no JSON, no preamble. Just the caption ready to copy and paste.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 600,
        system: sys,
        messages: [{ role: "user", content: `Rewrite this caption for ${brand} (${type}): "${caption}"` }]
      })
    });

    const data = await response.json();
    res.status(200).json({ rewritten: data.content[0].text.trim() });
  } catch (err) {
    res.status(500).json({ error: "Rewrite failed. Try again." });
  }
}
