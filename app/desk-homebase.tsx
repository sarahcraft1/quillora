'use client';
import {useEffect,useState} from 'react';
import {ArrowRight,Check,Plus,Bookmark,CalendarDays} from 'lucide-react';
import {type Assignment,type Work} from '../lib/work';
import {type Preferences} from '../lib/workspace';
import {deskDay,deadlineLabel} from '../lib/desk-home';
import {type BuddyEvent} from '../lib/buddy-dialogue';
import DeskOrnament from './desk-ornament';

export function DeskSketch(){return <svg className="desk-sketch" viewBox="0 0 130 100" fill="none" aria-hidden="true"><path d="M29 16h64l9 8v64H29z" fill="var(--surface)" stroke="currentColor"/><path d="M93 16v10h10M40 38h45M40 50h37M40 62h44M40 74h26" stroke="currentColor" strokeLinecap="round"/><path d="M18 76Q14 47 30 39Q33 62 18 76M17 78l13-39M101 64q26-5 15-26-21 8-15 26ZM103 62l11-20M106 14v10m-5-5h10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/><circle cx="19" cy="25" r="3" fill="currentColor"/></svg>;}

export function DeskWelcome({preferences,work,onCreate}:{preferences:Preferences;work:Work;onCreate:()=>void}){
 const name=preferences.studentName?.trim();
 const {current,checked,requirements}=deskDay(work);
 const welcome=work.assignments.length&&!current?'A chapter finished. Take a breath, then follow a new question.':requirements&&checked===requirements?'Every requirement checked. A little care before you submit.':current?.research?.notes.length?'Your ideas are taking shape. There’s room for the next one.':current?'Pick up a small thread. Your question is right where you left it.':'A place for your questions. A little room to grow.';
 return <div className="desk-home-heading" data-ornament-position={preferences.ornamentPosition||'right'}>
  <DeskOrnament kind={preferences.ornament}/>
  <div className="desk-welcome-copy"><div className="eyebrow">{name?'WELCOME BACK, '+name:'WELCOME TO YOUR LITTLE CORNER'}</div><h1>{preferences.deskName?.trim()||<>My <em>Desk.</em></>}</h1><p>{preferences.motto?.trim()||welcome}</p></div>
  <button className="primary" onClick={onCreate}><Plus size={16}/><span>New assignment</span></button>
 </div>;
}

function DeskMilestone({event}:{event?:BuddyEvent}){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const remaining=event?.kind==='requirement'?5000-(Date.now()-event.at):0;
  setVisible(remaining>0);
  if(remaining>0){const timer=setTimeout(()=>setVisible(false),remaining);return()=>clearTimeout(timer);}
 },[event]);
 return <div className="desk-milestone" role="status">{visible&&<span><Check size={14}/> One more step, made by you.</span>}</div>;
}

export function DeskContinue({work,onOpen,onCreate,event}:{work:Work;onOpen:(assignment:Assignment)=>void;onCreate:()=>void;event?:BuddyEvent}){
 const {current,resuming,checked,requirements}=deskDay(work);
 const completed=work.assignments.some(assignment=>assignment.status==='completed');
 const course=work.classes?.find(course=>course.id===current?.classId);
 return <section className={'desk-resume '+(requirements&&checked===requirements?'steps-finished':'')} aria-labelledby="continue-title">
  <div className="resume-copy"><div className="eyebrow">{resuming?'CONTINUE WHERE YOU LEFT OFF':current?'A GOOD PLACE TO PICK UP':'YOUR NEXT CHAPTER'}</div>
   {!current&&<DeskSketch/>}
   <h2 id="continue-title">{current?current.name:completed?'A chapter finished. A fresh page awaits.':'Make room for a good question.'}</h2>
   {current&&<div className="desk-resume-context"><span>{course?.code||course?.name||'Independent research'}</span>{current.dueDate&&<span><CalendarDays size={13}/>{deadlineLabel(current)}</span>}</div>}
   <p>{current?(current.question||'Your question, notes, and sources are right where you left them.'):completed?'Your completed work is still here. Make space for whatever interests you next.':'Start with a question that stays with you. We’ll keep the pages together.'}</p>
   <button className="primary" onClick={()=>current?onOpen(current):onCreate()}>{current?(resuming?'Resume assignment':'Open assignment'):'Create your first assignment'}<ArrowRight size={16}/></button>
   {current&&<div className="desk-small-progress" aria-label="Your assignment progress">
    {requirements>0?<><div><span>{checked===requirements?'Every requirement checked. A little care before you submit.':checked?`${checked} of ${requirements} requirements checked. One step at a time.`:'Your first step is waiting. No need to do it all at once.'}</span><small>{checked} / {requirements}</small></div><progress max={requirements} value={checked} aria-label="Requirements you have checked"/></>:<div><span><Bookmark size={13}/>{current.sources.length} {current.sources.length===1?'source':'sources'} tucked away · {current.research?.notes.length||0} source notes</span><small>At your pace</small></div>}
   </div>}
   <DeskMilestone event={event}/>
  </div>
 </section>;
}

