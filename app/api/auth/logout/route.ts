import {NextRequest,NextResponse} from "next/server";
export async function POST(req:NextRequest){const g=globalThis as typeof globalThis & {__vedaSessions?:Map<string,string>};g.__vedaSessions?.delete(req.cookies.get("veda_session")?.value||"");const r=NextResponse.json({ok:true});r.cookies.set("veda_session","",{httpOnly:true,path:"/",maxAge:0});return r;}
