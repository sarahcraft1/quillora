'use client';
import { Assignment, getChecklist } from '../lib/work';
export default function Checklist({assignment,disabled,onChange}:{assignment:Assignment;disabled:boolean;onChange:(id:string,complete:boolean)=>void}) {
  const items=getChecklist(assignment);
  if(!items.length)return null;
  return <fieldset className="rubric-checklist" disabled={disabled}><legend>Assignment checklist</legend><p className="muted">Mark a requirement complete only after you check it yourself. These marks reflect your confirmation; Quillora does not verify completion or predict a grade.</p>
    {items.map(item=><label key={item.id}><input type="checkbox" checked={item.complete} onChange={e=>onChange(item.id,e.target.checked)}/><span>{item.text}</span></label>)}
  </fieldset>;
}
