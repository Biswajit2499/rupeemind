import { useState, useEffect, useRef } from "react";

const fmt = (n) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr`
  : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L`
  : `₹${Math.round(n).toLocaleString("en-IN")}`;

const fmtShort = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const MARKET = {
  nifty: { value: 24387.45, change: +0.83, points: +201.3 },
  sensex: { value: 80124.2, change: +0.76, points: +606.9 },
  topGainers: [
    { name: "HDFC Bank", price: 1712.4, change: +2.31 },
    { name: "Reliance", price: 2948.1, change: +1.87 },
    { name: "Infosys", price: 1834.5, change: +1.45 },
    { name: "TCS", price: 3912.0, change: +1.12 },
  ],
  topLosers: [
    { name: "Adani Ports", price: 1287.3, change: -1.92 },
    { name: "ONGC", price: 261.8, change: -1.44 },
    { name: "Coal India", price: 408.5, change: -0.98 },
    { name: "BPCL", price: 311.2, change: -0.72 },
  ],
};

async function askClaude(messages, profile) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, profile }),
  });
  if (!res.ok) throw new Error("Chat failed");
  const data = await res.json();
  return data.reply;
}

function BarChart({ data, color = "#22c55e" }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-20 mt-2">
      {data.map((d, i) => (
        <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1, gap:4 }}>
          <div style={{ width:"100%", borderRadius:"4px 4px 0 0", transition:"all 0.5s", height:`${Math.max(4,(d.value/max)*72)}px`, backgroundColor:color, opacity:0.7+0.3*(i/data.length) }} />
          <span style={{ fontSize:9, color:"#666" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { id:"dashboard", label:"Dashboard", icon:"⊞" },
  { id:"chat", label:"AI Chat", icon:"◎" },
  { id:"expenses", label:"Expenses", icon:"≡" },
  { id:"tools", label:"Tools", icon:"∑" },
  { id:"market", label:"Market", icon:"↗" },
];

const CATS = ["Food","Transport","Rent","Shopping","Entertainment","Health","Utilities","Other"];
const CAT_COLORS = { Food:"#f59e0b", Transport:"#3b82f6", Rent:"#ef4444", Shopping:"#8b5cf6", Entertainment:"#ec4899", Health:"#22c55e", Utilities:"#64748b", Other:"#94a3b8" };

export default function RupeeMind() {
  const [tab, setTab] = useState("dashboard");
  const [profile, setProfile] = useState({ name:"Arjun", income:65000, city:"Bangalore", goal:"Buy a bike in 8 months" });
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif", background:"#0a0a0f", minHeight:"100vh", color:"#e8e8f0", maxWidth:440, margin:"0 auto", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:#2a2a3a; border-radius:2px; }
        .btn { cursor:pointer; border:none; transition:all 0.15s; }
        .btn:active { transform:scale(0.97); }
        .card { background:#13131f; border:1px solid #1e1e2e; border-radius:16px; padding:16px; }
        .mono { font-family:'DM Mono',monospace; }
        input, select { background:#1a1a2a; border:1px solid #2a2a3e; border-radius:10px; color:#e8e8f0; padding:10px 14px; font-family:inherit; font-size:14px; width:100%; outline:none; }
        input:focus, select:focus { border-color:#4f46e5; }
        .green { color:#22c55e; }
        .red { color:#ef4444; }
        .purple { color:#818cf8; }
        .fade-in { animation:fadeIn 0.3s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)} }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
      `}</style>

      {/* Header */}
      <div style={{ padding:"16px 20px 12px", borderBottom:"1px solid #1e1e2e", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#0a0a0f", position:"sticky", top:0, zIndex:10 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.5px" }}>Rupee<span style={{ color:"#4f46e5" }}>Mind</span></div>
          <div style={{ fontSize:11, color:"#666", marginTop:1 }}>AI Finance · India</div>
        </div>
        <button className="btn" onClick={() => setShowProfile(!showProfile)} style={{ background:"#1a1a2e", border:"1px solid #2a2a3e", borderRadius:999, padding:"6px 14px", fontSize:13, color:"#a0a0c0", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ width:22, height:22, borderRadius:"50%", background:"#4f46e5", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", fontWeight:600 }}>{profile.name[0]}</span>
          {profile.name}
        </button>
      </div>

      {showProfile && <ProfileModal profile={profile} setProfile={setProfile} onClose={() => setShowProfile(false)} />}

      <div style={{ padding:"16px 16px 80px", overflow:"auto", maxHeight:"calc(100vh - 120px)" }}>
        {tab === "dashboard" && <Dashboard profile={profile} />}
        {tab === "chat" && <ChatTab profile={profile} />}
        {tab === "expenses" && <ExpensesTab profile={profile} />}
        {tab === "tools" && <ToolsTab />}
        {tab === "market" && <MarketTab />}
      </div>

      {/* Bottom Nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:440, background:"#0d0d18", borderTop:"1px solid #1e1e2e", display:"flex", padding:"8px 0 12px" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"4px 0", background:"none", border:"none", cursor:"pointer", color:tab===t.id?"#4f46e5":"#555" }}>
            <span style={{ fontSize:18 }}>{t.icon}</span>
            <span style={{ fontSize:10, fontWeight:tab===t.id?600:400 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfileModal({ profile, setProfile, onClose }) {
  const [local, setLocal] = useState(profile);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:100, display:"flex", alignItems:"flex-end", maxWidth:440, margin:"0 auto" }} onClick={onClose}>
      <div className="fade-in" style={{ background:"#13131f", border:"1px solid #1e1e2e", borderRadius:"20px 20px 0 0", padding:24, width:"100%" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight:700, fontSize:16, marginBottom:16 }}>Your Profile</div>
        {[{label:"Name",key:"name",type:"text"},{label:"Monthly Income (₹)",key:"income",type:"number"},{label:"City",key:"city",type:"text"},{label:"Current Goal",key:"goal",type:"text"}].map(f => (
          <div key={f.key} style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:"#888", marginBottom:4 }}>{f.label}</div>
            <input type={f.type} value={local[f.key]} onChange={e => setLocal({...local,[f.key]:f.type==="number"?+e.target.value:e.target.value})} />
          </div>
        ))}
        <button className="btn" onClick={() => { setProfile(local); onClose(); }} style={{ background:"#4f46e5", color:"#fff", width:"100%", padding:"12px", fontWeight:600, fontSize:14, borderRadius:12, marginTop:8 }}>Save Profile</button>
      </div>
    </div>
  );
}

function Dashboard({ profile }) {
  const savings = Math.round(profile.income * 0.28);
  const expenses = profile.income - savings;
  const goalAmt = 95000;
  const saved = savings * 2;
  const progress = Math.min(100, (saved / goalAmt) * 100);
  const spendData = [{label:"Jan",value:38200},{label:"Feb",value:41000},{label:"Mar",value:36800},{label:"Apr",value:39500},{label:"May",value:42100},{label:"Jun",value:37300}];

  return (
    <div className="fade-in">
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:22, fontWeight:700 }}>Hey, {profile.name} 👋</div>
        <div style={{ fontSize:13, color:"#888", marginTop:2 }}>{profile.city} · April 2026</div>
      </div>

      <div style={{ background:"linear-gradient(135deg,#1a1560 0%,#0d0d1a 100%)", border:"1px solid #2d2a6e", borderRadius:20, padding:20, marginBottom:14, boxShadow:"0 0 20px rgba(79,70,229,0.15)" }}>
        <div style={{ fontSize:12, color:"#8884cc", fontWeight:500, marginBottom:4 }}>Monthly Income</div>
        <div className="mono" style={{ fontSize:32, fontWeight:700, letterSpacing:"-1px" }}>{fmtShort(profile.income)}</div>
        <div style={{ display:"flex", gap:16, marginTop:16 }}>
          <div><div style={{ fontSize:11, color:"#666" }}>Saved</div><div className="mono green" style={{ fontSize:16, fontWeight:600 }}>{fmtShort(savings)}</div></div>
          <div style={{ width:1, background:"#2a2a4a" }} />
          <div><div style={{ fontSize:11, color:"#666" }}>Spent</div><div className="mono" style={{ fontSize:16, fontWeight:600, color:"#f59e0b" }}>{fmtShort(expenses)}</div></div>
          <div style={{ width:1, background:"#2a2a4a" }} />
          <div><div style={{ fontSize:11, color:"#666" }}>Save Rate</div><div className="mono purple" style={{ fontSize:16, fontWeight:600 }}>28%</div></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <div><div style={{ fontSize:12, color:"#888" }}>Active Goal</div><div style={{ fontWeight:600, marginTop:2 }}>{profile.goal}</div></div>
          <div style={{ textAlign:"right" }}><div className="mono green" style={{ fontWeight:700 }}>{fmtShort(saved)}</div><div style={{ fontSize:11, color:"#666" }}>of {fmtShort(goalAmt)}</div></div>
        </div>
        <div style={{ background:"#1e1e2e", borderRadius:999, height:6, overflow:"hidden" }}>
          <div style={{ width:`${progress}%`, height:"100%", background:"linear-gradient(90deg,#4f46e5,#22c55e)", borderRadius:999, transition:"width 1s ease" }} />
        </div>
        <div style={{ fontSize:12, color:"#666", marginTop:8 }}>{Math.round(progress)}% complete · ~{Math.ceil((goalAmt-saved)/savings)} months to go</div>
      </div>

      <div className="card" style={{ marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>Monthly Spending</div>
        <div style={{ fontSize:11, color:"#666" }}>Last 6 months</div>
        <BarChart data={spendData} color="#4f46e5" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        {[{label:"CIBIL Score",value:"748",sub:"Good →",color:"#22c55e"},{label:"SIP Active",value:"₹5,000",sub:"2 funds",color:"#818cf8"},{label:"EMIs",value:"₹4,800",sub:"1 active",color:"#f59e0b"},{label:"Nifty50",value:"24,387",sub:"+0.83% today",color:"#22c55e"}].map(s => (
          <div key={s.label} className="card" style={{ textAlign:"center" }}>
            <div style={{ fontSize:11, color:"#888", marginBottom:4 }}>{s.label}</div>
            <div className="mono" style={{ fontSize:18, fontWeight:700, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:"#666" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background:"#0d1520", border:"1px solid #1a3040", borderRadius:16, padding:14 }}>
        <div style={{ fontSize:11, color:"#4f9cf0", fontWeight:600, marginBottom:6 }}>💡 AI INSIGHT</div>
        <div style={{ fontSize:13, color:"#c0d0e0", lineHeight:1.5 }}>You're saving 28% of income — solid! Increase your SIP by ₹1,000/month to hit your bike goal 6 weeks earlier. Consider ELSS funds for 80C tax savings before March 31st.</div>
      </div>
    </div>
  );
}

function ChatTab({ profile }) {
  const [messages, setMessages] = useState([{ role:"assistant", content:`Namaste ${profile.name}! 👋 I'm your RupeeMind AI advisor. Ask me anything about SIPs, EMIs, taxes, savings, or investments. What's on your mind?` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const QUICK = ["How much SIP for ₹10L in 5 years?","Should I take a ₹3L personal loan?","How to save tax under 80C?","Best investment for ₹5K/month?"];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role:"user", content:text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const reply = await askClaude(newMsgs.map(m => ({ role:m.role, content:m.content })), profile);
      setMessages([...newMsgs, { role:"assistant", content:reply }]);
    } catch {
      setMessages([...newMsgs, { role:"assistant", content:"Sorry, something went wrong. Try again!" }]);
    }
    setLoading(false);
  };

  return (
    <div className="fade-in" style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 200px)" }}>
      <div style={{ flex:1, overflow:"auto", paddingBottom:8 }}>
        {messages.map((m,i) => (
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", marginBottom:12 }}>
            {m.role==="assistant" && <div style={{ width:28, height:28, borderRadius:"50%", background:"#4f46e5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, marginRight:8, flexShrink:0 }}>◎</div>}
            <div style={{ maxWidth:"78%", background:m.role==="user"?"#4f46e5":"#13131f", border:m.role==="user"?"none":"1px solid #1e1e2e", borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", padding:"10px 14px", fontSize:14, lineHeight:1.55, color:m.role==="user"?"#fff":"#d0d0e8", whiteSpace:"pre-wrap" }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:"#4f46e5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>◎</div>
            <div style={{ background:"#13131f", border:"1px solid #1e1e2e", borderRadius:"18px 18px 18px 4px", padding:"12px 16px" }}>
              <div style={{ display:"flex", gap:4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#4f46e5", animation:`bounce 0.8s ${i*0.15}s infinite ease-in-out` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {messages.length < 3 && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
          {QUICK.map(q => <button key={q} className="btn" onClick={() => send(q)} style={{ background:"#13131f", border:"1px solid #2a2a3e", borderRadius:999, padding:"6px 12px", fontSize:12, color:"#a0a0c0", cursor:"pointer" }}>{q}</button>)}
        </div>
      )}
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && send(input)} placeholder="Ask about SIP, EMI, tax, savings..." />
        <button className="btn" onClick={() => send(input)} disabled={loading||!input.trim()} style={{ background:input.trim()?"#4f46e5":"#1e1e2e", border:"none", borderRadius:12, width:44, height:44, fontSize:18, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>↑</button>
      </div>
    </div>
  );
}

function ExpensesTab({ profile }) {
  const [txns, setTxns] = useState([
    {id:1,desc:"Swiggy dinner",amount:340,cat:"Food",date:"Apr 27"},
    {id:2,desc:"Ola cab",amount:180,cat:"Transport",date:"Apr 26"},
    {id:3,desc:"Rent April",amount:12000,cat:"Rent",date:"Apr 1"},
    {id:4,desc:"Amazon order",amount:1850,cat:"Shopping",date:"Apr 25"},
    {id:5,desc:"Netflix",amount:199,cat:"Entertainment",date:"Apr 20"},
    {id:6,desc:"Gym monthly",amount:1200,cat:"Health",date:"Apr 5"},
    {id:7,desc:"Electricity bill",amount:890,cat:"Utilities",date:"Apr 15"},
    {id:8,desc:"Lunch + tea",amount:220,cat:"Food",date:"Apr 28"},
  ]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({desc:"",amount:"",cat:"Food"});
  const total = txns.reduce((s,t) => s+t.amount, 0);
  const budget = profile.income * 0.72;
  const remaining = budget - total;
  const byCat = CATS.map(c => ({ cat:c, amount:txns.filter(t=>t.cat===c).reduce((s,t)=>s+t.amount,0) })).filter(x=>x.amount>0);
  const add = () => {
    if (!form.desc||!form.amount) return;
    setTxns([{id:Date.now(),desc:form.desc,amount:+form.amount,cat:form.cat,date:"Apr 28"},...txns]);
    setForm({desc:"",amount:"",cat:"Food"});
    setShow(false);
  };

  return (
    <div className="fade-in">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div><div style={{ fontWeight:700, fontSize:18 }}>Expenses</div><div style={{ fontSize:12, color:"#888" }}>April 2026</div></div>
        <button className="btn" onClick={() => setShow(!show)} style={{ background:"#4f46e5", color:"#fff", borderRadius:12, padding:"8px 16px", fontSize:13, fontWeight:600 }}>+ Add</button>
      </div>

      <div className="card" style={{ marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <div><div style={{ fontSize:11, color:"#888" }}>Spent this month</div><div className="mono" style={{ fontSize:24, fontWeight:700, color:"#f59e0b", marginTop:2 }}>{fmtShort(total)}</div></div>
          <div style={{ textAlign:"right" }}><div style={{ fontSize:11, color:"#888" }}>Remaining</div><div className="mono" style={{ fontSize:24, fontWeight:700, color:remaining>0?"#22c55e":"#ef4444", marginTop:2 }}>{fmtShort(Math.abs(remaining))}{remaining<0?" over":""}</div></div>
        </div>
        <div style={{ background:"#1e1e2e", borderRadius:999, height:6, overflow:"hidden", marginTop:14 }}>
          <div style={{ width:`${Math.min(100,(total/budget)*100)}%`, height:"100%", background:total>budget?"#ef4444":"linear-gradient(90deg,#4f46e5,#f59e0b)", borderRadius:999 }} />
        </div>
        <div style={{ fontSize:11, color:"#666", marginTop:6 }}>Budget: {fmtShort(budget)} · {Math.round((total/budget)*100)}% used</div>
      </div>

      {show && (
        <div className="card fade-in" style={{ marginBottom:14 }}>
          <div style={{ fontWeight:600, marginBottom:12 }}>Add Expense</div>
          <input placeholder="Description" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} style={{ marginBottom:8 }} />
          <input type="number" placeholder="Amount (₹)" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} style={{ marginBottom:8 }} />
          <select value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})} style={{ marginBottom:12 }}>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
          <button className="btn" onClick={add} style={{ background:"#4f46e5", color:"#fff", width:"100%", padding:10, borderRadius:10, fontWeight:600 }}>Save Expense</button>
        </div>
      )}

      <div className="card" style={{ marginBottom:14 }}>
        <div style={{ fontWeight:600, marginBottom:12 }}>By Category</div>
        {byCat.map(c => (
          <div key={c.cat} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:CAT_COLORS[c.cat], flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ fontSize:13 }}>{c.cat}</span>
                <span className="mono" style={{ fontSize:13, fontWeight:500 }}>{fmtShort(c.amount)}</span>
              </div>
              <div style={{ background:"#1e1e2e", borderRadius:999, height:3 }}>
                <div style={{ width:`${(c.amount/total)*100}%`, height:"100%", background:CAT_COLORS[c.cat], borderRadius:999 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontWeight:600, fontSize:14, marginBottom:10 }}>Recent Transactions</div>
      {txns.slice(0,8).map(t => (
        <div key={t.id} className="card" style={{ marginBottom:8, display:"flex", alignItems:"center", gap:12, padding:"12px 14px" }}>
          <div style={{ width:36, height:36, borderRadius:10, background:CAT_COLORS[t.cat]+"22", border:`1px solid ${CAT_COLORS[t.cat]}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
            {t.cat==="Food"?"🍔":t.cat==="Transport"?"🚗":t.cat==="Rent"?"🏠":t.cat==="Shopping"?"🛒":t.cat==="Entertainment"?"🎬":t.cat==="Health"?"💊":"💡"}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:500 }}>{t.desc}</div>
            <div style={{ fontSize:11, color:"#666", marginTop:1 }}>{t.cat} · {t.date}</div>
          </div>
          <div className="mono red" style={{ fontWeight:600 }}>−{fmtShort(t.amount)}</div>
        </div>
      ))}
    </div>
  );
}

function ToolsTab() {
  const [tool, setTool] = useState("sip");
  const [sip, setSip] = useState({monthly:5000,rate:12,years:10});
  const [emi, setEmi] = useState({principal:300000,rate:10.5,years:3});

  const sipResult = (() => {
    const r = sip.rate/100/12, n = sip.years*12;
    const fv = sip.monthly*((Math.pow(1+r,n)-1)/r)*(1+r);
    const invested = sip.monthly*n;
    return { fv, invested, gains:fv-invested };
  })();

  const emiResult = (() => {
    const r = emi.rate/100/12, n = emi.years*12;
    const e = (emi.principal*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
    return { emi:e, total:e*n, interest:e*n-emi.principal };
  })();

  const sipChartData = Array.from({length:sip.years},(_,i) => {
    const n=(i+1)*12, r=sip.rate/100/12;
    return { label:`Y${i+1}`, value:sip.monthly*((Math.pow(1+r,n)-1)/r)*(1+r) };
  });

  return (
    <div className="fade-in">
      <div style={{ fontWeight:700, fontSize:18, marginBottom:16 }}>Finance Tools</div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[{id:"sip",label:"SIP Calculator"},{id:"emi",label:"EMI Calculator"}].map(t => (
          <button key={t.id} className="btn" onClick={() => setTool(t.id)} style={{ flex:1, padding:"10px", borderRadius:12, background:tool===t.id?"#4f46e5":"#13131f", border:`1px solid ${tool===t.id?"#4f46e5":"#2a2a3e"}`, color:tool===t.id?"#fff":"#888", fontWeight:600, fontSize:13 }}>{t.label}</button>
        ))}
      </div>

      {tool==="sip" && (
        <div>
          <div className="card" style={{ marginBottom:14 }}>
            {[{label:"Monthly SIP (₹)",key:"monthly",min:500,max:100000,step:500},{label:"Expected Return (%)",key:"rate",min:6,max:30,step:0.5},{label:"Duration (Years)",key:"years",min:1,max:30,step:1}].map(f => (
              <div key={f.key} style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:13, color:"#aaa" }}>{f.label}</span>
                  <span className="mono" style={{ fontSize:13, fontWeight:600, color:"#818cf8" }}>{f.key==="monthly"?`₹${sip[f.key].toLocaleString("en-IN")}`:f.key==="rate"?`${sip[f.key]}%`:`${sip[f.key]} yrs`}</span>
                </div>
                <input type="range" min={f.min} max={f.max} step={f.step} value={sip[f.key]} onChange={e=>setSip({...sip,[f.key]:+e.target.value})} style={{ width:"100%", accentColor:"#4f46e5", background:"transparent", border:"none", padding:0 }} />
              </div>
            ))}
          </div>
          <div style={{ background:"linear-gradient(135deg,#0d1a0d,#0a0a0f)", border:"1px solid #1a4020", borderRadius:16, padding:18, marginBottom:14 }}>
            <div style={{ fontSize:12, color:"#4ade80", marginBottom:8 }}>MATURITY VALUE</div>
            <div className="mono green" style={{ fontSize:32, fontWeight:700, letterSpacing:"-1px" }}>{fmt(sipResult.fv)}</div>
            <div style={{ display:"flex", gap:20, marginTop:14 }}>
              <div><div style={{ fontSize:11, color:"#666" }}>Invested</div><div className="mono" style={{ fontSize:15, fontWeight:600 }}>{fmt(sipResult.invested)}</div></div>
              <div><div style={{ fontSize:11, color:"#666" }}>Gains</div><div className="mono green" style={{ fontSize:15, fontWeight:600 }}>+{fmt(sipResult.gains)}</div></div>
              <div><div style={{ fontSize:11, color:"#666" }}>Returns</div><div className="mono purple" style={{ fontSize:15, fontWeight:600 }}>{Math.round((sipResult.gains/sipResult.invested)*100)}%</div></div>
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize:12, color:"#888", marginBottom:4 }}>Growth Projection</div>
            <BarChart data={sipChartData.filter((_,i)=>i%Math.max(1,Math.floor(sip.years/8))===0||i===sip.years-1)} color="#22c55e" />
          </div>
        </div>
      )}

      {tool==="emi" && (
        <div>
          <div className="card" style={{ marginBottom:14 }}>
            {[{label:"Loan Amount (₹)",key:"principal",min:10000,max:5000000,step:10000},{label:"Interest Rate (%)",key:"rate",min:6,max:24,step:0.1},{label:"Tenure (Years)",key:"years",min:1,max:20,step:1}].map(f => (
              <div key={f.key} style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:13, color:"#aaa" }}>{f.label}</span>
                  <span className="mono" style={{ fontSize:13, fontWeight:600, color:"#818cf8" }}>{f.key==="principal"?`₹${emi[f.key].toLocaleString("en-IN")}`:f.key==="rate"?`${emi[f.key]}%`:`${emi[f.key]} yrs`}</span>
                </div>
                <input type="range" min={f.min} max={f.max} step={f.step} value={emi[f.key]} onChange={e=>setEmi({...emi,[f.key]:+e.target.value})} style={{ width:"100%", accentColor:"#4f46e5", background:"transparent", border:"none", padding:0 }} />
              </div>
            ))}
          </div>
          <div style={{ background:"linear-gradient(135deg,#1a0d0d,#0a0a0f)", border:"1px solid #401a1a", borderRadius:16, padding:18, marginBottom:14 }}>
            <div style={{ fontSize:12, color:"#f87171", marginBottom:8 }}>MONTHLY EMI</div>
            <div className="mono" style={{ fontSize:32, fontWeight:700, letterSpacing:"-1px", color:"#fca5a5" }}>{fmtShort(emiResult.emi)}</div>
            <div style={{ display:"flex", gap:20, marginTop:14 }}>
              <div><div style={{ fontSize:11, color:"#666" }}>Principal</div><div className="mono" style={{ fontSize:15, fontWeight:600 }}>{fmt(emi.principal)}</div></div>
              <div><div style={{ fontSize:11, color:"#666" }}>Total Interest</div><div className="mono red" style={{ fontSize:15, fontWeight:600 }}>{fmt(emiResult.interest)}</div></div>
            </div>
            <div style={{ background:"#2a1a1a", borderRadius:999, height:6, overflow:"hidden", marginTop:14 }}>
              <div style={{ width:`${(emi.principal/emiResult.total)*100}%`, height:"100%", background:"#3b82f6", borderRadius:999 }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
              <span style={{ fontSize:10, color:"#3b82f6" }}>Principal {Math.round((emi.principal/emiResult.total)*100)}%</span>
              <span style={{ fontSize:10, color:"#ef4444" }}>Interest {Math.round((emiResult.interest/emiResult.total)*100)}%</span>
            </div>
          </div>
          {emiResult.interest/emi.principal>0.5 && (
            <div style={{ background:"#1a0d00", border:"1px solid #4a2a00", borderRadius:12, padding:12, fontSize:13, color:"#fbbf24" }}>⚠️ You're paying {Math.round((emiResult.interest/emi.principal)*100)}% extra as interest. Consider a shorter tenure or larger down payment.</div>
          )}
        </div>
      )}
    </div>
  );
}

