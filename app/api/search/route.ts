import { NextResponse } from 'next/server';
import { normalizeCrossref } from '../../../lib/scholarly';
import { unique } from '../../../lib/work';
export async function GET(req:Request){
 const q=new URL(req.url).searchParams.get('q')?.trim();
 if(!q)return NextResponse.json({error:'Enter a topic to begin.'},{status:400});
 if(q.length>1000)return NextResponse.json({error:'Please shorten your research question to 1,000 characters.'},{status:400});
 try{
  const r=await fetch(`https://api.crossref.org/works?query=${encodeURIComponent(q)}&filter=type:journal-article&rows=24`,{cache:'no-store',headers:{'User-Agent':'Quillora/1.0 (scholarly discovery)'},signal:AbortSignal.timeout(18000)});
  if(!r.ok)throw Error('Discovery request failed');
  const data=await r.json();
  if(!Array.isArray(data?.message?.items))throw Error('Invalid discovery response');
  const articles=data.message.items.map(normalizeCrossref).filter(Boolean);
  if(data.message.items.length&&!articles.length)throw Error('No usable discovery records');
  return NextResponse.json({articles:unique(articles)});
 }catch{return NextResponse.json({error:'Crossref is unavailable right now. Please try your search again in a moment.'},{status:503});}
}
