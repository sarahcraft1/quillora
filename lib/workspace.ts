import {type Work,type Assignment,type Course,validDueDate} from './work';
import {type StoragePort} from './storage';
export const THEMES=['scholarly','bookish','after-hours'] as const;
export type Preferences={theme:typeof THEMES[number];density:'comfortable'|'compact'};
export const DEFAULT_PREFERENCES:Preferences={theme:'scholarly',density:'comfortable'};
export function readPreferences(storage:Pick<StoragePort,'getItem'>,key:string):Preferences{try{const v=JSON.parse(storage.getItem(key+':preferences')||'null');return {theme:THEMES.includes(v?.theme)?v.theme:'scholarly',density:v?.density==='compact'?'compact':'comfortable'};}catch{return {...DEFAULT_PREFERENCES};}}
export function persistPreferences(storage:Pick<StoragePort,'setItem'>,key:string,p:Preferences){try{storage.setItem(key+':preferences',JSON.stringify(p));return true;}catch{return false;}}
export function saveClass(work:Work,course:Course):Work{const classes=work.classes||[];return {...work,classes:classes.some(c=>c.id===course.id)?classes.map(c=>c.id===course.id?course:c):[...classes,course]};}
export function removeClass(work:Work,id:string):Work{return {...work,classes:(work.classes||[]).filter(c=>c.id!==id),assignments:work.assignments.map(a=>{if(a.classId!==id)return a;const {classId,...rest}=a;return rest;})};}
export function editAssignment(work:Work,id:string,change:Pick<Partial<Assignment>,'classId'|'pinned'|'dueDate'|'status'>):Work{if(change.classId&&!(work.classes||[]).some(c=>c.id===change.classId))throw Error('Choose an existing class.');if(change.dueDate&&!validDueDate(change.dueDate))throw Error('Choose a valid due date.');return {...work,assignments:work.assignments.map(a=>a.id===id?{...a,...change}:a)};}
export function assignmentState(a:Assignment,today=new Date()){if(a.status==='completed')return 'Completed';if(!a.dueDate)return 'Active';const local=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');return a.dueDate<local?'Overdue':a.dueDate===local?'Due today':'Upcoming';}
