import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const maxDuration = 120;

type Region={page:number;x:number;y:number;width:number;height:number};

const schema = {
  type:"object",
  properties:{
    questions:{type:"array",items:{type:"object",properties:{
      id:{type:"string"},number:{type:"string"},text:{type:"string"},marks:{type:"number"},
      answerId:{type:["string","null"]},
      status:{type:"string",enum:["answered","unanswered","unmatched"]},
      regions:{type:"array",items:{type:"object",properties:{
        page:{type:"integer"},x:{type:"number"},y:{type:"number"},width:{type:"number"},height:{type:"number"}
      },required:["page","x","y","width","height"]}},
      feedback:{type:"string"},score:{type:"number"},maxScore:{type:"number"}
    },required:["id","number","text","status","regions"]}},
    unmatchedAnswers:{type:"array",items:{type:"object",properties:{
      text:{type:"string"},regions:{type:"array",items:{type:"object",properties:{
        page:{type:"integer"},x:{type:"number"},y:{type:"number"},width:{type:"number"},height:{type:"number"}
      },required:["page","x","y","width","height"]}}
    },required:["text","regions"]}}
  },
  required:["questions","unmatchedAnswers"]
};

async function toPart(file:File){
 const buf=Buffer.from(await file.arrayBuffer());
 return {inlineData:{mimeType:file.type||"application/octet-stream",data:buf.toString("base64")}};
}

export async function POST(req:NextRequest){
 try{
  const key=process.env.GEMINI_API_KEY;
  if(!key)return NextResponse.json({error:"GEMINI_API_KEY is missing. Add it to .env.local."},{status:500});
  const form=await req.formData();
  const qFiles=form.getAll("questionFiles").filter(x=>x instanceof File) as File[];
  const aFiles=form.getAll("answerFiles").filter(x=>x instanceof File) as File[];
  if(!qFiles.length||!aFiles.length)return NextResponse.json({error:"Upload both a question paper and an answer sheet."},{status:400});
  const total=[...qFiles,...aFiles].reduce((s,f)=>s+f.size,0);
  if(total>45*1024*1024)return NextResponse.json({error:"The combined upload is too large. Please use smaller/compressed files (under about 45 MB total)."}, {status:413});

  const ai=new GoogleGenAI({apiKey:key});
  const parts:any[]=[];
  parts.push({text:`You are an expert assessment-document parser. The user uploaded QUESTION PAPER files first, then ANSWER SHEET files.

TASK:
1. Extract EVERY printed question from the question paper in its original printed order.
2. Preserve exact labels, including subparts such as 11(a), 11(b), 12(i), etc. Treat each labelled subpart as its own question.
3. Extract the student's handwritten answers from the answer-sheet pages.
4. Match answers to questions by question label first, then by semantic content when the label is missing/unclear. Never assume page/order means the same question.
5. Answers can be out of order and can span pages.
6. If no answer is found, mark the question unanswered and use an empty regions array.
7. If an answer clearly cannot be matched to any question, put it in unmatchedAnswers.
8. For each mapped answer, return EVERY rectangular region containing the answer. If an answer spans pages, include regions for all pages.
9. Coordinates MUST be normalized from 0 to 1 relative to the full original answer-sheet page/image: x=left, y=top, width, height.
10. Do not use coordinates from the question paper. Regions are ONLY on answer-sheet pages.
11. For handwritten answers, include the complete written answer, including diagrams/equations that belong to that answer. Do not include unrelated neighboring answers.
12. Be conservative: if a region cannot be located reliably, return no region rather than inventing a location.
13. Marks and grading are optional. If marks are visible, preserve them. If grading is possible, give a concise score and feedback; otherwise omit score.

IMPORTANT OUTPUT:
Return ONLY JSON matching the supplied schema. Do not add markdown.`});
  for(const f of qFiles)parts.push({text:`QUESTION PAPER FILE: ${f.name}`},await toPart(f));
  for(const f of aFiles)parts.push({text:`ANSWER SHEET FILE: ${f.name}`},await toPart(f));

  const response=await ai.models.generateContent({
    model:"gemini-3.6-flash",
    contents:[{role:"user",parts}],
    config:{responseMimeType:"application/json",responseSchema:schema,temperature:0}
  });
  const text=response.text||"";
  const data=JSON.parse(text);
  const pages=[];
  for(const f of aFiles){
    const bytes=Buffer.from(await f.arrayBuffer());
    pages.push({
      name:f.name,
      type:f.type,
      url:`data:${f.type};base64,${bytes.toString("base64")}`
    });
  }
  return NextResponse.json({...data,pages});
 }catch(e){
  console.error(e);
  return NextResponse.json({error:e instanceof Error?e.message:"AI analysis failed."},{status:500});
 }
}
