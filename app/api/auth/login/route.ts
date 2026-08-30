import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
const g=globalThis as typeof globalThis & {__vedaUsers?:Map<string,any>;__vedaSessions?:Map<string,string>};
g.__vedaUsers ??= new Map(); g.__vedaSessions ??= new Map();
export async function POST(req:NextRequest){
 try{const {email,password}=await req.json();const e=String(email||"").trim().toLowerCase();const u=g.__vedaUsers.get(e);if(!u||crypto.scryptSync(String(password||""),u.salt,64).toString("hex")!==u.passwordHash)return NextResponse.json({error:"Invalid email or password."},{status:401});const t=crypto.randomBytes(32).toString("hex");g.__vedaSessions.set(t,u.id);const r=NextResponse.json({user:{id:u.id,name:u.name,email:u.email}});r.cookies.set("veda_session",t,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:604800});return r;}catch{return NextResponse.json({error:"Unable to sign in."},{status:500});}}
