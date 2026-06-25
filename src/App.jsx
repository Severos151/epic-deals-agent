import { useState, useRef } from "react";

const BRANDS = ["Epic Deals","Orange Advertising","GS Gear","Epic Rentals","Kirks Plumbing","Epic Marketing"];
const TYPES = ["Product Sale","Brand Visibility","Campaign","Promotional"];

const BRAND_CONTEXT = {
  "Epic Deals": "Certified Pre-Loved tech. Tested. Graded. Warrantied. Trusted by 40,000+ South Africans. 4.9 stars. Value anchoring with strikethrough retail vs Epic Deals price. Voice: smart, confident, relatable SA brand.",
  "Orange Advertising": "Marketing and advertising agency. Professional, creative, results-driven. Voice: strategic, bold, modern.",
  "GS Gear": "Tech accessories and gear. Value for money. Voice: practical, direct, energetic.",
  "Epic Rentals": "Rental solutions. Flexible, affordable, no long-term commitment. Voice: friendly, practical, trustworthy.",
  "Kirks Plumbing": "Plumbing services. Reliable, professional, fast. Voice: trustworthy, no-nonsense, local.",
  "Epic Marketing": "Full-service marketing. Creative campaigns, social media, content. Voice: creative, professional, results-focused."
};

function ScoreCard({ label, value }) {
  const color = value >= 8 ? "#22c55e" : value >= 6 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{flex:1,minWidth:70,background:"#111",border:"1px solid #2a2a2a",borderRadius:10,padding:"10px 6px",textAlign:"center"}}> <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:5}}>{label}</div> <div style={{fontSize:24,fontWeight:900,color}}>{value}</div> </div> );
}

function Section({ title, items, icon, color }) {
  if (!items?.length) return null;
  return (
    <div style={{background:"#111",border:"1px solid #2a2a2a",borderRadius:12,padding:14,marginBottom:10}}> <div style={{fontSize:11,color:color||"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{title}</div> {items.map((item,i) => (
        <div key={i} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:i<items.length-1?"1px solid #1a1a1a":"none",fontSize:13,lineHeight:1.5}}> <span>{icon}</span><span style={{color:"#ddd"}}>{item}</span> </div> ))}
    </div> );
}

function TabButton({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex:1,padding:"11px 0",border:"none",cursor:"pointer",fontSize:13,fontWeight:active?700:400,
      background:active?"#00aaff":"#1a1a1a",color:active?"#000":"#666",borderRadius:8,transition:"all 0.2s" }}>{label}</button> );
}

function Toggle({ label, sublabel, value, onChange, color }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#111",border:`1px solid ${value ? color||"#00aaff" : "#2a2a2a"}`,borderRadius:10,padding:"10px 14px",marginBottom:10,cursor:"pointer",transition:"border-color 0.2s"}} onClick={()=>onChange(!value)}> <div> <div style={{fontSize:13,color:"#ddd",fontWeight:600}}>{label}</div> {sublabel && <div style={{fontSize:11,color:"#555",marginTop:2}}>{sublabel}</div>}
      </div> <div style={{width:44,height:24,borderRadius:12,background:value?color||"#00aaff":"#333",position:"relative",transition:"background 0.2s",flexShrink:0}}> <div style={{position:"absolute",top:3,left:value?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}></div> </div> </div> );
}

function LangToggle({ value, onChange }) {
  return (
    <div style={{display:"flex",gap:6,marginBottom:14}}> {["english","afrikaans"].map(lang => (
        <button key={lang} onClick={()=>onChange(lang)} style={{
          flex:1,padding:"8px 0",border:"1px solid",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:value===lang?700:400,
          background:value===lang?"#1a3a1a":"#1a1a1a",borderColor:value===lang?"#22c55e":"#333",color:value===lang?"#22c55e":"#666" }}>{lang==="english"?" English":" Afrikaans"}</button> ))}
    </div> );
}

