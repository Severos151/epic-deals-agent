import { useState, useEffect, useRef } from "react";

const STEPS = [
  {
    id: "tabs",
    title: "Navigation Tabs",
    text: "Three tabs at the top. Review Post is where you submit creatives for approval. Generate Brief creates a full creative brief from scratch. Score History tracks every submission over time.",
    selector: "tabs",
    position: "bottom"
  },
  {
    id: "brand",
    title: "Select Brand",
    text: "Always start here. Pick the brand this post is for. Each brand has its own audience, voice, and standards baked in — the agent reviews accordingly.",
    selector: "brand",
    position: "bottom"
  },
  {
    id: "posttype",
    title: "Post Type",
    text: "Tell the agent what kind of post this is. Product Sale, Brand Visibility, Campaign, or Promotional. This changes what the agent looks for when scoring.",
    selector: "posttype",
    position: "bottom"
  },
  {
    id: "platform",
    title: "Platform",
    text: "Select where this post will go live. TikTok, Instagram, Facebook, WhatsApp Status, or All Platforms. Each platform has different rules — the agent applies them automatically.",
    selector: "platform",
    position: "bottom"
  },
  {
    id: "upload",
    title: "Upload Creative",
    text: "Tap here to upload the actual post image. The agent will visually analyse the layout, typography, product presentation, and whether it stops the scroll.",
    selector: "upload",
    position: "bottom"
  },
  {
    id: "caption",
    title: "Social Media Caption",
    text: "Paste the full caption here — copy, hashtags, CTA, everything. The agent reviews it separately from the visual and gives you dedicated caption feedback.",
    selector: "caption",
    position: "top"
  },
  {
    id: "describe",
    title: "Describe the Post",
    text: "If you are not uploading an image, describe the post concept here. Be specific — background, headline, product, what the copy says. The more detail, the better the review.",
    selector: "describe",
    position: "top"
  },
  {
    id: "reviewbtn",
    title: "Review This Post",
    text: "Hit this once everything is filled in. The agent runs your post through Wes's four filters — Quality, Trust, Scroll-Stopper, and Brand Balance — and returns a verdict.",
    selector: "reviewbtn",
    position: "top"
  },
  {
    id: "scores",
    title: "Scores",
    text: "Each post is scored out of 10 across four criteria. Quality and Relatability, Client Trust, Scroll-Stopper, and Brand Balance. The Overall score determines the verdict.",
    selector: "scores",
    position: "top"
  },
  {
    id: "verdict",
    title: "Verdict",
    text: "APPROVED means it is ready to post. REVISE means it needs fixes before it goes live. REJECTED means start again. Nothing goes out without hitting APPROVED.",
    selector: "verdict",
    position: "top"
  },
  {
    id: "rewrite",
    title: "Rewrite Caption",
    text: "If the caption is rejected or needs revision, this button rewrites it automatically using the agent's feedback. Copy the improved version straight to your clipboard.",
    selector: "rewrite",
    position: "top"
  },
  {
    id: "brief_tab",
    title: "Generate Brief Tab",
    text: "Switch to this tab when you need to create a brief from scratch. No more blank page. Enter the product, goal, and any notes — the agent builds the full creative direction for you.",
    selector: "tabs",
    position: "bottom"
  },
  {
    id: "saflavour",
    title: "SA Flavour Toggle",
    text: "Turn this on to add South African humour, vernacular, and cultural references to your briefs and captions. Load shedding jokes, payday energy, relatable SA tone. Off by default — use when it fits the brand.",
    selector: "saflavour",
    position: "bottom"
  },
  {
    id: "language",
    title: "Language",
    text: "Switch between English and Afrikaans. When Afrikaans is selected, all generated briefs and rewritten captions come out in natural colloquial Afrikaans.",
    selector: "language",
    position: "bottom"
  },
  {
    id: "history_tab",
    title: "Score History Tab",
    text: "Every submission is logged automatically. You can see each post's brand, type, platform, verdict, and score over time. The summary bar shows your Approved, Revise, and Rejected percentages at a glance.",
    selector: "tabs",
    position: "bottom"
  }
];

