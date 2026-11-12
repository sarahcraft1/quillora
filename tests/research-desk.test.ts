import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React,{act} from 'react';
import {JSDOM} from 'jsdom';
import Home from '../app/home';
import {STORAGE_KEY,parseWork,mergeWork,type Work} from '../lib/work';
import {activityDate,latestAssignment,recordWorkActivity,researchProgress} from '../lib/desk';
const seed:Work=JSON.parse(readFileSync('tests/fixtures/checklist-workflow.json','utf8'));
async function mount(initial:Work=seed){
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/'}),originals=new Map<string,PropertyDescriptor|undefined>();let raw=JSON.stringify(initial),writes=0,fail=false;
 const storage={getItem:(key:string)=>key===STORAGE_KEY?raw:null,setItem:(key:string,value:string)=>{assert.equal(key,STORAGE_KEY);if(fail)throw new DOMException('Simulated full storage','QuotaExceededError');raw=value;writes++;}};
 for(const [k,v] of Object.entries({window:dom.window,self:dom.window,document:dom.window.document,navigator:dom.window.navigator,HTMLElement:dom.window.HTMLElement,React,IS_REACT_ACT_ENVIRONMENT:true,localStorage:storage})){originals.set(k,Object.getOwnPropertyDescriptor(globalThis,k));Object.defineProperty(globalThis,k,{value:v,configurable:true,writable:true});}
 const {createRoot}=await import('react-dom/client');const container=dom.window.document.getElementById('root')!,root=createRoot(container);await act(async()=>root.render(React.createElement(Home)));
 const click=async(name:string)=>{const b=(Array.from(container.querySelectorAll('button')) as HTMLButtonElement[]).find(b=>b.textContent?.trim()===name||b.getAttribute('aria-label')===name) as HTMLButtonElement;assert.ok(b,'Missing '+name);await act(async()=>b.click());};
 return {dom,container,click,get raw(){return raw;},get writes(){return writes;},set fail(value:boolean){fail=value;},async close(){await act(async()=>root.unmount());dom.window.close();for(const [k,v] of originals){if(v)Object.defineProperty(globalThis,k,v);else Reflect.deleteProperty(globalThis,k);}}};
}
test('desk hydration shows legacy research and truthful progress without rewriting storage or inventing activity',async()=>{
 const app=await mount();try{assert.match(app.container.querySelector('h1')!.textContent!,/My Research Desk/);assert.match(app.container.textContent!,/Activity not recorded/);assert.match(app.container.textContent!,/No student account or cloud sync/);assert.equal(app.writes,0);assert.equal(app.raw,JSON.stringify(seed));assert.deepEqual(researchProgress(seed),{assignments:2,sources:1,questions:2,completed:0,requirements:6});assert.equal(latestAssignment(seed.assignments),undefined);}finally{await app.close();}
});
test('opening an assignment persists resume across remount and keeps saved-source retrieval/citation available',async()=>{
 const app=await mount();let saved!:Work;try{await app.click('Open assignment: Checklist audit B');assert.ok(!app.container.querySelector('.research-desk'));await app.click('My Research Desk');assert.match(app.container.querySelector('#continue-title')!.textContent!,/Checklist audit B/);saved=JSON.parse(app.raw);assert.ok(saved.assignments[1].lastOpenedAt);assert.equal(saved.assignments[0].lastOpenedAt,undefined);assert.deepEqual(saved.saved,seed.saved);await app.click('All saved sources');assert.equal(app.container.querySelectorAll('.article').length,1);await app.click('My Research Desk');await app.click('Cite saved source: '+seed.saved[0].title);assert.match(app.container.querySelector('[role="dialog"]')!.textContent!,/Su, J\./);}finally{await app.close();}
 const refreshed=await mount(saved);try{assert.match(refreshed.container.querySelector('#continue-title')!.textContent!,/Checklist audit B/);await refreshed.click('Resume assignment');assert.equal((refreshed.container.querySelector('#topic') as HTMLInputElement).value,saved.assignments[1].question);}finally{await refreshed.close();}
});
test('failed activity save does not replace work or claim a new resume target',async()=>{
 const app=await mount();try{const before=app.raw;app.fail=true;await app.click('Open assignment: Checklist audit A');assert.equal(app.raw,before);assert.match(app.container.querySelector('[role="alert"]')!.textContent!,/Previously saved work/);assert.equal(app.container.querySelector('#continue-title')!.textContent,'Make room for a good question.');}finally{await app.close();}
});
test('dashboard navigation protects unsaved assignment edits',async()=>{
 const app=await mount();try{await app.click('Open assignment: Checklist audit A');const el=app.container.querySelector('#topic') as HTMLInputElement;await act(async()=>{Object.getOwnPropertyDescriptor(app.dom.window.HTMLInputElement.prototype,'value')!.set!.call(el,'Changed question');el.dispatchEvent(new app.dom.window.Event('input',{bubbles:true}));});await app.click('My Research Desk');assert.match(app.container.querySelector('[role="alert"]')!.textContent!,/unsaved edits/);assert.ok(app.container.querySelector('#topic'));await app.click('Save and continue');assert.ok(app.container.querySelector('.research-desk'));assert.equal(JSON.parse(app.raw).assignments[0].question,'Changed question');}finally{await app.close();}
});
test('Back Up Research keeps version 1; restore requires preview/confirmation and merges without replacement',async()=>{
 const app=await mount(),create=URL.createObjectURL,revoke=URL.revokeObjectURL;let blob:Blob|undefined;const anchor=app.dom.window.HTMLAnchorElement.prototype.click;
 try{URL.createObjectURL=(b:Blob)=>{blob=b;return 'blob:qa';};URL.revokeObjectURL=()=>{};app.dom.window.HTMLAnchorElement.prototype.click=function(){};await app.click('Back Up Research');assert.ok(blob);const backup=JSON.parse(await blob!.text());assert.equal(backup.version,1);assert.deepEqual(parseWork(backup),parseWork(seed));
 const input=app.container.querySelector('input[aria-label="Restore Research"]') as HTMLInputElement;const incoming={version:1,saved:[],assignments:[{...seed.assignments[0],id:'restored-new',name:'Restored essay'}]};Object.defineProperty(input,'files',{value:[{size:300,text:async()=>JSON.stringify(incoming)}],configurable:true});const before=app.raw;await act(async()=>{input.dispatchEvent(new app.dom.window.Event('change',{bubbles:true}));await Promise.resolve();});assert.equal(app.raw,before);assert.match(app.container.textContent!,/never replaces your existing work/);await app.click('Cancel restore');assert.equal(app.raw,before);await act(async()=>{input.dispatchEvent(new app.dom.window.Event('change',{bubbles:true}));await Promise.resolve();});await app.click('Confirm restore');const restored=JSON.parse(app.raw);assert.equal(restored.assignments.length,3);assert.equal(restored.saved.length,1);assert.equal(restored.assignments[0].name,seed.assignments[0].name);assert.match(app.container.textContent!,/Backup merged and saved/);
 }finally{URL.createObjectURL=create;URL.revokeObjectURL=revoke;app.dom.window.HTMLAnchorElement.prototype.click=anchor;await app.close();}
});
test('activity timestamps round-trip version 1 and only real mutations update activity',()=>{
 const now='2026-11-11T20:00:00.000Z';const opened={...seed,assignments:seed.assignments.map((a,i)=>i===0?{...a,lastOpenedAt:now}:a)};const next=recordWorkActivity(seed,opened,now);assert.equal(next.assignments[0].updatedAt,undefined);assert.equal(activityDate(next.assignments[0]),now);assert.equal(next.saved[0].savedAt,undefined);const edited=recordWorkActivity(next,{...next,assignments:next.assignments.map((a,i)=>i===0?{...a,notes:'Verified methods'}:a)},now);assert.equal(edited.assignments[0].updatedAt,now);const restored=parseWork({version:1,...edited});assert.equal(restored.assignments[0].lastOpenedAt,now);assert.equal(mergeWork(restored,seed).assignments[0].updatedAt,now);
});
test('new empty desk gives actionable assignment and source guidance without fabricated progress',async()=>{
 const app=await mount({saved:[],assignments:[]});try{assert.match(app.container.textContent!,/Create your first assignment/);assert.match(app.container.textContent!,/Find your first source/);assert.ok(!app.container.textContent!.includes('%'));await app.click('Find your first source');assert.ok(app.container.querySelector('#topic'));}finally{await app.close();}
});
