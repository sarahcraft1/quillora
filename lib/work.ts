export type Author = { given?: string; family?: string; name?: string; suffix?: string };
export type Article = { id: string; title: string; authors: string[]; authorDetails?: Author[]; year?: number; journal: string; url: string; abstract: string; free: boolean; volume?: string; issue?: string; pages?: string; articleNumber?: string; searchQuery?: string };
export type ChecklistItem = { id: string; text: string; complete: boolean };
export type Assignment = { id: string; name: string; question: string; rubric: string; requirements: string; checklist?: ChecklistItem[]; sources: Article[] };
export type Work = { saved: Article[]; assignments: Assignment[] };
export const STORAGE_KEY = 'quillora-work';
export const MAX_BACKUP_BYTES = 10_000_000;
const string = (v: unknown): v is string => typeof v === 'string';
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export function doiKey(id: string) { let value=id.trim().replace(/^doi:\s*/i,'');if(/^https?:\/\/(?:dx\.)?doi\.org\//i.test(value)){value=value.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i,'');try{value=decodeURIComponent(value);}catch{}}return value.toLowerCase(); }
export function articleUrl(id: string) { return 'https://doi.org/' + doiKey(id).split('/').map(encodeURIComponent).join('/'); }
function article(v: unknown): Article {
  if (!object(v) || !string(v.id) || !/^10\.\d{4,9}\/\S+$/i.test(doiKey(v.id)) || !string(v.title) || !Array.isArray(v.authors) || !v.authors.every(string) || !string(v.journal) || !string(v.abstract) || (v.year !== undefined && (!Number.isInteger(v.year) || Number(v.year) < 1000 || Number(v.year) > 3000))) throw Error('A source in this backup is invalid. Nothing was imported.');
  const a: Article = {id: doiKey(v.id), title:v.title, authors:v.authors, journal:v.journal, abstract:v.abstract, url:articleUrl(v.id), free:false};
  if (typeof v.year === 'number') a.year=v.year;
  for (const key of ['volume','issue','pages','articleNumber','searchQuery'] as const) if(string(v[key])) a[key]=v[key];
  if (v.authorDetails !== undefined) {
    if (!Array.isArray(v.authorDetails) || !v.authorDetails.every(a=>object(a) && Object.values(a).every(string))) throw Error('Invalid author details. Nothing was imported.');
    a.authorDetails=v.authorDetails.map(a=>Object.fromEntries(['given','family','name','suffix'].filter(k=>typeof a[k]==='string').map(k=>[k,a[k]]))); 
  }
  return a;
}
export function parseWork(input: unknown): Work {
  if (!object(input) || (input.version !== undefined && input.version !== 1) || !Array.isArray(input.saved) || !Array.isArray(input.assignments)) throw Error('Choose a valid Quillora backup (version 1). Nothing was imported.');
  const ids=new Set<string>();
  return {saved: unique(input.saved.map(article)), assignments:input.assignments.map((a,i)=>{
    if(!object(a)||!['name','question','rubric','requirements'].every(k=>string(a[k]))||!Array.isArray(a.sources))throw Error('An assignment in this backup is invalid. Nothing was imported.');
    const id=string(a.id)&&a.id ? a.id : 'legacy-'+i;
    if(ids.has(id))throw Error('Duplicate assignment IDs in backup. Nothing was imported.'); ids.add(id);
    const result:Assignment={id,name:a.name as string,question:a.question as string,rubric:a.rubric as string,requirements:a.requirements as string,sources:unique(a.sources.map(article))};
    if(a.checklist!==undefined){if(!Array.isArray(a.checklist)||!a.checklist.every(c=>object(c)&&string(c.id)&&!!c.id&&string(c.text)&&!!c.text.trim()&&typeof c.complete==='boolean')||new Set(a.checklist.map(c=>c.id)).size!==a.checklist.length)throw Error('Invalid checklist progress. Nothing was imported.');
      const lines=requirementLines(result.requirements);if(a.checklist.length!==lines.length||a.checklist.some((c,i)=>c.text!==lines[i]))throw Error('Checklist does not match its assignment requirements. Nothing was imported.');
      result.checklist=a.checklist.map(c=>({id:c.id,text:c.text,complete:c.complete}));}
    return result;
  })};
}
export function unique(sources: Article[]) { return sources.filter((a,i)=>sources.findIndex(b=>doiKey(b.id)===doiKey(a.id))===i); }
export function mergeWork(existing: Work, incoming: Work): Work {
  const assignments=existing.assignments.map(a=>({...a,sources:[...a.sources]}));
  for(const a of incoming.assignments){const same=assignments.find(b=>b.id===a.id);if(!same){assignments.push(a);continue;}
    if(['name','question','rubric','requirements'].every(k=>a[k as keyof Assignment]===same[k as keyof Assignment])&&checklistSignature(a)===checklistSignature(same)) same.sources=unique([...same.sources,...a.sources]);
    else {const copy=assignments.find(b=>b.name===a.name+' (imported copy)'&&b.question===a.question&&b.rubric===a.rubric&&b.requirements===a.requirements&&checklistSignature(b)===checklistSignature(a));if(copy)copy.sources=unique([...copy.sources,...a.sources]);else assignments.push({...a,id:crypto.randomUUID(),name:a.name+' (imported copy)'});}
  }
  return {saved:unique([...existing.saved,...incoming.saved,...incoming.assignments.flatMap(a=>a.sources)]),assignments};
}
export function toggleSource(work: Work, a: Article, assignmentId: string|null): Work {
  const exists=work.saved.some(s=>doiKey(s.id)===doiKey(a.id));
  return {saved:exists?work.saved.filter(s=>doiKey(s.id)!==doiKey(a.id)):[...work.saved,a],assignments:work.assignments.map(x=>({...x,sources:exists?x.sources.filter(s=>doiKey(s.id)!==doiKey(a.id)):x.id===assignmentId?unique([...x.sources,a]):x.sources}))};
}
export function linkSource(work:Work,a:Article,assignmentId:string):Work{return {...work,saved:unique([...work.saved,a]),assignments:work.assignments.map(x=>x.id===assignmentId?{...x,sources:unique([...x.sources,a])}:x)}}
export function extractRequirements(text:string,question:string){const parts:string[]=[];const count=text.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:(?:scholarly|academic|peer[- ]reviewed|journal)\s+){0,3}(?:sources?|articles?)\b/i);if(count)parts.push('Source count mentioned (check minimum/exact wording): '+count[1]);const dates=text.match(/[^.!?\n]*(?:publish(?:ed|ication)|last\s+\w+\s+years|past\s+\w+\s+years)[^.!?\n]*/gi);if(dates)parts.push('Publication-date wording: '+dates.map(s=>s.trim()).join('; '));const styles=text.match(/\b(APA|MLA|Chicago)\b/gi);if(styles)parts.push('Citation style mentioned: '+[...new Set(styles.map(s=>s.toUpperCase()))].join(', '));const review=text.match(/[^.!?\n]*peer[- ]review[^.!?\n]*/gi);if(review)parts.push('Peer-review wording: '+review.map(s=>s.trim()).join('; '));const topic=text.match(/(?:topic|research question)\s*:\s*([^\n]+)/i)?.[1];if(topic||question)parts.push('Topic / research question: '+(topic||question));return parts.length?parts.join('\n'):'No explicit requirements recognized. Add only requirements stated in your rubric.';}

