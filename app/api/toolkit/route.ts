import {NextRequest,NextResponse} from "next/server";
import {GoogleGenAI} from "@google/genai";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 try{
  const key=process.env.GEMINI_API_KEY;if(!key)return NextResponse.json({error:"GEMINI_API_KEY is missing. Add it to .env.local."},{status:500});
  const {tool,topic,level,difficulty,marks,prompt}=await req.json();
  const names:any={questions:"Question Paper Generator",lesson:"Lesson Plan Generator",explain:"Question Explainer",worksheet:"Worksheet Generator",insights:"Student Insights",chat:"AI Teacher Chat"};
  const task:any={
   questions:`Create a high-quality question paper for ${level}. Topic: ${topic||"general syllabus"}. Difficulty: ${difficulty}. Target size/marks: ${marks}. Include a clear title, sections, marks per question and a concise answer key. Keep numbering clean and do not invent syllabus-specific claims.`,
   lesson:`Create a classroom-ready lesson plan for ${level}. Topic: ${topic||"the selected subject"}. Include learning objectives, prerequisite knowledge, a timed lesson flow, teacher activities, student activities, formative assessment and homework.`,
   explain:`Explain ${topic||"the requested concept"} for a teacher working with ${level} students. Give a simple explanation, a worked example, common misconceptions and 3 quick checks for understanding.`,
   worksheet:`Create a printable practice worksheet for ${level} on ${topic||"the selected topic"}. Difficulty: ${difficulty}. Size/marks: ${marks}. Include varied question types and then an answer key.`,
   insights:`Provide a teacher-friendly framework for analysing student performance in ${topic||"an assessment"}. Explain how to identify strengths, weak areas, recurring mistakes and targeted next steps. Do not claim to have seen student data that was not supplied.`,
   chat:`Act as an AI teaching assistant for a ${level} teacher. Answer the user's request clearly and practically. User request: ${topic||prompt||"Help me plan an effective lesson."}`
  };
  const extra=prompt?` Additional instructions: ${prompt}`:"";
  const ai=new GoogleGenAI({apiKey:key});
  const response=await ai.models.generateContent({model:"gemini-3.6-flash",contents:[{role:"user",parts:[{text:`You are VedaAI's ${names[tool]}. ${task[tool]}${extra} Return polished plain text suitable for a teacher UI. Avoid markdown tables unless useful.`}]}],config:{temperature:.4}});
  return NextResponse.json({result:response.text||"No result generated."});
 }catch(e){console.error(e);return NextResponse.json({error:e instanceof Error?e.message:"AI generation failed."},{status:500})}
}
