import {type Work, type Assignment, doiKey, getChecklist} from './work';

/** Pure workspace projection, independent of the browser persistence adapter. */
export function researchProgress(work:Work){
 const items=work.assignments.flatMap(getChecklist);
 return {assignments:work.assignments.length,sources:work.saved.length,questions:work.assignments.filter(a=>a.question.trim()).length,completed:items.filter(i=>i.complete).length,requirements:items.length};
}
export function latestAssignment(assignments:Assignment[]){return assignments.filter(a=>a.lastOpenedAt).sort((a,b)=>Date.parse(b.lastOpenedAt!)-Date.parse(a.lastOpenedAt!))[0];}
export function activityDate(a:Assignment){return [a.updatedAt,a.lastOpenedAt].filter((s):s is string=>!!s).sort((a,b)=>Date.parse(b)-Date.parse(a))[0];}
function content(a:Assignment){const {updatedAt,lastOpenedAt,...data}=a;return JSON.stringify(data);}
/** Stamp confirmed mutations, never hydration. Persistence still decides whether changes succeed. */
export function recordWorkActivity(previous:Work,next:Work,now=new Date().toISOString()):Work{
 return {...next,saved:next.saved.map(a=>{const old=previous.saved.find(s=>doiKey(s.id)===doiKey(a.id));return old?{...a,...(old.savedAt?{savedAt:old.savedAt}:{})}:{...a,savedAt:now};}),assignments:next.assignments.map(a=>{const old=previous.assignments.find(p=>p.id===a.id);return !old||content(old)!==content(a)?{...a,updatedAt:now}:a;})};
}
