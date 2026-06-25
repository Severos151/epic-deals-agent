import { useState, useRef } from "react";

const BRANDS = ["Epic Deals","Orange Advertising","GS Gear","Epic Rentals","Kirks Plumbing","Epic Marketing"];
const TYPES = ["Product Sale","Brand Visibility","Campaign","Promotional"];

function ScoreCard({ label, value }) {
  const color = value >= 8 ? "#22c55e" : value >= 6 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{flex:1,minWidth:70,background:"#111",border:"1px solid #2a2a2a",borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
      <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:5}}>{label}</div>
      <div style={{fontSize:24,fontWeight:900,color}}>{value}</div>
    </div>
  );
}

function Section({ title, items, icon }) {
  if (!items?.length) return null;
  return (
    <div style={{background:"#111",border:"1px solid #2a2a2a",borderRadius:12,padding:14,marginBottom:10}}>
      <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{title}</div>
      {items.map((item,i) => (
        <div key={i} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:i<items.length-1?"1px solid #1a1a1a":"none",fontSize:13,lineHeight:1.5}}>
          <span>{icon}</span><span style={{color:"#ddd"}}>{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [brand, setBrand] = useState("Epic Deals");
  const [type, setType] = useState("Product Sale");
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageType, setImageType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
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
    if (!input.trim() && !imageBase64) { alert("Add a description or upload an image first."); return; }
    setLoading(true); setResult(null); setError("");

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, type, input, imageBase64, imageType })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch(e) {
      setError(e.message || "Something went wrong. Try again.");
    }
    setLoading(false);
  }

  const avg = result ? Math.round((result.scores.quality+result.scores.trust+result.scores.scroll+result.scores.balance)/4) : 0;
  const verdictStyle = result ? (
    result.verdict==="APPROVED" ? {bg:"#052e16",fg:"#22c55e",emoji:"✅"} :
    result.verdict==="REVISE" ? {bg:"#2d1b00",fg:"#f59e0b",emoji:"⚠️"} :
    {bg:"#2d0a0a",fg:"#ef4444",emoji:"❌"}
  ) : null;

  return (
    <div style={{fontFamily:"'Segoe UI',sans-serif",background:"#0a0a0a",color:"#f0f0f0",minHeight:"100vh",padding:20,maxWidth:680,margin:"0 auto"}}>

      <div style={{textAlign:"center",padding:"20px 0 14px"}}>
        <div style={{fontSize:20,fontWeight:900,color:"#fff",letterSpacing:1}}>⚡ EPIC DEALS MARKETING AGENT</div>
        <div style={{color:"#00aaff",fontSize:12,marginTop:5}}>Wes's approval filter — baked in AI</div>
      </div>

      <div style={{display:"flex",gap:7,flexWrap:"wrap",justifyContent:"center",margin:"12px 0"}}>
        {BRANDS.map(b => (
          <button key={b} onClick={() => setBrand(b)} style={{
            padding:"5px 13px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:12,fontWeight:brand===b?700:400,
            background:brand===b?"#00aaff":"#1a1a1a",borderColor:brand===b?"#00aaff":"#333",color:brand===b?"#000":"#888"
          }}>{b}</button>
        ))}
      </div>

      <div style={{display:"flex",gap:7,flexWrap:"wrap",justifyContent:"center",marginBottom:14}}>
        {TYPES.map(t => (
          <button key={t} onClick={() => setType(t)} style={{
            padding:"5px 13px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:12,fontWeight:type===t?700:400,
            background:type===t?"#7c3aed":"#1a1a1a",borderColor:type===t?"#7c3aed":"#333",color:type===t?"#fff":"#888"
          }}>
            {t==="Product Sale"?"📦 ":t==="Brand Visibility"?"👁 ":t==="Campaign"?"🎯 ":"🎁 "}{t}
          </button>
        ))}
      </div>

      <div
        onClick={() => fileRef.current.click()}
        style={{
          background:"#111",border:`2px dashed ${image?"#00aaff":"#2a2a2a"}`,borderRadius:12,
          padding:image?8:20,marginBottom:12,textAlign:"center",cursor:"pointer"
        }}
      >
        {image ? (
          <div style={{position:"relative",display:"inline-block"}}>
            <img src={image} alt="preview" style={{maxHeight:200,maxWidth:"100%",borderRadius:8,display:"block"}} />
            <button
              onClick={e => { e.stopPropagation(); clearImage(); }}
              style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,0.7)",border:"none",color:"#fff",borderRadius:"50%",width:26,height:26,cursor:"pointer",fontSize:14}}
            >✕</button>
          </div>
        ) : (
          <div>
            <div style={{fontSize:28,marginBottom:6}}>🖼️</div>
            <div style={{fontSize:13,color:"#555"}}>Upload a creative to review</div>
            <div style={{fontSize:11,color:"#333",marginTop:3}}>JPG, PNG supported</div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{display:"none"}} />
      </div>

      <div style={{background:"#111",border:"1px solid #2a2a2a",borderRadius:12,padding:14,marginBottom:14}}>
        <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>
          {image ? "Add context (optional)" : "Describe the post or paste the copy/concept"}
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={image ? "e.g. Payday campaign targeting young professionals..." : "e.g. iPhone 15 Pro Max restocked, dark background, bold RESTOCKED text, no price, no CTA..."}
          style={{width:"100%",background:"#0a0a0a",border:"1px solid #2a2a2a",borderRadius:8,color:"#f0f0f0",padding:12,fontSize:14,resize:"vertical",minHeight:image?60:90,fontFamily:"inherit",outline:"none"}}
        />
      </div>

      <button
        onClick={reviewPost}
        disabled={loading}
        style={{width:"100%",padding:13,background:"linear-gradient(135deg,#00aaff,#0066cc)",border:"none",borderRadius:10,color:"#fff",fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",opacity:loading?0.5:1,letterSpacing:1}}
      >
        {loading ? "REVIEWING..." : "REVIEW THIS POST ⚡"}
      </button>

      {loading && <div style={{textAlign:"center",padding:28,color:"#555",fontSize:14}}>Running through Wes's filters...</div>}
      {error && <div style={{color:"#ef4444",padding:16,textAlign:"center"}}>{error}</div>}

      {result && (
        <div style={{marginTop:18}}>
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            <ScoreCard label="Quality" value={result.scores.quality} />
            <ScoreCard label="Trust" value={result.scores.trust} />
            <ScoreCard label="Scroll" value={result.scores.scroll} />
            <ScoreCard label="Balance" value={result.scores.balance} />
            <ScoreCard label="Overall" value={avg} />
          </div>
          <div style={{background:verdictStyle.bg,border:`1px solid ${verdictStyle.fg}`,color:verdictStyle.fg,borderRadius:10,padding:13,textAlign:"center",fontWeight:700,fontSize:15,marginBottom:14}}>
            {verdictStyle.emoji} {result.verdict}
          </div>
          <Section title="✅ What Works" items={result.what_works} icon="👍" />
          <Section title="❌ What Fails" items={result.what_fails} icon="⚠️" />
          <Section title="🔧 Fixes Needed" items={result.fixes} icon="→" />
          {result.copy_suggestion && (
            <div style={{background:"#0a1628",border:"1px solid #1a3a5c",borderRadius:10,padding:14}}>
              <div style={{fontSize:11,color:"#00aaff",textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>💡 Suggested Direction</div>
              <div style={{fontSize:13,color:"#cce4ff",lineHeight:1.6,fontStyle:"italic"}}>"{result.copy_suggestion}"</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
