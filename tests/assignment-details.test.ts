import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseWork,mergeWork,updateAssignment,unlinkSource} from '../lib/work';
const seed=JSON.parse(readFileSync('tests/fixtures/checklist-workflow.json','utf8'));

test('legacy work stays readable; assignment names and notes survive backup restoration',()=>{
 const work=parseWork(seed);assert.equal(work.assignments[0].notes,undefined);
 work.assignments[0]=updateAssignment(work.assignments[0],'Revised question','Use APA','Use APA','NASA notes: verify the claim.','Revised name');
 const restored=parseWork(JSON.parse(JSON.stringify({version:1,...work})));
 assert.equal(restored.assignments[0].notes,'NASA notes: verify the claim.');assert.equal(restored.assignments[0].name,'Revised name');
 assert.throws(()=>parseWork({...seed,assignments:[{...seed.assignments[0],notes:{private:'invalid shape'}}]}),/Invalid assignment notes/);
});

test('conflicting notes import as a separate copy; repeated import never overwrites either version',()=>{
 const existing=parseWork(seed),incoming=parseWork(seed);existing.assignments[0].notes='Original notes';incoming.assignments[0].notes='Incoming notes';
 const once=mergeWork(existing,incoming),twice=mergeWork(once,incoming);
 assert.equal(once.assignments.length,3);assert.equal(twice.assignments.length,3);assert.equal(twice.assignments[0].notes,'Original notes');assert.equal(twice.assignments[2].notes,'Incoming notes');
 const empty=parseWork(seed);empty.assignments[0].notes='';assert.equal(mergeWork(parseWork(seed),empty).assignments.length,2);
});

test('removing a source from one assignment retains shelf and other assignment links',()=>{
 const work=parseWork(seed);work.assignments[1].sources=[work.saved[0]];const next=unlinkSource(work,'https://doi.org/'+work.saved[0].id.toUpperCase(),work.assignments[0].id);
 assert.equal(next.saved.length,1);assert.equal(next.assignments[0].sources.length,0);assert.equal(next.assignments[1].sources.length,1);assert.equal(work.assignments[0].sources.length,1);
});
