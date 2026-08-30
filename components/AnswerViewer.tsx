"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Region={page:number;x:number;y:number;width:number;height:number};
type PageSource={name:string;url:string;type?:string};

export function AnswerViewer({pages,regions,questionNumber}:{pages:PageSource[];regions:Region[];questionNumber?:string}){
  const host=useRef<HTMLDivElement>(null);
  const [showAll,setShowAll]=useState(false);
  const relevantPages=useMemo(()=>{
    if(showAll || !regions.length) return pages.map((_,i)=>i+1);
    return Array.from(new Set(regions.map(r=>r.page))).sort((a,b)=>a-b);
  },[pages,regions,showAll]);
  useEffect(()=>{
    if(!showAll && regions.length && host.current){
      const first=host.current.querySelector(`[data-answer-page="${regions[0].page}"]`) as HTMLElement|null;
      if(first) setTimeout(()=>first.scrollIntoView({behavior:"smooth",block:"center"}),80);
    }
  },[showAll,regions]);
  return <div ref={host} className="answerViewerHost">
    {regions.length>0 && <div className="answerFocusBar"><div><b>Q{questionNumber}</b><span>{regions.length>1?`${regions.length} answer regions`:'Answer location'} • shown automatically</span></div><button onClick={()=>setShowAll(v=>!v)}>{showAll?"Show answer only":"Show all pages"}</button></div>}
    {pages.map((p,i)=>{const page=i+1;if(!relevantPages.includes(page))return null;return <Source key={`${p.url}-${i}`} source={p} index={i} regions={regions} questionNumber={questionNumber}/>})}
    {!regions.length&&<div className="noRegion"><div>No answer region was confidently mapped for this question.</div><span>The answer sheet is shown from page 1.</span></div>}
  </div>
}

function Source({source,index,regions,questionNumber}:{source:PageSource;index:number;regions:Region[];questionNumber?:string}){
  const isPdf=source.type==="application/pdf" || source.name.toLowerCase().endsWith(".pdf");
  if(isPdf) return <PdfViewer source={source} regions={regions} questionNumber={questionNumber}/>;
  const pageNumber=index+1;
  const regs=regions.filter(r=>r.page===pageNumber);
  return <div className="pageWrap" data-answer-page={pageNumber}>
    <div className="pageBadge">Page {pageNumber}{regs.length?` • Q${questionNumber}`:""}</div>
    <div style={{position:"relative",lineHeight:0}}>
      <img className="pageImg" src={source.url} alt={`Answer sheet page ${pageNumber}`}/>
      {regs.map((r,j)=><RegionBox key={j} region={r}/>) }
    </div>
  </div>
}

function PdfViewer({source,regions,questionNumber}:{source:PageSource;regions:Region[];questionNumber?:string}){
 const host=useRef<HTMLDivElement>(null);
 const [error,setError]=useState("");
 useEffect(()=>{
   let cancelled=false, task:any=null;
   (async()=>{
     try{
       const pdfjs:any=await import(/* webpackIgnore: true */ "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs");
       pdfjs.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
       task=pdfjs.getDocument(source.url);
       const pdf=await task.promise;
       if(cancelled||!host.current)return;
       host.current.innerHTML="";
       const relevant=new Set(regions.length?regions.map(r=>r.page):[1]);
       for(let n=1;n<=pdf.numPages;n++){
         if(cancelled)return;
         if(!relevant.has(n)) continue;
         const page=await pdf.getPage(n);
         const base=page.getViewport({scale:1});
         const maxWidth=Math.min(720, host.current.clientWidth||720);
         const viewport=page.getViewport({scale:maxWidth/base.width});
         const wrap=document.createElement("div"); wrap.className="pageWrap"; wrap.dataset.answerPage=String(n);
         const badge=document.createElement("div"); badge.className="pageBadge";
         const regs=regions.filter(r=>r.page===n);
         badge.textContent=`Page ${n}${regs.length?` • Q${questionNumber}`:""}`; wrap.appendChild(badge);
         const stage=document.createElement("div"); stage.style.position="relative"; stage.style.lineHeight="0";
         const canvas=document.createElement("canvas"); canvas.width=Math.ceil(viewport.width); canvas.height=Math.ceil(viewport.height); canvas.style.width="100%"; canvas.style.height="auto";
         stage.appendChild(canvas);
         regs.forEach(r=>{const box=document.createElement("div");box.className="highlight";Object.assign(box.style,{left:`${r.x*100}%`,top:`${r.y*100}%`,width:`${r.width*100}%`,height:`${r.height*100}%`});stage.appendChild(box)});
         wrap.appendChild(stage); host.current.appendChild(wrap);
         await page.render({canvasContext:canvas.getContext("2d")!,viewport}).promise;
       }
       if(!cancelled && regions.length && host.current){
         const first=host.current.querySelector(`[data-answer-page="${regions[0].page}"]`) as HTMLElement|null;
         if(first) setTimeout(()=>first.scrollIntoView({behavior:"smooth",block:"center"}),80);
       }
     }catch(e:any){if(!cancelled)setError(e?.message||"Could not render PDF");}
   })();
   return()=>{cancelled=true;try{task?.destroy?.()}catch{}};
 },[source.url,regions,questionNumber]);
 return <>{error&&<div className="error">PDF viewer error: {error}</div>}<div ref={host}><div className="pageWrap" style={{padding:30,textAlign:"center"}}>Loading {source.name}…</div></div></>;
}
function RegionBox({region:r}:{region:Region}){return <div className="highlight" style={{left:`${r.x*100}%`,top:`${r.y*100}%`,width:`${r.width*100}%`,height:`${r.height*100}%`}}/>}
