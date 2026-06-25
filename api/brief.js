const BRAND_CONTEXT = {
  "Epic Deals": "Certified Pre-Loved tech. Tested. Graded. Warrantied. Trusted by 40,000+ South Africans. 4.9 stars. Voice: smart, confident, relatable SA brand.",
  "Orange Advertising": "Marketing and advertising agency. Professional, creative, results-driven. Voice: strategic, bold, modern.",
  "GS Gear": "Tech accessories and gear. Value for money. Voice: practical, direct, energetic.",
  "Epic Rentals": "Rental solutions. Flexible, affordable. Voice: friendly, practical, trustworthy.",
  "Kirks Plumbing": "Plumbing services. Reliable, professional, fast. Voice: trustworthy, no-nonsense, local.",
  "Epic Marketing": "Full-service marketing. Creative campaigns. Voice: creative, professional, results-focused."
};

const PLATFORM_RULES = {
  "Instagram": "Instagram: Hook in first 3 seconds. Subtitles essential. Vertical 9:16. Clean aesthetic, high contrast. 5-15 relevant hashtags. Strong CTA.",
  "Facebook": "Facebook: Hook in first 5 seconds. Subtitles critical. Longer copy acceptable. Price front and centre. Social proof performs well.",
  "TikTok": "TikTok: Hook in FIRST 2 SECONDS. Must feel native and raw — not corporate. Trending audio awareness. Vertical 9:16 only. SA youth culture references land.",
  "WhatsApp Status": "WhatsApp Status: Direct and personal. Short sharp message. Price/deal immediately obvious. No fluff — people swipe fast. Flash deal format works best.",
  "All Platforms": "Multi-platform: Hook in 2 seconds, subtitles, vertical format, clear price/value, short copy. Must work everywhere."
};

const SA_HUMOUR_GUIDE = `
SA Humour — use naturally, never forced:
- Load shedding references: universal SA pain ("no load shedding can stop this deal")
- Price sensitivity humour: "your wallet called, it says thank you"
- Payday energy: lean into the 25th feeling
- Light vernacular where natural: eish, yoh, sharp sharp, lekker, howzit
- Pre-loved vs new snobbery flip: "same phone, smarter buyer"
- Ubuntu angle: buying smart for yourself and your family

STRICT GUARDRAILS — never include:
- Racial jokes or stereotypes
- Religious references or jokes  
- Harsh political mockery or party references
- Content that punches down at any group
- Forced slang that feels like a brand trying too hard
`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { brand, type, product, goal, notes, saFlavour, language, platform } = req.body;
  const isAfrikaans = language === "afrikaans";
  const platformContext = PLATFORM_RULES[platform] || PLATFORM_RULES["Instagram"];

  const sys = `You are a senior creative director for ${brand}, a South African brand. Generate sharp, practical creative briefs for social media posts.

Brand context: ${BRAND_CONTEXT[brand] || brand}
Platform: ${platform || "Instagram"}
Platform requirements: ${platformContext}

SA market knowledge:
- Price-sensitive, aspirational buyer
- Value anchoring (retail vs deal price) stops the scroll
- Payday cycles matter (25th-1st = peak)
- Trust signals matter — reviews, warranties, condition grades
- Bold visuals + short punchy copy wins

${saFlavour ? SA_HUMOUR_GUIDE : "Keep tone professional, warm, and relatable. No humour required."}
${isAfrikaans ? "IMPORTANT: Write the entire brief in natural, colloquial Afrikaans — not stiff or translated-sounding." : "Write in English."}

Respond ONLY in this JSON, nothing else:
{
  "headline": "Single punchy headline/hook line",
  "visual": "Visual direction — what to shoot, how to frame, colours, mood",
  "copy": "Copy angle and tone",
  "audience": "Who this is for and what they care about",
  "caption": "Full ready-to-use caption with CTA",
  "hashtags": "#relevant #hashtags"
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "x-api-key":process.env.ANTHROPIC_API_KEY, "anthropic-version":"2023-06-01" },
      body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1200, system:sys, messages:[{ role:"user", content:`Generate a creative brief for ${brand}. Product: ${product}. Post type: ${type}. Goal: ${goal}. Platform: ${platform || "Instagram"}.${notes?" Notes: "+notes:""}` }] })
    });
    const data = await response.json();
    const txt = data.content[0].text.replace(/```json|```/g,"").trim();
    res.status(200).json(JSON.parse(txt));
  } catch(err) {
    res.status(500).json({ error:"Brief generation failed. Try again." });
  }
}
