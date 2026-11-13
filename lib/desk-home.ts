import {type Assignment,type Work,getChecklist} from './work';
import {activityDate} from './desk';

function timestamp(value?:string){return value&&Number.isFinite(Date.parse(value))?Date.parse(value):0;}
export function deskDay(work:Work){
 const active=work.assignments.filter(assignment=>assignment.status!=='completed');
 const deadlines=active.filter(assignment=>assignment.dueDate).sort((first,second)=>first.dueDate!.localeCompare(second.dueDate!));
 const latest=[...active].filter(assignment=>timestamp(activityDate(assignment))).sort((first,second)=>timestamp(activityDate(second))-timestamp(activityDate(first)))[0];
 const current=latest||active.find(assignment=>assignment.pinned)||deadlines[0]||active[0];
 const attention=deadlines[0]||active.find(assignment=>assignment.pinned);
 const checks=current?getChecklist(current):[];
 const activity=work.assignments.flatMap(assignment=>{
  const note=[...(assignment.research?.notes||[])].sort((first,second)=>timestamp(second.updatedAt)-timestamp(first.updatedAt))[0];
  const noteTime=timestamp(note?.updatedAt),workTime=timestamp(activityDate(assignment));
  if(!noteTime&&!workTime)return [];
  const at=noteTime>=workTime?note!.updatedAt:activityDate(assignment)!;
  const label=noteTime>=workTime?'A thought added':timestamp(assignment.updatedAt)>=timestamp(assignment.lastOpenedAt)?'Research moved forward':'A question revisited';
  return [{assignment,at,label}];
 }).sort((first,second)=>timestamp(second.at)-timestamp(first.at)).slice(0,3);
 return {active,current,attention,deadlines,activity,resuming:!!latest,checked:checks.filter(check=>check.complete).length,requirements:checks.length};
}

export function deadlineLabel(assignment:Assignment,today=new Date()){
 if(!assignment.dueDate)return 'Pinned for your next visit';
 const calendarDay=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
 const days=Math.round((Date.parse(assignment.dueDate+'T12:00:00Z')-Date.parse(calendarDay+'T12:00:00Z'))/86400000);
 if(days===0)return 'Due today';
 if(days===1)return 'Due tomorrow';
 const date=new Intl.DateTimeFormat('en',{month:'short',day:'numeric'}).format(new Date(assignment.dueDate+'T12:00:00'));
 return days<0?'Past due · '+date:'Due '+date;
}
