import { test } from 'node:test';
import assert from 'node:assert/strict';
import { persistWork, type StoragePort } from '../lib/storage';
import { STORAGE_KEY, mergeWork, toggleSource, linkSource, type Work, type Article } from '../lib/work';
const source:Article={id:'10.1234/test',title:'A source',authors:[],journal:'',url:'https://doi.org/10.1234/test',abstract:'',free:false};
const assignment={id:'one',name:'Original',question:'Question',rubric:'Rubric',requirements:'Use APA',sources:[source]};
const previous:Work={saved:[source],assignments:[assignment]};
class ControlledStorage implements StoragePort {
  raw=JSON.stringify(previous); writes=0; failure='QuotaExceededError';
  getItem(key:string){assert.equal(key,STORAGE_KEY);return this.raw;}
  setItem(key:string,value:string){assert.equal(key,STORAGE_KEY);this.writes++;if(this.failure)throw new DOMException('Controlled test failure',this.failure);this.raw=value;}
}
const mutations: [string,()=>Work][]=[
  ['source save',()=>toggleSource(previous,{...source,id:'10.1234/new'},'one')],
  ['source removal',()=>toggleSource(previous,source,'one')],
  ['assignment creation',()=>({...previous,assignments:[...previous.assignments,{...assignment,id:'two'}]})],
  ['assignment edit',()=>({...previous,assignments:[{...assignment,question:'Changed'}]})],
  ['assignment link',()=>linkSource({...previous,assignments:[{...assignment,sources:[]}]},source,'one')],
  ['backup import',()=>mergeWork(previous,{saved:[],assignments:[{...assignment,rubric:'Incoming rubric'}]})],
];
for (const [name,change] of mutations) test('SIMULATED quota exhaustion preserves previous bytes for '+name,()=>{
  const storage=new ControlledStorage(), raw=storage.raw, next=change(), snapshot=JSON.stringify(previous);
  const result=persistWork(storage,raw,next);
  assert.equal(result.ok,false);if(result.ok)throw Error('Expected rejection');assert.equal(result.reason,'quota');assert.match(result.message,/Export attempted changes/);
  assert.equal(storage.raw,raw);assert.equal(JSON.stringify(previous),snapshot);assert.equal(storage.writes,1);
  // A controlled retry succeeds without dropping original work.
  storage.failure='';const retry=persistWork(storage,raw,next);assert.equal(retry.ok,true);assert.deepEqual(JSON.parse(storage.raw),next);
});
test('SIMULATED write denial leaves previous work intact and actionable',()=>{const s=new ControlledStorage(),raw=s.raw;s.failure='SecurityError';const r=persistWork(s,raw,{saved:[],assignments:[]});assert.equal(r.ok,false);if(r.ok)throw Error();assert.equal(r.reason,'unavailable');assert.match(r.message,/allow site storage/);assert.equal(s.raw,raw);});
test('SIMULATED read denial never attempts a write',()=>{let writes=0;const r=persistWork({getItem(){throw new DOMException('Denied','SecurityError')},setItem(){writes++}},null,previous);assert.equal(r.ok,false);assert.equal(writes,0);});
test('stale-tab write does not overwrite external work',()=>{const s=new ControlledStorage();s.failure='';const raw=s.raw;s.raw=JSON.stringify({...previous,saved:[]});const r=persistWork(s,raw,previous);assert.equal(r.ok,false);if(r.ok)throw Error();assert.equal(r.reason,'conflict');assert.equal(s.writes,0);assert.deepEqual(JSON.parse(s.raw).saved,[]);});
