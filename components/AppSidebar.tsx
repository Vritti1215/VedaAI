"use client";
import {BookOpen, ClipboardList, Home, Library, LogOut, Plus, Settings, Sparkles} from "lucide-react";
import {usePathname, useRouter} from "next/navigation";
import type {User} from "../lib_types";

export function AppSidebar({user,onLogout}:{user:User;onLogout?:()=>void}){
 const router=useRouter(); const pathname=usePathname();
 const go=(path:string)=>router.push(path);
 const items=[
  {label:"Home",path:"/dashboard",icon:Home,description:"Overview & recent activity"},
  {label:"My Analyses",path:"/history",icon:ClipboardList,description:"Previous AI assessment reports"},
  {label:"Exams",path:"/exams",icon:BookOpen,description:"Create and manage exam workspaces"},
  {label:"My Library",path:"/library",icon:Library,description:"Uploaded papers and answer sheets"},
  {label:"Settings",path:"/settings",icon:Settings,description:"Profile and app preferences"},
 ];
 return <aside className="sidebar">
  <button className="logo logoButton" onClick={()=>go("/dashboard")} aria-label="Go to Home"><div className="logoMark">V</div>VedaAI</button>
  <button className="newBtn" onClick={()=>go("/")}><Plus size={15}/> New Analysis</button>
  <button className="toolkitBtn" onClick={()=>go("/toolkit")}><Sparkles size={15}/> AI Teacher's Toolkit</button>
  <nav className="nav" aria-label="Main navigation">
   {items.map(({label,path,icon:Icon,description})=> <button key={path} className={pathname===path?"active":""} onClick={()=>go(path)} title={description}><Icon size={16}/><span>{label}</span></button>)}
  </nav>
  <div className="school"><strong>{user.name}</strong><span>{user.email}</span><button className="logout" onClick={onLogout}><LogOut size={13}/> Logout</button></div>
 </aside>
}
