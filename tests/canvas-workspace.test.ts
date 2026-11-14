import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React,{act} from 'react';
import {JSDOM} from 'jsdom';
import Home from '../app/home';
import {type Work,parseWork} from '../lib/work';
import {type CanvasSnapshot,type CanvasStatus} from '../lib/canvas/types';

const storageKey='quillora-work:canvas-home-test',origin='https://canvas.example.edu';
const seed:Work=JSON.parse(readFileSync('tests/fixtures/checklist-workflow.json','utf8'));
const snapshot:CanvasSnapshot={version:1,origin,refreshedAt:'2026-11-13T17:00:00Z',courses:[{id:'11',name:'Research seminar',code:'RES 101',url:origin+'/courses/11',timeZone:'America/Chicago'}],assignments:[{id:'23',courseId:'11',name:'Canvas essay',url:origin+'/courses/11/assignments/23',description:'A synthetic assignment brief.',dueAt:'2026-12-01T06:30:00Z',rubric:[]},{id:'24',courseId:'11',name:'Undated notebook',url:origin+'/courses/11/assignments/24',description:'A synthetic notebook prompt.',dueAt:null,rubric:[]}]};
async function mount(){
 const dom=new JSDOM('<div id="root"></div>',{url:'https://quillora.example/'}),originals=new Map<string,PropertyDescriptor|undefined>();let raw=JSON.stringify(seed),writes=0,disconnected=false,sessionChanged=false,serverSnapshot=structuredClone(snapshot);
 const status=():CanvasStatus=>({storageKey,available:true,institutions:[{origin,name:'Example Canvas'}],connected:!disconnected,...(!disconnected?{origin,lastSyncAt:serverSnapshot.refreshedAt}:{}),snapshot:disconnected?null:serverSnapshot});
 const storage={getItem:(key:string)=>key===storageKey?raw:null,setItem:(key:string,value:string)=>{assert.equal(key,storageKey);raw=value;writes++;}};
 const fetcher=async(path:string,init?:RequestInit)=>{if(path==='/api/session')return new Response(JSON.stringify({storageKey:sessionChanged?'quillora-work:another':storageKey}));if(path==='/api/canvas'||path==='/api/canvas/refresh'){if(init?.method==='DELETE')disconnected=true;return new Response(JSON.stringify(status()));}throw Error('Unexpected test request '+path);};
 for(const [key,value] of Object.entries({window:dom.window,self:dom.window,document:dom.window.document,navigator:dom.window.navigator,HTMLElement:dom.window.HTMLElement,React,IS_REACT_ACT_ENVIRONMENT:true,localStorage:storage,fetch:fetcher})){originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});}
 const {createRoot}=await import('react-dom/client'),container=dom.window.document.getElementById('root')!,root=createRoot(container);await act(async()=>root.render(React.createElement(Home,{storageKey,verifySession:true})));
 const click=async(name:string)=>{const button=(Array.from(container.querySelectorAll('button')) as HTMLButtonElement[]).find(item=>item.textContent?.trim()===name||item.getAttribute('aria-label')===name);assert.ok(button,'Missing '+name);await act(async()=>button.click());};
 const change=async(selector:string,value:string)=>{const input=container.querySelector<HTMLSelectElement>(selector)!;assert.ok(input,selector);await act(async()=>{Object.getOwnPropertyDescriptor(dom.window.HTMLSelectElement.prototype,'value')!.set!.call(input,value);input.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});};
 return {container,dom,click,change,get raw(){return raw;},get writes(){return writes;},set raw(value:string){raw=value;},set sessionChanged(value:boolean){sessionChanged=value;},set serverSnapshot(value:CanvasSnapshot){serverSnapshot=value;},async close(){await act(async()=>root.unmount());dom.window.close();for(const [key,value] of originals){if(value)Object.defineProperty(globalThis,key,value);else Reflect.deleteProperty(globalThis,key);}}};
}

test('Canvas imports use the verified Home save path, preserve research and survive refresh and disconnect',async()=>{
 const app=await mount();
 try{assert.equal(app.writes,0);await app.click('Review courses & workspaces');await app.change('select[aria-label="Workspace for Canvas essay"]',seed.assignments[0].id);await app.click('Save Canvas to my desk');const first=parseWork(JSON.parse(app.raw));assert.equal(first.classes!.length,1);assert.equal(first.assignments.length,3);assert.deepEqual(first.saved,seed.saved);for(const original of seed.assignments){const saved=first.assignments.find(a=>a.id===original.id)!;for(const key of ['name','question','rubric','requirements','notes','checklist','sources','research'] as const)assert.deepEqual(saved[key],original[key],key+' is preserved');}assert.ok(app.container.querySelector('.class-card h3')!.textContent!.includes('Research seminar'));assert.equal(first.assignments[0].canvas?.id,'23');assert.equal(app.writes,1);
  app.serverSnapshot={...snapshot,refreshedAt:'2026-11-13T18:00:00Z',assignments:snapshot.assignments.map(item=>({...item,name:item.id==='24'?'Notebook revised':item.name}))};await app.click('Refresh Canvas');assert.equal(app.writes,1,'refresh does not implicitly replace browser research');await app.click('Review courses & workspaces');await app.click('Save Canvas to my desk');const refreshed=parseWork(JSON.parse(app.raw));assert.equal(refreshed.classes!.length,1);assert.equal(refreshed.assignments.length,3);assert.equal(refreshed.assignments.find(a=>a.canvas?.id==='24')!.name,'Notebook revised');assert.equal(refreshed.assignments[0].name,seed.assignments[0].name);const bytes=app.raw;await app.click('Disconnect Canvas');await app.click('Confirm disconnect');assert.equal(app.raw,bytes);assert.match(app.container.textContent!,/Imported classes, workspaces and research are still here/);assert.ok(app.container.querySelector('.class-card h3'));assert.equal(app.container.querySelectorAll('.desk-assignment').length,3);
 }finally{await app.close();}
});

test('Canvas import detects a concurrent research write and leaves the other tab’s data intact',async()=>{
 const app=await mount();
 try{await app.click('Review courses & workspaces');const external={...seed,assignments:[...seed.assignments,{id:'other-tab',name:'Another tab’s research',question:'Keep this',rubric:'',requirements:'',sources:[]}]};app.raw=JSON.stringify(external);const before=app.raw;await app.click('Save Canvas to my desk');assert.equal(app.raw,before);assert.equal(app.writes,0);assert.match(app.container.textContent!,/changed in another tab/);assert.match(app.container.textContent!,/Canvas was not imported/);assert.ok(app.container.querySelector('.canvas-import-review'));assert.equal(app.container.querySelectorAll('.desk-assignment').length,seed.assignments.length);
 }finally{await app.close();}
});

test('Canvas import refuses to save when verified server identity no longer matches the workspace',async()=>{
 const app=await mount();
 try{await app.click('Review courses & workspaces');const before=app.raw;app.sessionChanged=true;await app.click('Save Canvas to my desk');assert.equal(app.raw,before);assert.equal(app.writes,0);assert.match(app.container.textContent!,/session changed|sign in again|session could not be verified/i);assert.equal(app.container.querySelector('.canvas-desk'),null,'stale sessions no longer show private workspace data');
 }finally{await app.close();}
});
