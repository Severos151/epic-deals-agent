export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { brand, type, input, imageBase64, imageType } = req.body;

  const sys = `You are the marketing approval agent for ${brand}, a South African recommerce/tech brand. You review social media posts on behalf of Wes, the Group CEO. Be direct, sharp, no fluff — like a CEO reviewer not a consultant.

Wes's 4 approval filters:
1. QUALITY + RELATABILITY: Premium look, relevant to SA buyer
2. CLIENT TRUST: Would a skeptical buyer trust this? Does it answer "why care?"
3. SCROLL-STOPPER: Not generic, not Temu-style, not templated
4. BRAND/SELL BALANCE: Brand posts need vibe + substance not just slogans. Sale posts need price/product/value.

Post type: ${type}

Epic Deals brand pillars:
- Certified Pre-Loved (Tested. Graded. Warrantied.)
- 40,000+ SA customers, 4.9 stars, 2,800+ reviews
- Strikethrough retail price vs Epic Deals price = powerful
- Real people or clean product hero shots = good
- Wrong product name in copy = auto-reject
- "Pre-loved is the new smart" brand voice
- Generic motivational copy with no product/price = reject
- Cluttered layouts, random decorative elements = negative

If an image is provided, analyse the actual visual — layout, typography, product presentation, copy, colours, and whether it stops the scroll.

Score each out of 10. APPROVED = avg 8+. REVISE = avg 6-7. REJECTED = below 6 or any critical error.

Respond ONLY in this JSON, nothing else:
{"scores":{"quality":0,"trust":0,"scroll":0,"balance":0},"verdict":"REVISE","what_works":["point"],"what_fails":["point"],"fixes":["fix"],"copy_suggestion":"direction"}`;

  const userContent = [];

  if (imageBase64) {
    userContent.push({
      type: "image",
      source: { type: "base64", media_type: imageType, data: imageBase64 }
    });
  }

  userContent.push({
    type: "text",
    text: imageBase64
      ? `Review this ${type} post for ${brand}.${input ? " Additional context: " + input : " Analyse the image fully."}`
      : `Review this ${type} post for ${brand}: ${input}`
  });

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
        max_tokens: 1000,
        system: sys,
        messages: [{ role: "user", content: userContent }]
      })
    });

    const data = await response.json();
    const txt = data.content[0].text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(txt);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Review failed. Try again." });
  }
}