const selectStyle = {
  width:"100%",background:"#1a1a1a",border:"1px solid #333",borderRadius:8,
  color:"#f0f0f0",padding:"10px 14px",fontSize:14,cursor:"pointer",outline:"none",
  appearance:"none",WebkitAppearance:"none",
  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat:"no-repeat",backgroundPosition:"right 14px center",paddingRight:36
};

function getHistory() {
  try { return JSON.parse(localStorage.getItem("epicAgentHistory") || "[]"); } catch { return []; }
}
function saveToHistory(entry) {
  try {
    const h = getHistory();
    h.unshift({ ...entry, id: Date.now(), date: new Date().toLocaleDateString("en-ZA") });
    localStorage.setItem("epicAgentHistory", JSON.stringify(h.slice(0, 50)));
  } catch {}
}

export default function App() {
  const [tab, setTab] = useState("review");
  const [brand, setBrand] = useState("Epic Deals");
  const [type, setType] = useState("Product Sale");
  const [language, setLanguage] = useState("english");
  const [saFlavour, setSaFlavour] = useState(false);
  const [platform, setPlatform] = useState("Instagram");

  // Review state
  const [input, setInput] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageType, setImageType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [rewriting, setRewriting] = useState(false);
  const [rewrittenCaption, setRewrittenCaption] = useState("");

  // Brief state
  const [briefProduct, setBriefProduct] = useState("");
  const [briefGoal, setBriefGoal] = useState("Drive Sales");
  const [briefNotes, setBriefNotes] = useState("");
  const [briefLoading, setBriefLoading] = useState(false);
  const [brief, setBrief] = useState(null);

  const [history, setHistory] = useState(getHistory());
  const fileRef = useRef();

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setImageBase64(dataUrl.split(",")[1]);
      setImageType(file.type);
      setImage(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImage(null); setImageBase64(null); setImageType(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function reviewPost() {
    if (!input.trim() && !imageBase64 && !caption.trim()) {
      alert("Add a description, upload an image, or paste a caption first.");
      return;
    }
    setLoading(true); setResult(null); setError(""); setRewrittenCaption("");
    try {
      const res = await fetch("/api/review", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ brand, type, input, caption, imageBase64, imageType, platform })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      const avg = Math.round((data.scores.quality+data.scores.trust+data.scores.scroll+data.scores.balance)/4);
      saveToHistory({ brand, type, input: input||"(image)", verdict: data.verdict, avg });
      setHistory(getHistory());
    } catch(e) {
      setError(e.message || "Something went wrong. Try again.");
    }
    setLoading(false);
  }

  async function rewriteCaption() {
    if (!caption.trim()) return;
    setRewriting(true); setRewrittenCaption("");
    try {
      const res = await fetch("/api/rewrite", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ brand, type, caption, fixes: result?.fixes, suggestion: result?.copy_suggestion, saFlavour, language, platform })
      });
      const data = await res.json();
      setRewrittenCaption(data.rewritten || "");
    } catch(e) { setRewrittenCaption("Rewrite failed. Try again."); }
    setRewriting(false);
  }

  async function generateBrief() {
    if (!briefProduct.trim()) { alert("Enter a product or topic first."); return; }
    setBriefLoading(true); setBrief(null);
    try {
      const res = await fetch("/api/brief", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ brand, type, product: briefProduct, goal: briefGoal, notes: briefNotes, saFlavour, language, platform })
      });
      const data = await res.json();
      setBrief(data);
    } catch(e) { setBrief({ error: "Brief generation failed. Try again." }); }
    setBriefLoading(false);
  }

  const avg = result ? Math.round((result.scores.quality+result.scores.trust+result.scores.scroll+result.scores.balance)/4) : 0;
  const verdictStyle = result ? (
    result.verdict==="APPROVED" ? {bg:"#052e16",fg:"#22c55e",emoji:""} :
    result.verdict==="REVISE" ? {bg:"#2d1b00",fg:"#f59e0b",emoji:""} :
    {bg:"#2d0a0a",fg:"#ef4444",emoji:""}
  ) : null;

  // Review tab controls — brand, type, platform only
  const ReviewControls = () => (
    <> <div style={{marginBottom:12}}> <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Select Brand</div> <select value={brand} onChange={e=>setBrand(e.target.value)} style={selectStyle}> {BRANDS.map(b=><option key={b} value={b}>{b}</option>)}
        </select> </div> <div style={{marginBottom:16}}> <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Post Type</div> <div style={{display:"flex",gap:7,flexWrap:"wrap"}}> {TYPES.map(t=>(
            <button key={t} onClick={()=>setType(t)} style={{
              padding:"7px 16px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:12,fontWeight:type===t?700:400,
              background:type===t?"#7c3aed":"#1a1a1a",borderColor:type===t?"#7c3aed":"#333",color:type===t?"#fff":"#888" }}>{t}</button> ))}
        </div> </div> <div style={{marginBottom:16}}> <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Platform</div> <div style={{display:"flex",gap:6,flexWrap:"wrap"}}> {["Instagram","Facebook","TikTok","WhatsApp Status","All Platforms"].map(p=>(
            <button key={p} onClick={()=>setPlatform(p)} style={{
              padding:"7px 14px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:12,fontWeight:platform===p?700:400,
              background:platform===p?"#e11d48":"#1a1a1a",borderColor:platform===p?"#e11d48":"#333",color:platform===p?"#fff":"#888" }}>{p==="Instagram"?" ":p==="Facebook"?" ":p==="TikTok"?" ":}{p}</button> ))}
        </div> </div> </> );

  // Brief tab controls — everything including language and SA flavour
  const BriefControls = () => (
    <> <div style={{marginBottom:12}}> <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Select Brand</div> <select value={brand} onChange={e=>setBrand(e.target.value)} style={selectStyle}> {BRANDS.map(b=><option key={b} value={b}>{b}</option>)}
        </select> </div> <div style={{marginBottom:16}}> <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Post Type</div> <div style={{display:"flex",gap:7,flexWrap:"wrap"}}> {TYPES.map(t=>(
            <button key={t} onClick={()=>setType(t)} style={{
              padding:"7px 16px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:12,fontWeight:type===t?700:400,
              background:type===t?"#7c3aed":"#1a1a1a",borderColor:type===t?"#7c3aed":"#333",color:type===t?"#fff":"#888" }}>{t}</button> ))}
        </div> </div> <div style={{marginBottom:16}}> <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Platform</div> <div style={{display:"flex",gap:6,flexWrap:"wrap"}}> {["Instagram","Facebook","TikTok","WhatsApp Status","All Platforms"].map(p=>(
            <button key={p} onClick={()=>setPlatform(p)} style={{
              padding:"7px 14px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:12,fontWeight:platform===p?700:400,
              background:platform===p?"#e11d48":"#1a1a1a",borderColor:platform===p?"#e11d48":"#333",color:platform===p?"#fff":"#888" }}>{p==="Instagram"?" ":p==="Facebook"?" ":p==="TikTok"?" ":}{p}</button> ))}
        </div> </div> <div style={{marginBottom:4}}> <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Language</div> <LangToggle value={language} onChange={setLanguage} /> </div> <Toggle
        label="SA Flavour" sublabel="Add local humour, vernacular and cultural references" value={saFlavour}
        onChange={setSaFlavour}
        color="#f59e0b" /> </> );

  return (
    <div style={{fontFamily:"'Segoe UI',sans-serif",background:"#0a0a0a",color:"#f0f0f0",minHeight:"100vh",padding:20,maxWidth:680,margin:"0 auto"}}> {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0 20px",borderBottom:"1px solid #1a1a1a",marginBottom:20}}> <img src="/logo.png" alt="Epic Logo" style={{height:88,width:88,borderRadius:8,objectFit:"cover"}} /> <div style={{textAlign:"center",flex:1}}> <div style={{fontSize:18,fontWeight:900,color:"#fff",letterSpacing:1}}>MARKETING AGENT</div> <div style={{color:"#00aaff",fontSize:11,marginTop:3}}>Wes's approval filter — baked in AI</div> </div> <div style={{width:88}}></div> </div> {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:20}}> <TabButton label="Review Post" active={tab==="review"} onClick={()=>setTab("review")} /> <TabButton label="Generate Brief" active={tab==="brief"} onClick={()=>setTab("brief")} /> <TabButton label="Score History" active={tab==="history"} onClick={()=>setTab("history")} /> </div> {/* ── REVIEW TAB ── */}
      {tab==="review" && (
        <> <ReviewControls /> <div onClick={()=>fileRef.current.click()} style={{background:"#111",border:`2px dashed ${image?"#00aaff":"#2a2a2a"}`,borderRadius:12,padding:image?8:20,marginBottom:12,textAlign:"center",cursor:"pointer"}}> {image ? (
              <div style={{position:"relative",display:"inline-block"}}> <img src={image} alt="preview" style={{maxHeight:200,maxWidth:"100%",borderRadius:8,display:"block"}} /> <button onClick={e=>{e.stopPropagation();clearImage();}} style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,0.7)",border:"none",color:"#fff",borderRadius:"50%",width:26,height:26,cursor:"pointer",fontSize:14}}></button> </div> ) : (
              <div> <div style={{fontSize:13,color:"#555",marginBottom:6,fontWeight:600}}>TAP TO UPLOAD</div> <div style={{fontSize:13,color:"#555"}}>Upload creative to review</div> <div style={{fontSize:11,color:"#333",marginTop:3}}>JPG, PNG supported</div> </div> )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{display:"none"}} /> </div> <div style={{background:"#111",border:"1px solid #2a2a2a",borderRadius:12,padding:14,marginBottom:12}}> <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Social Media Caption</div> <textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Paste the caption here — copy, hashtags, CTA, everything..." style={{width:"100%",background:"#0a0a0a",border:"1px solid #2a2a2a",borderRadius:8,color:"#f0f0f0",padding:12,fontSize:14,resize:"vertical",minHeight:80,fontFamily:"inherit",outline:"none"}} /> </div> <div style={{background:"#111",border:"1px solid #2a2a2a",borderRadius:12,padding:14,marginBottom:14}}> <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{image?"Additional Context (optional)":"Describe the Post / Concept"}</div> <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder={image?"e.g. Payday campaign targeting young professionals...":"e.g. iPhone 15 Pro Max restocked, dark background, bold RESTOCKED text, no price, no CTA..."} style={{width:"100%",background:"#0a0a0a",border:"1px solid #2a2a2a",borderRadius:8,color:"#f0f0f0",padding:12,fontSize:14,resize:"vertical",minHeight:image?60:80,fontFamily:"inherit",outline:"none"}} /> </div> <button onClick={reviewPost} disabled={loading} style={{width:"100%",padding:13,background:"linear-gradient(135deg,#00aaff,#0066cc)",border:"none",borderRadius:10,color:"#fff",fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",opacity:loading?0.5:1,letterSpacing:1}}> {loading?"REVIEWING...":"REVIEW THIS POST"}
          </button> {loading && <div style={{textAlign:"center",padding:28,color:"#555",fontSize:14}}>Running through Wes's filters...</div>}
          {error && <div style={{color:"#ef4444",padding:16,textAlign:"center"}}>{error}</div>}

          {result && (
            <div style={{marginTop:18}}> <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}> <ScoreCard label="Quality" value={result.scores.quality} /> <ScoreCard label="Trust" value={result.scores.trust} /> <ScoreCard label="Scroll" value={result.scores.scroll} /> <ScoreCard label="Balance" value={result.scores.balance} /> <ScoreCard label="Overall" value={avg} /> </div> <div style={{background:verdictStyle.bg,border:`1px solid ${verdictStyle.fg}`,color:verdictStyle.fg,borderRadius:10,padding:13,textAlign:"center",fontWeight:700,fontSize:15,marginBottom:14}}> {result.verdict}
              </div> <Section title="What Works" items={result.what_works} icon="—" /> <Section title="What Fails" items={result.what_fails} icon="—" /> <Section title="Fixes Needed" items={result.fixes} icon="→" /> {result.platform_notes?.length > 0 && <Section title={`${platform} Notes`} items={result.platform_notes} icon="→" color="#e11d48" />}
              {result.caption_feedback?.length > 0 && <Section title="Caption Review" items={result.caption_feedback} icon="→" color="#4ade80" />}
              {result.copy_suggestion && (
                <div style={{background:"#0a1628",border:"1px solid #1a3a5c",borderRadius:10,padding:14,marginBottom:12}}> <div style={{fontSize:11,color:"#00aaff",textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>Suggested Direction</div> <div style={{fontSize:13,color:"#cce4ff",lineHeight:1.6,fontStyle:"italic"}}>"{result.copy_suggestion}"</div> </div> )}
              {caption.trim() && result.verdict !== "APPROVED" && (
                <div style={{marginTop:4}}> <button onClick={rewriteCaption} disabled={rewriting} style={{width:"100%",padding:12,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,cursor:rewriting?"not-allowed":"pointer",opacity:rewriting?0.5:1}}> {rewriting?"REWRITING...":"REWRITE CAPTION"}
                  </button> {rewrittenCaption && (
                    <div style={{background:"#1a0a2e",border:"1px solid #4c1d95",borderRadius:10,padding:14,marginTop:10}}> <div style={{fontSize:11,color:"#a78bfa",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Rewritten Caption {saFlavour?"(SA Flavour)":""} {language==="afrikaans"?"(Afrikaans)":""}</div> <div style={{fontSize:14,color:"#ede9fe",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{rewrittenCaption}</div> <button onClick={()=>navigator.clipboard.writeText(rewrittenCaption)} style={{marginTop:10,padding:"6px 14px",background:"#4c1d95",border:"none",borderRadius:6,color:"#fff",fontSize:12,cursor:"pointer"}}>Copy</button> </div> )}
                </div> )}
            </div> )}
        </> )}

      {/* ── BRIEF TAB ── */}
      {tab==="brief" && (
        <> <BriefControls /> <div style={{background:"#111",border:"1px solid #2a2a2a",borderRadius:12,padding:14,marginBottom:12}}> <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Product / Topic</div> <input value={briefProduct} onChange={e=>setBriefProduct(e.target.value)} placeholder="e.g. iPhone 15 Pro Max, MacBook M2, Samsung Galaxy S24..." style={{width:"100%",background:"#0a0a0a",border:"1px solid #2a2a2a",borderRadius:8,color:"#f0f0f0",padding:12,fontSize:14,fontFamily:"inherit",outline:"none"}} /> </div> <div style={{marginBottom:12}}> <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Campaign Goal</div> <select value={briefGoal} onChange={e=>setBriefGoal(e.target.value)} style={selectStyle}> {["Drive Sales","Build Brand Awareness","Announce Restock","Promote Deal/Discount","Build Trust","Engagement / Reach"].map(g=><option key={g} value={g}>{g}</option>)}
            </select> </div> <div style={{background:"#111",border:"1px solid #2a2a2a",borderRadius:12,padding:14,marginBottom:14}}> <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Extra Notes (optional)</div> <textarea value={briefNotes} onChange={e=>setBriefNotes(e.target.value)} placeholder="e.g. Target payday weekend, focus on students, mention warranty..." style={{width:"100%",background:"#0a0a0a",border:"1px solid #2a2a2a",borderRadius:8,color:"#f0f0f0",padding:12,fontSize:14,resize:"vertical",minHeight:70,fontFamily:"inherit",outline:"none"}} /> </div> <button onClick={generateBrief} disabled={briefLoading} style={{width:"100%",padding:13,background:"linear-gradient(135deg,#00aaff,#0066cc)",border:"none",borderRadius:10,color:"#fff",fontSize:15,fontWeight:700,cursor:briefLoading?"not-allowed":"pointer",opacity:briefLoading?0.5:1,letterSpacing:1}}> {briefLoading?"GENERATING...":"GENERATE BRIEF"}
          </button> {briefLoading && <div style={{textAlign:"center",padding:28,color:"#555",fontSize:14}}>Building your creative brief...</div>}

          {brief && !brief.error && (
            <div style={{marginTop:18}}> {[
                {label:"Headline / Hook",key:"headline",color:"#00aaff"},
                {label:"Visual Direction",key:"visual",color:"#a78bfa"},
                {label:"Copy Angle",key:"copy",color:"#4ade80"},
                {label:"Target Audience",key:"audience",color:"#f59e0b"},
                {label:"Suggested Caption",key:"caption",color:"#f0f0f0"},
                {label:"Hashtags",key:"hashtags",color:"#555"},
              ].map(({label,key,color})=> brief[key] ? (
                <div key={key} style={{background:"#111",border:"1px solid #2a2a2a",borderRadius:12,padding:14,marginBottom:10}}> <div style={{fontSize:11,color,textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>{label}</div> <div style={{fontSize:14,color:"#ddd",lineHeight:1.6}}>{brief[key]}</div> {key==="caption" && <button onClick={()=>navigator.clipboard.writeText(brief[key])} style={{marginTop:8,padding:"6px 14px",background:"#1a3a5c",border:"none",borderRadius:6,color:"#fff",fontSize:12,cursor:"pointer"}}>Copy</button>}
                </div> ) : null)}
            </div> )}
          {brief?.error && <div style={{color:"#ef4444",padding:16,textAlign:"center"}}>{brief.error}</div>}
        </> )}

      {/* ── HISTORY TAB ── */}
      {tab==="history" && (
        <> <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}> <div style={{fontSize:13,color:"#555"}}>Last {history.length} submissions</div> {history.length > 0 && (
              <button onClick={()=>{localStorage.removeItem("epicAgentHistory");setHistory([]);}} style={{padding:"5px 12px",background:"#2d0a0a",border:"1px solid #ef4444",borderRadius:6,color:"#ef4444",fontSize:12,cursor:"pointer"}}>Clear</button> )}
          </div> {history.length === 0 && (
            <div style={{textAlign:"center",padding:40,color:"#333",fontSize:14}}>No submissions yet. Review a post to start tracking.</div> )}

          {history.map((h) => {
            const vc = h.verdict==="APPROVED"?"#22c55e":h.verdict==="REVISE"?"#f59e0b":"#ef4444";
            const ve = h.verdict==="APPROVED"?"":h.verdict==="REVISE"?"":"";
            return (
              <div key={h.id} style={{background:"#111",border:"1px solid #2a2a2a",borderRadius:12,padding:14,marginBottom:8}}> <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}> <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{h.brand}</div> <div style={{display:"flex",gap:8,alignItems:"center"}}> <div style={{fontSize:20,fontWeight:900,color:vc}}>{h.avg}</div> <div style={{fontSize:13,color:vc,fontWeight:700}}>{ve} {h.verdict}</div> </div> </div> <div style={{fontSize:12,color:"#555"}}>{h.type} — {h.date}</div> {h.input && h.input !== "(image)" && <div style={{fontSize:12,color:"#444",marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.input}</div>}
              </div> );
          })}

          {history.length > 0 && (
            <div style={{background:"#111",border:"1px solid #2a2a2a",borderRadius:12,padding:14,marginTop:8}}> <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Score Summary</div> {["APPROVED","REVISE","REJECTED"].map(v => {
                const count = history.filter(h=>h.verdict===v).length;
                const pct = history.length ? Math.round((count/history.length)*100) : 0;
                const color = v==="APPROVED"?"#22c55e":v==="REVISE"?"#f59e0b":"#ef4444";
                return (
                  <div key={v} style={{marginBottom:10}}> <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}> <span style={{color}}>{v}</span> <span style={{color:"#555"}}>{count} ({pct}%)</span> </div> <div style={{background:"#1a1a1a",borderRadius:4,height:6}}> <div style={{background:color,height:6,borderRadius:4,width:`${pct}%`,transition:"width 0.3s"}}></div> </div> </div> );
              })}
              <div style={{marginTop:10,fontSize:12,color:"#555"}}> Avg score: <span style={{color:"#fff",fontWeight:700}}>{history.length ? Math.round(history.reduce((a,h)=>a+h.avg,0)/history.length) : "—"}</span> </div> </div> )}
        </> )}
    </div> );
}
