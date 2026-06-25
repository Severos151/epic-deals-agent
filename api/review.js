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

  const sys = `You are the marketing approval agent for ${brand}, a South African recommerce/tech brand. Review social media posts on behalf of Wes, the Group CEO. Be direct, sharp, no fluff — like a CEO reviewer not a consultant.

Wes's 4 approval filters:
1. QUALITY + RELATABILITY: Premium look, relevant to SA buyer
2. CLIENT TRUST: Would a skeptical buyer trust this? Does it answer "why care?"
3. SCROLL-STOPPER: Not generic, not Temu-style, not templated
4. BRAND/SELL BALANCE: Brand posts need vibe + substance. Sale posts need price/product/value.

Platform being reviewed: ${platform || "Instagram"}
Platform-specific rules: ${platformContext}

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

If caption provided, review separately for hook, clarity, tone, CTA, hashtag relevance for ${platform}.
Score each out of 10. APPROVED = avg 8+. REVISE = avg 6-7. REJECTED = below 6 or critical error.

Respond ONLY in this JSON, nothing else:
{"scores":{"quality":0,"trust":0,"scroll":0,"balance":0},"verdict":"REVISE","what_works":["point"],"what_fails":["point"],"fixes":["fix"],"platform_notes":["platform-specific feedback point"],"caption_feedback":["only if caption provided"],"copy_suggestion":"direction"}`;

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
