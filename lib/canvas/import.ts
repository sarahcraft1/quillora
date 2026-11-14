import {type Work,type Course,type Assignment} from '../work';
import {canvasDate,type CanvasAssignment,type CanvasSnapshot,type CanvasAssignmentReference} from './types';
const same=(a:string,b:string)=>a.trim().toLocaleLowerCase()===b.trim().toLocaleLowerCase();
export const canvasAssignmentKey=(assignment:Pick<CanvasAssignment,'courseId'|'id'>)=>`${assignment.courseId}:${assignment.id}`;
export function suggestCanvasClasses(work:Work,snapshot:CanvasSnapshot):Record<string,string>{
 return Object.fromEntries(snapshot.courses.map(course=>{
  const linked=work.classes?.find(c=>c.canvas?.some(ref=>ref.origin===snapshot.origin&&ref.courseId===course.id));
  const candidates=work.classes?.filter(c=>!c.canvas?.length&&((!!course.code&&!!c.code&&same(c.code,course.code))||same(c.name,course.name)))||[];
  return [course.id,linked?.id||(candidates.length===1?candidates[0].id:'')];
 }));
}
/** One atomic Work commit. Never removes research, notes, requirements or assignments. */
export function importCanvas(work:Work,snapshot:CanvasSnapshot,mapping:Record<string,string>,assignmentMapping:Record<string,string>={}){
 const classes:Course[]=(work.classes||[]).map(c=>({...c,canvas:c.canvas?[...c.canvas]:undefined}));
 const assignments=[...work.assignments];const classIds=new Map<string,string>();let added=0,updated=0;
 for(const course of snapshot.courses){
  const linked=classes.find(c=>c.canvas?.some(ref=>ref.origin===snapshot.origin&&ref.courseId===course.id));
  const selected=mapping[course.id];let target=selected?classes.find(c=>c.id===selected):linked;
  if(selected&&!target)throw Error('A selected class is no longer available. Review the course matches again.');
  if(!target){target={id:crypto.randomUUID(),name:course.name,code:course.code,icon:'book',color:'#71836a'};classes.push(target);}
  // Explicit rematching moves the reference, not student-created assignments.
  for(const item of classes)item.canvas=item.canvas?.filter(ref=>ref.origin!==snapshot.origin||ref.courseId!==course.id);
  target.canvas=[...(target.canvas||[]),{origin:snapshot.origin,courseId:course.id,url:course.url}];classIds.set(course.id,target.id);
 }
 for(const item of snapshot.assignments){
  const course=snapshot.courses.find(c=>c.id===item.courseId);const classId=classIds.get(item.courseId);if(!course||!classId)throw Error('Canvas returned an assignment without its course. Nothing was imported.');
  const reference:CanvasAssignmentReference={...item,origin:snapshot.origin,timeZone:course.timeZone,syncedAt:snapshot.refreshedAt,localClassId:classId};
  const linkedIndex=assignments.findIndex(a=>a.canvas?.origin===snapshot.origin&&a.canvas.courseId===item.courseId&&a.canvas.id===item.id);
  const selected=assignmentMapping[canvasAssignmentKey(item)];
  const selectedIndex=selected?assignments.findIndex(a=>a.id===selected):-1;
  if(selected&&(selectedIndex<0||(linkedIndex>=0&&linkedIndex!==selectedIndex)||(assignments[selectedIndex].canvas&&linkedIndex!==selectedIndex)))throw Error('That research workspace is no longer available for linking. Review the assignments again.');
  const index=linkedIndex>=0?linkedIndex:selectedIndex;
  const dueDate=canvasDate(item.dueAt,course.timeZone);
  if(index<0){
   const rubric=[item.description,...item.rubric.map(r=>[r.description,r.detail].filter(Boolean).join(': '))].filter(Boolean).join('\n\n');
   const fresh:Assignment={id:crypto.randomUUID(),name:item.name,question:'',rubric,requirements:item.rubric.map(r=>[r.description,r.detail].filter(Boolean).join(': ')).filter(Boolean).join('\n'),sources:[],classId,status:'active',canvas:reference,...(dueDate?{dueDate}:{})};assignments.push(fresh);added++;
  }else{
   const previous=assignments[index],old=previous.canvas;
   const next={...previous,canvas:reference};
   if(old){
    if(previous.name===old.name)next.name=item.name;
    if(previous.classId===old.localClassId)next.classId=classId;
    if(previous.dueDate===canvasDate(old.dueAt,old.timeZone)){if(dueDate)next.dueDate=dueDate;else delete next.dueDate;}
   }else{
    // Linking an existing workspace is explicit; retain its research and edited details.
    if(!previous.classId)next.classId=classId;
    if(!previous.dueDate&&dueDate)next.dueDate=dueDate;
   }
   // Updated Canvas instructions remain in metadata; student-edited rubric/checklist stay intact.
   assignments[index]=next;updated++;
  }
 }
 return {work:{...work,classes,assignments},added,updated};
}
