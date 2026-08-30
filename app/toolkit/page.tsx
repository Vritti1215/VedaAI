"use client";
import {useEffect,useState} from "react";
import {ArrowRight,BookOpen,Brain,Check,FileQuestion,Lightbulb,Loader2,MessageSquareText,Sparkles,Target, WandSparkles} from "lucide-react";
import {useRouter} from "next/navigation";
import {AppSidebar} from "../../components/AppSidebar";
import type {User} from "../../lib_types";

type Tool={id:string;title:string;description:string;icon:any};
const tools:Tool[]=[
 {id:"questions",title:"Question Paper Generator",description:"Create balanced questions by topic, marks and difficulty.",icon:FileQuestion},
 {id:"lesson",title:"Lesson Plan Generator",description:"Build a structured, classroom-ready lesson plan.",icon:BookOpen},
 {id:"explain",title:"Question Explainer",description:"Turn a difficult question into a simple teacher-friendly explanation.",icon:Lightbulb},
 {id:"worksheet",title:"Worksheet Generator",description:"Generate practice questions with an optional answer key.",icon:Target},
 {id:"insights",title:"Student Insights",description:"Summarise strengths, weak areas and recurring mistakes.",icon:Brain},
 {id:"chat",title:"AI Teacher Chat",description:"Ask teaching, assessment or classroom-planning questions.",icon:MessageSquareText},
];

export default function Toolkit(){
 const router=useRouter(); const [user,setUser]=useState<User|null>(null); const [selected,setSelected]=useState("questions"); const [topic,setTopic]=useState(""); const [level,setLevel]=useState("Class 10"); const [difficulty,setDifficulty]=useState("Mixed"); const [marks,setMarks]=useState("20"); const [prompt,setPrompt]=useState(""); const [result,setResult]=useState(""); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/auth/me").then(r=>r.json()).then(d=>{if(!d.user)router.replace("/login");else setUser(d.user)})},[router]);
 if(!user)return <div className="centerLoader"><Loader2 className="spin"/></div>;
 const active=tools.find(t=>t.id===selected)!;
 async function generate(){setLoading(true);setError("");setResult("");try{const r=await fetch("/api/toolkit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tool:selected,topic,level,difficulty,marks,prompt})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Generation failed");setResult(d.result||"")}catch(e){setError(e instanceof Error?e.message:"Generation failed") }finally{setLoading(false)}}
 async function logout(){await fetch("/api/auth/logout",{method:"POST"});router.replace("/login")}
 return <div className="shell"><AppSidebar user={user} onLogout={logout}/><main className="main"><header className="topbar"><div className="crumb">VedaAI <b>/ AI Teacher's Toolkit</b></div><div className="avatar">{user.name.slice(0,1).toUpperCase()}</div></header><div className="content dashboardContent">
  <div className="dashboardHero"><div><div className="eyebrow">AI Teacher's Toolkit</div><h1 className="titleLeft">Your AI teaching workspace</h1><p className="subtitleLeft">Create teaching material, explain concepts and turn assessment data into useful classroom actions.</p></div></div>
  <div className="toolkitGrid">{tools.map(t=>{const Icon=t.icon;return <button key={t.id} className={`toolkitCard ${selected===t.id?"selected": ""}`} onClick={()=>{setSelected(t.id);setResult("")}}><span className="toolIcon"><Icon size={19}/></span><div><b>{t.title}</b><span>{t.description}</span></div><ArrowRight size={15}/></button>})}</div>
  <section className="toolWorkspace"><div className="workspaceHead"><div><span className="workspaceIcon"><WandSparkles size={16}/></span><div><b>{active.title}</b><small>{active.description}</small></div></div><span className="aiPill"><Sparkles size={12}/> Gemini AI</span></div>
   <div className="toolForm"><label>Topic / subject<input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Photosynthesis, Linear Equations, Statistics"/></label><div className="formGrid"><label>Class<select value={level} onChange={e=>setLevel(e.target.value)}><option>Class 6</option><option>Class 7</option><option>Class 8</option><option>Class 9</option><option>Class 10</option><option>Class 11</option><option>Class 12</option></select></label><label>Difficulty<select value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option>Easy</option><option>Mixed</option><option>Medium</option><option>Hard</option></select></label><label>Marks / size<input value={marks} onChange={e=>setMarks(e.target.value)} placeholder="20"/></label></div><label>Additional instructions<textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Add any special instructions for the AI..." rows={4}/></label><button className="primaryInline generateBtn" onClick={generate} disabled={loading}>{loading?<><Loader2 size={15} className="spin"/> Generating...</>:<><Sparkles size={15}/> Generate with AI</>}</button></div>
   {error&&<div className="error">{error}</div>}{result&&<div className="toolResult"><div className="resultHead"><b><Check size={14}/> Generated result</b><button onClick={()=>navigator.clipboard?.writeText(result)}>Copy</button></div><pre>{result}</pre></div>}
  </section>
 </div></main></div>
}
