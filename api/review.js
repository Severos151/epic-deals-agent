const BRAND_CONTEXT = {
  "Epic Deals": `Pre-loved and brand new tech retailer. Products include smartphones, laptops, gaming laptops, gaming consoles, smart home devices, small tech accessories, and home appliances. Certified Pre-Loved items are Tested, Graded and Warrantied. Trusted by 40,000+ South Africans. 4.9 stars, 2,800+ reviews. Core value: premium tech at accessible prices. Audience: aspirational SA buyers aged 18-45 who want quality without paying full retail. Voice: confident, smart, relatable, value-driven.`,
  "Orange ADV": `Specialist retailer of KTM aftermarket upgrade parts for adventure KTM bikes. Not mechanical parts or engine components — purely aftermarket upgrades: accessories, protection, luggage, comfort upgrades, aesthetic enhancements for adventure riding. Audience: passionate KTM adventure bike riders who take their riding seriously and invest in their bikes. Voice: adventurous, technical, passionate, community-driven.`,
  "GS Gear": `Specialist retailer of aftermarket upgrade parts and accessories for the full BMW GS adventure bike range — GS 900, GS 1200, GS 1250, GS 1300 and all GS variants. Same category as Orange ADV but exclusively BMW GS focused. Audience: BMW GS owners who are passionate about adventure riding and upgrading their bikes. Voice: premium, technical, adventurous, brand-loyal.`,
  "Epic Rentals": `Rental solutions for individuals and families who want quality products without the large upfront cost. Rental periods of 12, 24, 36 and 48 months. Products include laptops, smartphones, fridges, air conditioners, furniture, baby gear, and virtually any household or lifestyle product. Audience: South Africans who need quality now but want to spread the cost — young families, professionals, people in a pinch. Voice: empathetic, practical, empowering, no-judgment.`,
  "Kirks Plumbing": `Full-service residential and commercial construction company. Services include plumbing, roof repairs, wall repairs, and all construction-related work. Not just a plumber — a one-stop construction and repairs contractor. Audience: homeowners, landlords, property managers, businesses needing reliable tradespeople. Voice: trustworthy, professional, no-nonsense, reliable.`,
  "Epic Marketing": `Full-service marketing agency that handles all marketing for the Epic Venture group and external clients. Makes brands epic through social media, content creation, campaigns, creative strategy, and execution. Audience: businesses that need serious marketing firepower. Voice: creative, bold, results-focused, energetic.`
};

const PLATFORM_RULES = {
  "Instagram": "Instagram Reels/Feed: Hook in first 3 seconds. Subtitles essential. Vertical 9:16 preferred. Strong thumbnail frame. Clean aesthetic, high contrast. Hashtags relevant (5-15). CTA must be clear. Stories format needs text overlay.",
  "Facebook": "Facebook: Hook in first 5 seconds. Subtitles critical — 85% watch without sound. Slightly longer copy acceptable. Price and value must be front and centre. Social proof (reviews, ratings) performs well. Boosted post potential matters.",
  "TikTok": "TikTok: Hook in FIRST 2 SECONDS or lose them. Must feel native — raw and real beats polished corporate. Trending audio awareness. Text overlay essential. Vertical 9:16 only. Authenticity over perfection. SA youth culture references land well.",
  "WhatsApp Status": "WhatsApp Status: 24-hour window. Direct and personal tone. Short sharp message. Price and deal must be immediately obvious. No fluff — people swipe fast. Works best as a direct offer or flash deal.",
  "All Platforms": "Multi-platform post: Must work across Instagram, Facebook, TikTok and WhatsApp. Prioritise the most restrictive requirements — hook in 2 seconds, subtitles, vertical format, clear price/value, short copy."
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { brand, type, input, caption, imageBase64, imageType, platform } = req.body;
  const platformContext = PLATFORM_RULES[platform] || PLATFORM_RULES["Instagram"];

  const brandContext = BRAND_CONTEXT[brand] || `${brand} is a South African brand.`;

  const sys = `You are the marketing approval agent for ${brand}. You review social media posts on behalf of Wes, the Group CEO of Epic Venture. Be direct, sharp, no fluff — like a CEO reviewer not a consultant.

Brand context: ${brandContext}

Wes's 4 approval filters:
1. QUALITY + RELATABILITY: Premium look, relevant to the brand's specific audience
2. CLIENT TRUST: Would a skeptical buyer trust this? Does it answer "why should I care?"
3. SCROLL-STOPPER: Not generic, not templated, not something you'd scroll past
4. BRAND/SELL BALANCE: Brand posts need vibe + substance. Sale posts need product/price/value.

Platform: ${platform || "Instagram"}
Platform rules: ${platformContext}
Post type: ${type}

Key rules:
- Wrong product name or wrong brand in copy = auto-reject
- Generic motivational copy with no product or price = reject
- Cluttered layouts = negative
- Content must match the brand's specific audience and voice above

If caption provided, review separately for hook, clarity, tone match to brand voice, CTA effectiveness, and hashtag relevance for ${platform}.
Score each out of 10. APPROVED = avg 8+. REVISE = avg 6-7. REJECTED = below 6 or critical error.

Respond ONLY in this JSON, nothing else:
{"scores":{"quality":0,"trust":0,"scroll":0,"balance":0},"verdict":"REVISE","what_works":["point"],"what_fails":["point"],"fixes":["fix"],"platform_notes":["platform-specific feedback"],"caption_feedback":["only if caption provided"],"copy_suggestion":"direction"}`;

  const userContent = [];
  if (imageBase64) userContent.push({ type:"image", source:{ type:"base64", media_type:imageType, data:imageBase64 }});
  let txt = `Review this ${type} post for ${brand} on ${platform || "Instagram"}.`;
  if (input) txt += ` Context: ${input}`;
  if (caption) txt += ` Caption: "${caption}"`;
  userContent.push({ type:"text", text:txt });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "x-api-key":process.env.ANTHROPIC_API_KEY, "anthropic-version":"2023-06-01" },
      body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1200, system:sys, messages:[{ role:"user", content:userContent }] })
    });
    const data = await response.json();
    const clean = data.content[0].text.replace(/```json|```/g,"").trim();
    res.status(200).json(JSON.parse(clean));
  } catch(err) {
    res.status(500).json({ error:"Review failed. Try again." });
  }
}
