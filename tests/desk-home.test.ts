import {test} from 'node:test';
import assert from 'node:assert/strict';
import {deskDay,deadlineLabel} from '../lib/desk-home';
import {readPreferences,persistPreferences} from '../lib/workspace';
import {type Assignment,type Work} from '../lib/work';

function assignment(id:string,extra:Partial<Assignment>={}):Assignment{return {id,name:id,question:'A question worth following',rubric:'',requirements:'',sources:[],...extra};}

test('daily desk resumes real activity and excludes completed work from deadlines',()=>{
 const work:Work={saved:[],assignments:[assignment('finished',{status:'completed',lastOpenedAt:'2026-11-12T18:00:00Z',dueDate:'2026-11-10'}),assignment('pinned',{pinned:true,lastOpenedAt:'2026-11-11T12:00:00Z'}),assignment('recent',{updatedAt:'2026-11-12T17:00:00Z'}),assignment('due',{dueDate:'2026-11-13'})]};
 const before=JSON.stringify(work),day=deskDay(work);
 assert.equal(day.current?.id,'recent');assert.equal(day.resuming,true);assert.equal(day.attention?.id,'due');assert.deepEqual(day.deadlines.map(item=>item.id),['due']);assert.equal(day.active.length,3);assert.equal(JSON.stringify(work),before);
});

test('legacy and empty desks never invent activity or checklist completion',()=>{
 const legacy:Work={saved:[],assignments:[assignment('first'),assignment('pinned',{pinned:true})]};
 assert.equal(deskDay(legacy).current?.id,'pinned');assert.equal(deskDay(legacy).resuming,false);assert.deepEqual(deskDay(legacy).activity,[]);assert.equal(deskDay(legacy).requirements,0);
 assert.equal(deskDay({saved:[],assignments:[assignment('done',{status:'completed'})]}).current,undefined);
 const day=deskDay({saved:[],assignments:[assignment('notes',{checklist:[{id:'first',text:'Read methods',complete:true},{id:'second',text:'Compare evidence',complete:false}]})]});
 assert.equal(day.checked,1);assert.equal(day.requirements,2);
});

test('deadline wording uses calendar days across month and year boundaries',()=>{
 const today=new Date(2026,11,31,23,45);
 assert.equal(deadlineLabel(assignment('today',{dueDate:'2026-12-31'}),today),'Due today');assert.equal(deadlineLabel(assignment('tomorrow',{dueDate:'2027-01-01'}),today),'Due tomorrow');assert.match(deadlineLabel(assignment('late',{dueDate:'2026-12-30'}),today),/^Past due/);assert.equal(deadlineLabel(assignment('pin'),today),'Pinned for your next visit');
});

test('V2.6 personal identity is optional, bounded and compatible with existing preferences',()=>{
 const legacy={theme:'bookish' as const,density:'compact' as const,motto:'Ask better questions.',buddy:'sprig' as const};
 assert.deepEqual(readPreferences({getItem:()=>JSON.stringify(legacy)},'desk'),legacy);
 let raw='';const value={...legacy,studentName:'Maya',ornamentPosition:'left' as const};persistPreferences({setItem:(_,value)=>{raw=value;}},'desk',value);assert.deepEqual(readPreferences({getItem:()=>raw},'desk'),value);
 const bounded=readPreferences({getItem:()=>JSON.stringify({...value,studentName:'x'.repeat(80),ornamentPosition:'anywhere'})},'desk');assert.equal(bounded.studentName?.length,40);assert.equal(bounded.ornamentPosition,undefined);
});

test('recent research reflects saved note timestamps without recording a visit',()=>{
 const source={id:'10.1234/example',title:'Sample source',authors:['A. Scholar'],journal:'Sample journal',abstract:'',url:'https://doi.org/10.1234/example',free:false};
 const work:Work={saved:[source],assignments:[assignment('research',{lastOpenedAt:'2026-11-11T12:00:00Z',research:{notes:[{id:'note',source,text:'My own thought',category:'Summary',stance:'contextual',updatedAt:'2026-11-12T12:00:00Z'}],groups:[],reading:{}}})]};
 const before=JSON.stringify(work),day=deskDay(work);assert.equal(day.activity[0].label,'A thought added');assert.equal(day.activity[0].at,'2026-11-12T12:00:00Z');assert.equal(JSON.stringify(work),before);
});