function MarketTab() {
  const [tab, setTab] = useState("gainers");
  return (
    <div className="fade-in">
      <div style={{ fontWeight:700, fontSize:18, marginBottom:16 }}>Market Snapshot</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        {[MARKET.nifty, MARKET.sensex].map((idx,i) => (
          <div key={i} className="card" style={{ background:"#0d1a0d", border:"1px solid #1a4020" }}>
            <div style={{ fontSize:11, color:"#888" }}>{i===0?"NIFTY 50":"BSE SENSEX"}</div>
            <div className="mono" style={{ fontSize:20, fontWeight:700, color:"#e8e8f0", marginTop:4 }}>{idx.value.toLocaleString("en-IN")}</div>
            <div className="green" style={{ fontSize:12, fontWeight:600, marginTop:2 }}>▲ {idx.change}% (+{idx.points.toFixed(1)})</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:16 }}>
        <div style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 6px #22c55e", animation:"pulse 2s infinite" }} />
        <span style={{ fontSize:12, color:"#888" }}>Live · NSE · Apr 28, 2026 · 3:24 PM</span>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {["gainers","losers"].map(t => (
          <button key={t} className="btn" onClick={() => setTab(t)} style={{ flex:1, padding:"8px", borderRadius:10, background:tab===t?(t==="gainers"?"#0d2a0d":"#2a0d0d"):"#13131f", border:`1px solid ${tab===t?(t==="gainers"?"#1a5020":"#501a1a"):"#2a2a3e"}`, color:tab===t?(t==="gainers"?"#4ade80":"#f87171"):"#666", fontWeight:600, fontSize:13 }}>
            {t==="gainers"?"▲ Top Gainers":"▼ Top Losers"}
          </button>
        ))}
      </div>

      {(tab==="gainers"?MARKET.topGainers:MARKET.topLosers).map(s => (
        <div key={s.name} className="card" style={{ marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px" }}>
          <div>
            <div style={{ fontWeight:600, fontSize:14 }}>{s.name}</div>
            <div className="mono" style={{ fontSize:13, color:"#888", marginTop:2 }}>₹{s.price.toLocaleString("en-IN")}</div>
          </div>
          <div style={{ background:s.change>0?"#0d2a0d":"#2a0d0d", border:`1px solid ${s.change>0?"#1a5020":"#501a1a"}`, borderRadius:8, padding:"4px 10px", fontWeight:700, fontSize:13, color:s.change>0?"#4ade80":"#f87171" }}>
            {s.change>0?"+":""}{s.change}%
          </div>
        </div>
      ))}

      <div style={{ fontWeight:600, fontSize:14, margin:"16px 0 10px" }}>Sector Performance</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {[{name:"Fintech",change:+2.8},{name:"IT / AI",change:+1.9},{name:"EV Energy",change:+3.1},{name:"Healthcare",change:+0.7},{name:"FMCG",change:-0.4},{name:"Defence",change:+1.2}].map(s => (
          <div key={s.name} style={{ background:s.change>0?"#0d2a0d":"#2a0d0d", border:`1px solid ${s.change>0?"#1a4020":"#401a1a"}`, borderRadius:12, padding:"12px 14px" }}>
            <div style={{ fontSize:12, color:"#aaa" }}>{s.name}</div>
            <div className="mono" style={{ fontSize:17, fontWeight:700, color:s.change>0?"#22c55e":"#ef4444", marginTop:3 }}>{s.change>0?"+":""}{s.change}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
