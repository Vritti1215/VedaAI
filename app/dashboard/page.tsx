"use client";
import {useEffect,useState} from "react";
import {Activity,ArrowRight,BookOpen,ClipboardList,FileText,Loader2,Plus,Sparkles} from "lucide-react";
import {useRouter} from "next/navigation";
import {AppSidebar} from "../../components/AppSidebar";
import type {User} from "../../lib_types";

type A={id:string;name:string;questions:number;createdAt:string;questionFiles?:string[];answerFiles?:string[]};
export default function Dashboard(){
 const router=useRouter(); const [user,setUser]=useState<User|null>(null); const [items,setItems]=useState<A[]>([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{fetch("/api/auth/me").then(r=>r.json()).then(d=>{if(!d.user)router.replace("/login");else setUser(d.user);}).finally(()=>setLoading(false)); setItems(JSON.parse(localStorage.getItem("veda_history")||"[]"));},[router]);
 async function logout(){await fetch("/api/auth/logout",{method:"POST"});router.replace("/login")}
 if(loading||!user)return <div className="centerLoader"><Loader2 className="spin"/></div>;
 const answered=items.length;
 return <div className="shell"><AppSidebar user={user} onLogout={logout}/><main className="main"><header className="topbar"><div className="crumb">VedaAI <b>/ Home</b></div><div className="avatar">{user.name.slice(0,1).toUpperCase()}</div></header><div className="content dashboardContent">
  <div className="dashboardHero"><div><div className="eyebrow">Teacher workspace</div><h1 className="titleLeft">Good to see you, {user.name.split(" ")[0]}</h1><p className="subtitleLeft">Manage exams, analyse answer sheets and review AI-powered feedback.</p></div><button className="primaryInline" onClick={()=>router.push("/")}><Plus size={15}/> New Analysis</button></div>
  <div className="statsGrid"><div className="statCard"><div><span>Total analyses</span><b>{items.length}</b></div><ClipboardList/></div><div className="statCard"><div><span>Questions processed</span><b>{items.reduce((n,x)=>n+(x.questions||0),0)}</b></div><FileText/></div><div className="statCard"><div><span>AI workspace</span><b>Ready</b></div><Sparkles/></div></div>
  <div className="dashboardGrid"><section className="dashboardCard"><div className="sectionHead"><div><b>Recent analyses</b><span>Your latest assessment workspaces</span></div><button onClick={()=>router.push("/history")}>View all <ArrowRight size={13}/></button></div>{!items.length?<div className="dashEmpty"><Activity size={22}/><b>No analyses yet</b><span>Start a new analysis to see results here.</span><button onClick={()=>router.push("/")}>Start analysis</button></div>:items.slice(0,5).map(x=><button className="recentRow" key={x.id} onClick={()=>{const data=localStorage.getItem(`veda_analysis_${x.id}`);if(data){localStorage.setItem("veda_current",data);router.push("/")}else router.push("/history")}}><FileText size={17}/><div><b>{x.name}</b><span>{x.questions} questions • {new Date(x.createdAt).toLocaleString()}</span></div><ArrowRight size={14}/></button>)}</section>
  <section className="dashboardCard"><div className="sectionHead"><div><b>Quick actions</b><span>Jump directly to a workspace</span></div></div><button className="actionTile" onClick={()=>router.push("/")}><Plus/><div><b>Create analysis</b><span>Upload a question paper and answer sheet.</span></div><ArrowRight/></button><button className="actionTile" onClick={()=>router.push("/exams")}><BookOpen/><div><b>Manage exams</b><span>Organise your exam-specific workflows.</span></div><ArrowRight/></button><button className="actionTile" onClick={()=>router.push("/library")}><FileText/><div><b>Open library</b><span>Review files used in previous analyses.</span></div><ArrowRight/></button></section></div>
 </div></main></div>
}
