const BRAND_CONTEXT = {
  "Epic Deals": "Certified Pre-Loved tech. Tested. Graded. Warrantied. Trusted by 40,000+ South Africans. 4.9 stars. Value anchoring with strikethrough retail vs Epic Deals price. Voice: smart, confident, relatable SA brand.",
  "Orange Advertising": "Marketing and advertising agency. Professional, creative, results-driven. Voice: strategic, bold, modern.",
  "GS Gear": "Tech accessories and gear. Value for money. Voice: practical, direct, energetic.",
  "Epic Rentals": "Rental solutions. Flexible, affordable, no long-term commitment. Voice: friendly, practical, trustworthy.",
  "Kirks Plumbing": "Plumbing services. Reliable, professional, fast. Voice: trustworthy, no-nonsense, local.",
  "Epic Marketing": "Full-service marketing. Creative campaigns, social media, content. Voice: creative, professional, results-focused."
};

const SA_HUMOUR_GUIDE = `
SA Humour guidelines — use these naturally, never forced:
- Load shedding references: universal SA pain, instant relatability ("no load shedding can stop this deal")
- Relatable price sensitivity: "your wallet called, it says thank you" / "same phone, smarter buyer"
- Payday energy: everyone knows that 25th feeling — lean into it
- Light vernacular where natural: eish, yoh, sharp sharp, lekker, howzit — but only if it fits the brand voice
- Self-aware humour about buying pre-loved vs new: flip the snobbery
- Ubuntu angle: buying smart for yourself and your family
- Hustle culture nods: the grind is real, a good deal is a win

STRICT GUARDRAILS — never include:
- Racial jokes or stereotypes of any kind
- Religious references or jokes
- Harsh political mockery or party references
- Content that punches down at any group
- Forced slang that feels like a brand trying too hard
- Anything that trivialises serious SA social issues
`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { brand, type, product, goal, notes, saFlavour, language } = req.body;
  const isAfrikaans = language === "afrikaans";

  const sys = `You are a senior creative director for ${brand}, a South African brand. Generate sharp, practical creative briefs for social media posts.

Brand context: ${BRAND_CONTEXT[brand] || brand}

SA market knowledge:
- Price-sensitive, aspirational buyer
- Responds to value anchoring (retail price vs deal price)
- Payday cycles matter (25th-1st of month = peak)
- Trust signals matter — reviews, warranties, condition grades
- Bold visuals stop the scroll
- Short punchy copy outperforms long copy

${saFlavour ? SA_HUMOUR_GUIDE : "Keep tone professional, warm, and relatable. No humour required."}

${isAfrikaans ? `IMPORTANT: Write the entire brief — all fields including headline, visual, copy, audience, caption, and hashtags — in Afrikaans. Keep it natural and colloquial, not stiff or translated-sounding.` : "Write in English."}

Respond ONLY in this JSON, nothing else:
{
  "headline": "Single punchy headline/hook line",
  "visual": "Visual direction — what to shoot, how to frame it, colours, mood",
  "copy": "Copy angle and tone — what the message should feel like",
  "audience": "Who this is for and what they care about",
  "caption": "Full ready-to-use social media caption with CTA",
  "hashtags": "#relevant #hashtags #forsouthafrica"
}`;

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
        max_tokens: 1200,
        system: sys,
        messages: [{ role: "user", content: `Generate a creative brief for ${brand}. Product: ${product}. Post type: ${type}. Goal: ${goal}.${notes ? " Notes: " + notes : ""}` }]
      })
    });

    const data = await response.json();
    const txt = data.content[0].text.replace(/```json|```/g, "").trim();
    res.status(200).json(JSON.parse(txt));
  } catch (err) {
    res.status(500).json({ error: "Brief generation failed. Try again." });
  }
}
