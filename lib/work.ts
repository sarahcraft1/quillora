import {validCanvasReference,validCanvasAssignmentReference,type CanvasCourseReference,type CanvasAssignmentReference} from './canvas/types';
export type Author = { given?: string; family?: string; name?: string; suffix?: string };
export type Article = { id: string; title: string; authors: string[]; authorDetails?: Author[]; year?: number; journal: string; url: string; abstract: string; free: boolean; volume?: string; issue?: string; pages?: string; articleNumber?: string; searchQuery?: string; savedAt?: string; publicationType?: string };
export type ChecklistItem = { id: string; text: string; complete: boolean };
export type Assignment = { id: string; name: string; question: string; rubric: string; requirements: string; notes?: string; checklist?: ChecklistItem[]; sources: Article[]; updatedAt?: string; lastOpenedAt?: string; classId?: string; pinned?: boolean; dueDate?: string; status?: 'active'|'completed'; research?: Research;canvas?:CanvasAssignmentReference };
export const CLASS_ICONS=['book','science','design','globe','code','language'] as const;
export type Course={id:string;name:string;code?:string;icon:typeof CLASS_ICONS[number];color:string;canvas?:CanvasCourseReference[]};
export type SourceNote={id:string;source:Article;text:string;category:'Summary'|'Key Finding'|'Quotation'|'Question'|'Personal Insight';location?:string;stance:'supporting'|'opposing'|'contextual';groupId?:string;updatedAt:string};
export type EvidenceGroup={id:string;name:string;requirementId?:string;question?:boolean};
export type Research={notes:SourceNote[];groups:EvidenceGroup[];reading:Record<string,'To Read'|'Reading'|'Reviewed'>};
export type Work = { saved: Article[]; assignments: Assignment[]; classes?:Course[] };
export function validDueDate(v:unknown):v is string{return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;}
function parseClassesBase(v:unknown):Course[]{if(!Array.isArray(v))throw Error('Invalid classes. Nothing was imported.');const ids=new Set<string>();return v.map(c=>{if(!c||typeof c!=='object'||!('id' in c)||typeof c.id!=='string'||!c.id||ids.has(c.id)||typeof c.name!=='string'||!c.name.trim()||!CLASS_ICONS.includes(c.icon)||!/^#[0-9a-f]{6}$/i.test(c.color)||(c.code!==undefined&&typeof c.code!=='string'))throw Error('Invalid class details. Nothing was imported.');ids.add(c.id);return {id:c.id,name:c.name,...(c.code?{code:c.code}:{}),icon:c.icon,color:c.color};});}
export function parseClasses(v:unknown):Course[]{return parseClassesBase(v).map((course,index)=>{const raw=(v as {canvas?:unknown}[])[index].canvas;if(raw===undefined)return course;if(!Array.isArray(raw)||!raw.every(validCanvasReference))throw Error('Invalid Canvas course metadata. Nothing was imported.');return {...course,canvas:raw.map(c=>({origin:c.origin,courseId:c.courseId,url:c.url}))};});}
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
  if(v.publicationType!==undefined){if(!string(v.publicationType))throw Error('Invalid publication type.');a.publicationType=v.publicationType;}
  if(validActivityDate(v.savedAt)) a.savedAt=v.savedAt;
  return a;
}
export function parseWork(input: unknown): Work {
  if (!object(input) || (input.version !== undefined && input.version !== 1) || !Array.isArray(input.saved) || !Array.isArray(input.assignments)) throw Error('Choose a valid Quillora backup (version 1). Nothing was imported.');
  const ids=new Set<string>();
  return {...(input.classes!==undefined?{classes:parseClasses(input.classes)}:{}),saved: unique(input.saved.map(article)), assignments:input.assignments.map((a,i)=>{
    if(!object(a)||!['name','question','rubric','requirements'].every(k=>string(a[k]))||!Array.isArray(a.sources))throw Error('An assignment in this backup is invalid. Nothing was imported.');
    const id=string(a.id)&&a.id ? a.id : 'legacy-'+i;
    if(ids.has(id))throw Error('Duplicate assignment IDs in backup. Nothing was imported.'); ids.add(id);
    const result:Assignment={id,name:a.name as string,question:a.question as string,rubric:a.rubric as string,requirements:a.requirements as string,sources:unique(a.sources.map(article))};
    if(a.notes!==undefined){if(!string(a.notes))throw Error('Invalid assignment notes. Nothing was imported.');result.notes=a.notes;}
    if(a.checklist!==undefined){if(!Array.isArray(a.checklist)||!a.checklist.every(c=>object(c)&&string(c.id)&&!!c.id&&string(c.text)&&!!c.text.trim()&&typeof c.complete==='boolean')||new Set(a.checklist.map(c=>c.id)).size!==a.checklist.length)throw Error('Invalid checklist progress. Nothing was imported.');
      const lines=requirementLines(result.requirements);if(a.checklist.length!==lines.length||a.checklist.some((c,i)=>c.text!==lines[i]))throw Error('Checklist does not match its assignment requirements. Nothing was imported.');
      result.checklist=a.checklist.map(c=>({id:c.id,text:c.text,complete:c.complete}));}
    if(validActivityDate(a.updatedAt))result.updatedAt=a.updatedAt;
    if(validActivityDate(a.lastOpenedAt))result.lastOpenedAt=a.lastOpenedAt;
    if(a.classId!==undefined){if(!string(a.classId))throw Error('Invalid assignment class.');result.classId=a.classId;}
    if(a.pinned!==undefined){if(typeof a.pinned!=='boolean')throw Error('Invalid assignment pin.');result.pinned=a.pinned;}
    if(a.dueDate!==undefined){if(!validDueDate(a.dueDate))throw Error('Invalid assignment due date.');result.dueDate=a.dueDate;}
    if(a.status!==undefined){if(a.status!=='active'&&a.status!=='completed')throw Error('Invalid assignment status.');result.status=a.status;}
    if(a.research!==undefined)result.research=parseResearch(a.research);
    if(a.canvas!==undefined){
      if(!validCanvasAssignmentReference(a.canvas))throw Error('Invalid Canvas assignment metadata. Nothing was imported.');
      const c=a.canvas;result.canvas={id:c.id,courseId:c.courseId,name:c.name,url:c.url,description:c.description,dueAt:c.dueAt,rubric:c.rubric.map(r=>({id:r.id,description:r.description,detail:r.detail,points:r.points})),origin:c.origin,timeZone:c.timeZone,syncedAt:c.syncedAt,localClassId:c.localClassId,...(c.submissionStatus?{submissionStatus:c.submissionStatus}:{})};
    }
    return result;
  })};
}
export function unique(sources: Article[]) { return sources.filter((a,i)=>sources.findIndex(b=>doiKey(b.id)===doiKey(a.id))===i); }
export function mergeWork(existing: Work, incoming: Work): Work {
  const assignments=existing.assignments.map(a=>({...a,sources:[...a.sources]}));
  const classes=(existing.classes||[]).map(c=>({...c,...(c.canvas?{canvas:[...c.canvas]}:{})}));const classMap=new Map<string,string>();
  const sameCourse=(a:Course,b:Course)=>['name','code','icon','color'].every(k=>a[k as keyof Course]===b[k as keyof Course]);
  const mergeReferences=(target:Course,incoming:Course)=>{if(incoming.canvas?.length)target.canvas=[...(target.canvas||[]),...incoming.canvas.filter(ref=>!target.canvas?.some(existing=>existing.origin===ref.origin&&existing.courseId===ref.courseId))];};
  for(const course of incoming.classes||[]){const same=classes.find(c=>c.id===course.id);if(!same){classes.push({...course});classMap.set(course.id,course.id);}else if(sameCourse(same,course)){mergeReferences(same,course);classMap.set(course.id,same.id);}else{const copy=classes.find(c=>sameCourse(c,course));const id=copy?.id||crypto.randomUUID();if(copy)mergeReferences(copy,course);else classes.push({...course,id});classMap.set(course.id,id);}}
  for(const original of incoming.assignments){const a={...original,...(original.classId?{classId:classMap.get(original.classId)||original.classId}:{}),...(original.canvas?{canvas:{...original.canvas,localClassId:classMap.get(original.canvas.localClassId)||original.canvas.localClassId}}:{})};const same=assignments.find(b=>b.id===a.id);if(!same){assignments.push(a);continue;}
    if(['name','question','rubric','requirements','classId','pinned','dueDate','status'].every(k=>a[k as keyof Assignment]===same[k as keyof Assignment])&&JSON.stringify(a.research||null)===JSON.stringify(same.research||null)&&canvasSignature(a)===canvasSignature(same)&&(a.notes||'')===(same.notes||'')&&checklistSignature(a)===checklistSignature(same)) same.sources=unique([...same.sources,...a.sources]);
    else {const copy=assignments.find(b=>['classId','pinned','dueDate','status'].every(k=>b[k as keyof Assignment]===a[k as keyof Assignment])&&b.name===a.name+' (imported copy)'&&b.question===a.question&&b.rubric===a.rubric&&b.requirements===a.requirements&&JSON.stringify(b.research||null)===JSON.stringify(a.research||null)&&canvasSignature(b)===canvasSignature(a)&&(b.notes||'')===(a.notes||'')&&checklistSignature(b)===checklistSignature(a));if(copy)copy.sources=unique([...copy.sources,...a.sources]);else assignments.push({...a,id:crypto.randomUUID(),name:a.name+' (imported copy)'});}
  }
  return {...(existing.classes!==undefined||incoming.classes!==undefined?{classes}:{}),saved:unique([...existing.saved,...incoming.saved,...incoming.assignments.flatMap(a=>a.sources)]),assignments};
}
export function toggleSource(work: Work, a: Article, assignmentId: string|null): Work {
  const exists=work.saved.some(s=>doiKey(s.id)===doiKey(a.id));
  return {...work,saved:exists?work.saved.filter(s=>doiKey(s.id)!==doiKey(a.id)):[...work.saved,a],assignments:work.assignments.map(x=>({...x,sources:exists?x.sources.filter(s=>doiKey(s.id)!==doiKey(a.id)):x.id===assignmentId?unique([...x.sources,a]):x.sources}))};
}
export function linkSource(work:Work,a:Article,assignmentId:string):Work{return {...work,saved:unique([...work.saved,a]),assignments:work.assignments.map(x=>x.id===assignmentId?{...x,sources:unique([...x.sources,a])}:x)}}
export function unlinkSource(work:Work,articleId:string,assignmentId:string):Work{return {...work,assignments:work.assignments.map(a=>a.id===assignmentId?{...a,sources:a.sources.filter(s=>doiKey(s.id)!==doiKey(articleId))}:a)};}
export function extractRequirements(text:string,question:string){const parts:string[]=[];const count=text.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:(?:scholarly|academic|peer[- ]reviewed|journal)\s+){0,3}(?:sources?|articles?)\b/i);if(count)parts.push('Source count mentioned (check minimum/exact wording): '+count[1]);const dates=text.match(/[^.!?\n]*(?:publish(?:ed|ication)|last\s+\w+\s+years|past\s+\w+\s+years)[^.!?\n]*/gi);if(dates)parts.push('Publication-date wording: '+dates.map(s=>s.trim()).join('; '));const styles=text.match(/\b(APA|MLA|Chicago)\b/gi);if(styles)parts.push('Citation style mentioned: '+[...new Set(styles.map(s=>s.toUpperCase()))].join(', '));const review=text.match(/[^.!?\n]*peer[- ]review[^.!?\n]*/gi);if(review)parts.push('Peer-review wording: '+review.map(s=>s.trim()).join('; '));const topic=text.match(/(?:topic|research question)\s*:\s*([^\n]+)/i)?.[1];if(topic||question)parts.push('Topic / research question: '+(topic||question));return parts.length?parts.join('\n'):'No explicit requirements recognized. Add only requirements stated in your rubric.';}

export function requirementLines(requirements:string){return requirements.split(/\r?\n/).map(s=>s.trim()).filter(s=>s && !s.startsWith('No explicit requirements recognized.'));}
export function getChecklist(a:Assignment):ChecklistItem[]{return a.checklist||requirementLines(a.requirements).map((text,i)=>({id:'requirement-'+i,text,complete:false}));}
export function reconcileChecklist(requirements:string,previous:ChecklistItem[]=[]):ChecklistItem[]{const used=new Set<string>();return requirementLines(requirements).map(text=>{const old=previous.find(c=>c.text===text&&!used.has(c.id));if(old){used.add(old.id);return {...old};}return {id:crypto.randomUUID(),text,complete:false};});}
function checklistSignature(a:Assignment){return JSON.stringify(getChecklist(a).map(c=>({text:c.text,complete:c.complete})));}
function canvasSignature(a:Assignment){const c=a.canvas;return JSON.stringify(c?[c.origin,c.courseId,c.id,c.url,c.name,c.description,c.dueAt,c.rubric.map(r=>[r.id,r.description,r.detail,r.points]),c.timeZone,c.syncedAt,c.localClassId,c.submissionStatus||null]:null);}
export function setRequirementComplete(work:Work,assignmentId:string,itemId:string,complete:boolean):Work{return {...work,assignments:work.assignments.map(a=>a.id===assignmentId?{...a,checklist:getChecklist(a).map(c=>c.id===itemId?{...c,complete}:c)}:a)};}
export function updateAssignment(a:Assignment,question:string,rubric:string,requirements:string,notes=a.notes,name=a.name):Assignment{return {...a,name,question,rubric,requirements,...(notes!==undefined?{notes}:{}),checklist:reconcileChecklist(requirements,getChecklist(a))};}

/** Optional activity metadata; legacy research remains valid without timestamps. */
export function validActivityDate(value:unknown):value is string{return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(value)&&Number.isFinite(Date.parse(value));}

function parseResearch(v:unknown):Research{
 if(!object(v)||!Array.isArray(v.notes)||!Array.isArray(v.groups)||!object(v.reading))throw Error('Invalid source notes. Nothing was imported.');
 const groups:EvidenceGroup[]=v.groups.map(g=>{if(!object(g)||!string(g.id)||!g.id||!string(g.name)||!g.name.trim()||(g.requirementId!==undefined&&!string(g.requirementId))||(g.question!==undefined&&typeof g.question!=='boolean'))throw Error('Invalid evidence group.');return {id:g.id,name:g.name,...(g.requirementId?{requirementId:g.requirementId as string}:{}),...(g.question?{question:true}:{})};});
 const notes:SourceNote[]=v.notes.map(n=>{if(!object(n)||!string(n.id)||!n.id||!string(n.text)||!n.text.trim()||!['Summary','Key Finding','Quotation','Question','Personal Insight'].includes(n.category as string)||!['supporting','opposing','contextual'].includes(n.stance as string)||!validActivityDate(n.updatedAt)||(n.location!==undefined&&!string(n.location))||(n.groupId!==undefined&&!string(n.groupId)))throw Error('Invalid source note.');return {id:n.id,source:article(n.source),text:n.text,category:n.category as SourceNote['category'],stance:n.stance as SourceNote['stance'],updatedAt:n.updatedAt,...(n.location?{location:n.location as string}:{}),...(n.groupId?{groupId:n.groupId as string}:{})};});
 if(new Set(groups.map(g=>g.id)).size!==groups.length||new Set(notes.map(n=>n.id)).size!==notes.length)throw Error('Duplicate evidence IDs. Nothing was imported.');
 const reading:Research['reading']={};for(const [id,state] of Object.entries(v.reading)){if(!/^10\.\d{4,9}\/\S+$/i.test(doiKey(id))||!['To Read','Reading','Reviewed'].includes(state as string))throw Error('Invalid reading status.');reading[doiKey(id)]=state as Research['reading'][string];}
 return {groups,notes,reading};
}
