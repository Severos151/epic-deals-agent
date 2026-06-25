const BRAND_CONTEXT = {
  "Epic Deals": `Pre-loved and brand new tech retailer. Products: smartphones, laptops, gaming laptops, gaming consoles, smart home devices, small tech, home appliances. Certified Pre-Loved = Tested, Graded, Warrantied. 40,000+ SA customers, 4.9 stars. Audience: aspirational SA buyers 18-45 who want quality without full retail price. Voice: confident, smart, relatable, value-driven. Key message: same quality, smarter price.`,
  "Orange Advertising": `KTM adventure bike aftermarket upgrade specialist. NOT mechanical or engine parts — aftermarket accessories, protection gear, luggage systems, comfort upgrades, aesthetic enhancements for adventure KTM bikes only. Audience: passionate KTM adventure riders who invest seriously in their bikes. Voice: adventurous, technical, passionate, community-driven.`,
  "GS Gear": `BMW GS adventure bike aftermarket upgrade specialist. Full GS range: GS 900, GS 1200, GS 1250, GS 1300 and all GS variants. Accessories, protection, luggage, comfort and aesthetic upgrades — not mechanical parts. Audience: BMW GS owners passionate about adventure riding. Voice: premium, technical, adventurous, brand-loyal.`,
  "Epic Rentals": `Rental solutions for individuals and families. Rental periods: 12, 24, 36, 48 months. Products: laptops, phones, fridges, air conditioners, furniture, baby gear, appliances — virtually anything household or lifestyle. For people who want quality now without the large upfront cost. Audience: young families, professionals, people in a pinch who want quality without the big premium. Voice: empathetic, practical, empowering, no-judgment.`,
  "Kirks Plumbing": `Full-service residential and commercial construction contractor. Services: plumbing, roof repairs, wall repairs, all construction work. A one-stop contractor — not just plumbing. Audience: homeowners, landlords, property managers, businesses. Voice: trustworthy, professional, no-nonsense, reliable.`,
  "Epic Marketing": `Full-service marketing agency. Handles social media, content creation, campaigns, creative strategy and execution for the Epic Venture group and external clients. Makes brands epic. Audience: businesses needing serious marketing. Voice: creative, bold, results-focused, energetic.`
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

  const brandContext = BRAND_CONTEXT[brand] || `${brand} is a South African brand.`;

  const sys = `You are a senior creative director generating social media briefs for ${brand}, part of the Epic Venture group in South Africa.

Brand context: ${brandContext}
Platform: ${platform || "Instagram"}
Platform requirements: ${platformContext}

SA market knowledge:
- Price-sensitive, aspirational buyer
- Value anchoring stops the scroll
- Payday cycles matter (25th-1st = peak)
- Trust signals matter — reviews, warranties, condition grades
- Bold visuals + short punchy copy wins
- Speak to the brand's specific audience — not a generic SA buyer

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