export function requirementLines(requirements:string){return requirements.split(/\r?\n/).map(s=>s.trim()).filter(s=>s && !s.startsWith('No explicit requirements recognized.'));}
export function getChecklist(a:Assignment):ChecklistItem[]{return a.checklist||requirementLines(a.requirements).map((text,i)=>({id:'requirement-'+i,text,complete:false}));}
export function reconcileChecklist(requirements:string,previous:ChecklistItem[]=[]):ChecklistItem[]{const used=new Set<string>();return requirementLines(requirements).map(text=>{const old=previous.find(c=>c.text===text&&!used.has(c.id));if(old){used.add(old.id);return {...old};}return {id:crypto.randomUUID(),text,complete:false};});}
function checklistSignature(a:Assignment){return JSON.stringify(getChecklist(a).map(c=>({text:c.text,complete:c.complete})));}
export function setRequirementComplete(work:Work,assignmentId:string,itemId:string,complete:boolean):Work{return {...work,assignments:work.assignments.map(a=>a.id===assignmentId?{...a,checklist:getChecklist(a).map(c=>c.id===itemId?{...c,complete}:c)}:a)};}
export function updateAssignment(a:Assignment,question:string,rubric:string,requirements:string):Assignment{return {...a,question,rubric,requirements,checklist:reconcileChecklist(requirements,getChecklist(a))};}
