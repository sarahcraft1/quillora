import {test} from 'node:test';
import assert from 'node:assert/strict';
import {importCanvas,suggestCanvasClasses,canvasAssignmentKey} from '../lib/canvas/import';
import {parseWork,mergeWork,type Work,type Assignment} from '../lib/work';
import {type CanvasSnapshot} from '../lib/canvas/types';

const origin='https://canvas.example.edu';
const snapshot:CanvasSnapshot={version:1,origin,refreshedAt:'2026-11-13T18:00:00.000Z',courses:[{id:'12',name:'Research methods',code:'RES 101',url:origin+'/courses/12',timeZone:'America/Chicago'}],assignments:[{id:'34',courseId:'12',name:'Review essay',url:origin+'/courses/12/assignments/34',description:'Compare two methods.',dueAt:'2026-11-15T02:00:00Z',rubric:[{id:'criterion',description:'Cite sources',detail:'Use attribution.',points:5}],submissionStatus:'unsubmitted'}]};
const empty:Work={saved:[],assignments:[]};
const manual:Assignment={id:'manual',name:'My essay',question:'Does this method work?',rubric:'My instructions',requirements:'Read carefully',notes:'Keep my notes',sources:[],checklist:[{id:'check',text:'Read carefully',complete:true}],research:{notes:[],groups:[{id:'g',name:'Evidence'}],reading:{}}};

test('Canvas matches existing unique classes and repeated imports preserve stable local IDs',()=>{
 const initial:Work={...empty,classes:[{id:'local-course',name:'My methods class',code:'res 101',icon:'book',color:'#71836a'}]};
 const matches=suggestCanvasClasses(initial,snapshot);assert.equal(matches['12'],'local-course');
 const first=importCanvas(initial,snapshot,matches);const second=importCanvas(first.work,snapshot,suggestCanvasClasses(first.work,snapshot));
 assert.equal(first.added,1);assert.equal(second.added,0);assert.equal(second.updated,1);
 assert.equal(second.work.classes!.length,1);assert.equal(second.work.assignments.length,1);
 assert.equal(second.work.assignments[0].id,first.work.assignments[0].id);assert.equal(second.work.assignments[0].dueDate,'2026-11-14');
 assert.equal(initial.classes![0].canvas,undefined);assert.deepEqual(initial.assignments,[]);
});

test('Canvas refresh updates untouched fields while preserving edited research, dates, checklists and missing assignments',()=>{
 const first=importCanvas(empty,snapshot,{}).work;
 const edited={...first,assignments:[{...first.assignments[0],...manual,id:first.assignments[0].id,dueDate:'2026-12-01',status:'completed' as const}]};
 const before=JSON.stringify(edited);
 const fresh={...snapshot,refreshedAt:'2026-11-14T18:00:00.000Z',assignments:[{...snapshot.assignments[0],name:'Renamed by instructor',dueAt:null,description:'New instructions',submissionStatus:'submitted' as const}]};
 const result=importCanvas(edited,fresh,{}).work.assignments[0];
 assert.equal(result.name,manual.name);assert.equal(result.dueDate,'2026-12-01');assert.equal(result.notes,manual.notes);
 assert.deepEqual(result.research,manual.research);assert.deepEqual(result.checklist,manual.checklist);assert.equal(result.status,'completed');
 assert.equal(result.canvas!.description,'New instructions');assert.equal(result.canvas!.submissionStatus,'submitted');
 assert.equal(JSON.stringify(edited),before);
 const untouched=importCanvas(first,fresh,{}).work.assignments[0];assert.equal(untouched.name,'Renamed by instructor');assert.equal(untouched.dueDate,undefined);
 assert.equal(importCanvas(first,{...snapshot,courses:[],assignments:[]},{}).work.assignments.length,1);
});

test('Canvas explicit workspace linking retains student content and refuses duplicate or stale targets atomically',()=>{
 const work={...empty,assignments:[manual]};const mapping={[canvasAssignmentKey(snapshot.assignments[0])]:manual.id};
 const linked=importCanvas(work,snapshot,{},mapping).work;
 assert.equal(linked.assignments.length,1);assert.equal(linked.assignments[0].id,manual.id);assert.equal(linked.assignments[0].name,manual.name);
 assert.equal(linked.assignments[0].question,manual.question);assert.deepEqual(linked.assignments[0].research,manual.research);
 assert.equal(linked.assignments[0].dueDate,'2026-11-14');assert.ok(linked.assignments[0].canvas);
 assert.throws(()=>importCanvas(work,snapshot,{}, {[canvasAssignmentKey(snapshot.assignments[0])]:'missing'}));
 assert.throws(()=>importCanvas(linked,{...snapshot,assignments:[{...snapshot.assignments[0],id:'35',url:origin+'/courses/12/assignments/35'}]}, {},{'12:35':manual.id}));
 assert.equal(work.assignments[0].canvas,undefined);
});

test('Canvas references survive version-one backups and metadata conflicts remain recoverable on merge',()=>{
 const work=importCanvas(empty,snapshot,{}).work;const restored=parseWork(JSON.parse(JSON.stringify({version:1,...work})));
 assert.deepEqual(restored,work);assert.deepEqual(mergeWork(work,restored),work);
 const changed={...restored,assignments:[{...restored.assignments[0],canvas:{...restored.assignments[0].canvas!,description:'An older backup instruction'}}]};
 const merged=mergeWork(work,changed);assert.equal(merged.assignments.length,2);
 assert.equal(merged.assignments[0].canvas!.description,'Compare two methods.');assert.equal(merged.assignments[1].canvas!.description,'An older backup instruction');
 assert.equal(mergeWork(merged,changed).assignments.length,2);
 assert.throws(()=>parseWork({...work,assignments:[{...work.assignments[0],canvas:{...work.assignments[0].canvas,submissionStatus:'invented'}}]}),/Canvas assignment/);
});

test('Canvas class references merge without being dropped and class conflicts remap Canvas local class IDs',()=>{
 const work=importCanvas(empty,snapshot,{}).work;const originalClass=work.classes![0];
 const unlinked={...work,classes:[{...originalClass,canvas:undefined}],assignments:[]};
 assert.deepEqual(mergeWork(unlinked,work).classes![0].canvas,originalClass.canvas);
 assert.equal(unlinked.classes[0].canvas,undefined);
 const conflicting={...work,classes:[{...originalClass,name:'Different local class'}]};const merged=mergeWork(work,conflicting);
 const copy=merged.assignments.find(a=>a.name.endsWith('(imported copy)'))!;
 assert.equal(merged.classes!.length,2);assert.notEqual(copy.classId,originalClass.id);assert.equal(copy.canvas!.localClassId,copy.classId);
 assert.equal(mergeWork(merged,conflicting).classes!.length,2);
});