export function DeskAttention({work,onOpen}:{work:Work;onOpen:(assignment:Assignment)=>void}){
 const {attention,deadlines,active}=deskDay(work);
 return <section className="desk-attention" aria-labelledby="attention-title"><div className="eyebrow">A SMALL PLAN FOR TODAY</div><h2 id="attention-title">Up next</h2>
  {attention?<button className="desk-attention-link" onClick={()=>onOpen(attention)} aria-label={'Continue next: '+attention.name}><span className="desk-deadline"><CalendarDays size={15}/>{deadlineLabel(attention)}</span><strong>{attention.name}</strong><span className="desk-attention-action">Make a little headway <ArrowRight size={15}/></span></button>:<p>{active.length?'No deadlines set. Follow the question on your desk.':'A little breathing room. Your next idea can start here.'}</p>}
  {deadlines.length>1&&<small>{deadlines.length-1} more {deadlines.length===2?'deadline':'deadlines'} on your desk</small>}
 </section>;
}

export function DeskBulletin({preferences,onPersonalize}:{preferences:Preferences;onPersonalize?:()=>void}){
 return <section className="desk-bulletin" aria-labelledby="bulletin-title"><div className="eyebrow">PINNED WITH A LITTLE CARE</div><h2 id="bulletin-title">A note to myself</h2>{preferences.bulletin?.trim()?<p className="personal-bulletin">{preferences.bulletin}</p>:<p>A question to follow. A reminder to breathe. A little note for future you.</p>}<button className="text-button" onClick={onPersonalize}>Edit my bulletin</button><small>Your desk bulletin · just for you</small></section>;
}

export function DeskActivity({work,onOpen,onBoard}:{work:Work;onOpen:(assignment:Assignment)=>void;onBoard:(assignment?:Assignment)=>void}){
 const {activity}=deskDay(work);
 return <section className="desk-evidence-activity" aria-label="Recent research activity"><div className="eyebrow">LITTLE STEPS, STILL HERE</div><h2>Recently in your notebook</h2><div className="activity-grid">{activity.map(({assignment,at,label})=><button key={assignment.id} onClick={()=>onOpen(assignment)}><small>{label} · {new Intl.DateTimeFormat('en',{month:'short',day:'numeric'}).format(new Date(at))}</small><strong>{assignment.name}</strong><span>{assignment.research?.notes.length||0} notes · {assignment.sources.length} saved sources <ArrowRight size={13}/></span></button>)}</div>{!activity.length&&<p className="muted">Open an assignment or keep a thought. Your recent research will leave a little trail here.</p>}{work.assignments.find(assignment=>assignment.status!=='completed'&&assignment.sources.length>0)&&<button className="text-button desk-notebook-link" onClick={()=>onBoard(work.assignments.find(assignment=>assignment.status!=='completed'&&assignment.sources.length>0))}>Spend a moment with your source notes <ArrowRight size={14}/></button>}</section>;
}