function TooltipBubble({ step, current, total, onNext, onPrev, onClose, targetRect }) {
  if (!targetRect) return null;

  const bubbleWidth = 280;
  const offset = 16;

  let top, left;

  if (step.position === "bottom") {
    top = targetRect.bottom + offset + window.scrollY;
    left = targetRect.left + (targetRect.width / 2) - (bubbleWidth / 2);
  } else {
    top = targetRect.top - offset + window.scrollY - 160;
    left = targetRect.left + (targetRect.width / 2) - (bubbleWidth / 2);
  }

  left = Math.max(16, Math.min(left, window.innerWidth - bubbleWidth - 16));

  const arrowUp = step.position === "bottom";

  return (
    <div style={{
      position:"absolute", top, left,
      width:bubbleWidth, background:"#1a1a2e", border:"1px solid #00aaff",
      borderRadius:12, padding:16, zIndex:10001, boxShadow:"0 8px 32px rgba(0,170,255,0.2)"
    }}>
      {arrowUp && (
        <div style={{position:"absolute",top:-8,left:bubbleWidth/2-8,width:0,height:0,
          borderLeft:"8px solid transparent",borderRight:"8px solid transparent",
          borderBottom:"8px solid #00aaff"}} />
      )}
      {!arrowUp && (
        <div style={{position:"absolute",bottom:-8,left:bubbleWidth/2-8,width:0,height:0,
          borderLeft:"8px solid transparent",borderRight:"8px solid transparent",
          borderTop:"8px solid #00aaff"}} />
      )}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div style={{fontSize:12,fontWeight:700,color:"#00aaff",textTransform:"uppercase",letterSpacing:1}}>{step.title}</div>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:16,lineHeight:1,padding:0}}>x</button>
      </div>
      <div style={{fontSize:13,color:"#ccc",lineHeight:1.6,marginBottom:14}}>{step.text}</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:11,color:"#444"}}>{current + 1} of {total}</div>
        <div style={{display:"flex",gap:8}}>
          {current > 0 && (
            <button onClick={onPrev} style={{padding:"5px 12px",background:"#2a2a2a",border:"1px solid #333",borderRadius:6,color:"#888",fontSize:12,cursor:"pointer"}}>Back</button>
          )}
          {current < total - 1 ? (
            <button onClick={onNext} style={{padding:"5px 12px",background:"#00aaff",border:"none",borderRadius:6,color:"#000",fontSize:12,fontWeight:700,cursor:"pointer"}}>Next</button>
          ) : (
            <button onClick={onClose} style={{padding:"5px 12px",background:"#22c55e",border:"none",borderRadius:6,color:"#000",fontSize:12,fontWeight:700,cursor:"pointer"}}>Done</button>
          )}
        </div>
      </div>
    </div>
  );
}

export function TrainingOverlay({ active, onClose, refs }) {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    updateRect();
  }, [active, step]);

  useEffect(() => {
    if (!active) return;
    const handler = () => updateRect();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler);
    return () => { window.removeEventListener("resize", handler); window.removeEventListener("scroll", handler); };
  }, [active, step]);

  function updateRect() {
    const current = STEPS[step];
    const el = refs[current.selector]?.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  if (!active) return null;

  const current = STEPS[step];
  const el = refs[current.selector]?.current;
  const rect = el ? el.getBoundingClientRect() : null;

  const highlightStyle = rect ? {
    position:"fixed",
    top: rect.top - 4,
    left: rect.left - 4,
    width: rect.width + 8,
    height: rect.height + 8,
    borderRadius: 10,
    border: "2px solid #00aaff",
    boxShadow: "0 0 0 9999px rgba(0,0,0,0.7)",
    zIndex: 10000,
    pointerEvents: "none",
    transition: "all 0.3s"
  } : {
    position:"fixed", inset:0,
    background:"rgba(0,0,0,0.7)",
    zIndex:10000, pointerEvents:"none"
  };

  return (
    <>
      <div style={highlightStyle} />
      <TooltipBubble
        step={current}
        current={step}
        total={STEPS.length}
        onNext={() => setStep(s => Math.min(s + 1, STEPS.length - 1))}
        onPrev={() => setStep(s => Math.max(s - 1, 0))}
        onClose={onClose}
        targetRect={targetRect}
      />
    </>
  );
}

export function TrainingToggle({ active, onChange }) {
  return (
    <div onClick={() => onChange(!active)} style={{
      display:"flex", alignItems:"center", gap:10, cursor:"pointer",
      background: active ? "#0a1628" : "#111",
      border: `1px solid ${active ? "#00aaff" : "#2a2a2a"}`,
      borderRadius:8, padding:"7px 14px"
    }}>
      <div style={{fontSize:12, color: active ? "#00aaff" : "#555", fontWeight: active ? 700 : 400, textTransform:"uppercase", letterSpacing:1}}>
        {active ? "Training On" : "Training Mode"}
      </div>
      <div style={{width:36,height:20,borderRadius:10,background:active?"#00aaff":"#333",position:"relative",flexShrink:0}}>
        <div style={{position:"absolute",top:2,left:active?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}} />
      </div>
    </div>
  );
}
