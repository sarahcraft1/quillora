import { NextResponse } from 'next/server';
import { articleUrl } from '../../../lib/work';
export async function GET(req:Request){
 const q=new URL(req.url).searchParams.get('q')?.trim();
 if(!q)return NextResponse.json({error:'Enter a topic to begin.'},{status:400});
 if(q.length>1000)return NextResponse.json({error:'Please shorten your research question to 1,000 characters.'},{status:400});
 try{
  const r=await fetch(`https://api.crossref.org/works?query=${encodeURIComponent(q)}&filter=type:journal-article&rows=24`,{headers:{'User-Agent':'Quillora/1.0 (scholarly discovery)'},signal:AbortSignal.timeout(18000)});
  if(!r.ok)throw Error();
  const data=await r.json();
  if(!Array.isArray(data?.message?.items))throw Error();
  return NextResponse.json({articles:data.message.items.filter((x:any)=>typeof x.DOI==='string'&&/^10\.\d{4,9}\/\S+$/i.test(x.DOI)).map((x:any)=>({
   id:x.DOI.toLowerCase(),title:clean(x.title?.[0]||'Untitled record'),authors:(x.author||[]).map((a:any)=>[a.given,a.family,a.suffix].filter(Boolean).join(' ')||a.name||'').filter(Boolean),
   authorDetails:(x.author||[]).map((a:any)=>({given:a.given,family:a.family,name:a.name,suffix:a.suffix})),
   year:(x['published-print']?.['date-parts']?.[0]||x.published?.['date-parts']?.[0]||x['published-online']?.['date-parts']?.[0]||[])[0],
   journal:clean(x['container-title']?.[0]||'Journal not listed'),url:articleUrl(x.DOI),abstract:clean(x.abstract||''),volume:x.volume,issue:x.issue,pages:x['article-number']===x.page?undefined:x.page,articleNumber:x['article-number'],free:false
  }))});
 }catch{return NextResponse.json({error:'Crossref is unavailable right now. Please try your search again in a moment.'},{status:503});}
}
function clean(text:string){return text.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();}
