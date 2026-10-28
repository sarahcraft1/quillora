import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';
import Home from '../app/page';
import { STORAGE_KEY } from '../lib/work';
const seed=JSON.parse(readFileSync(new URL('./fixtures/checklist-workflow.json',import.meta.url),'utf8'));
async function mount(){
  const dom=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:'http://localhost/'});
  const originals=new Map<string,PropertyDescriptor|undefined>();
  const values:Record<string,unknown>={window:dom.window,self:dom.window,document:dom.window.document,navigator:dom.window.navigator,HTMLElement:dom.window.HTMLElement,React,IS_REACT_ACT_ENVIRONMENT:true};
  let stored=JSON.stringify(seed), fail=false;
  const storage={getItem:(key:string)=>key===STORAGE_KEY?stored:null,setItem:(key:string,value:string)=>{assert.equal(key,STORAGE_KEY);if(fail)throw new DOMException('SIMULATED quota exhaustion','QuotaExceededError');stored=value;}};
  values.localStorage=storage;
  for(const [key,value] of Object.entries(values)){originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});}
  const {createRoot}=await import('react-dom/client');const container=dom.window.document.getElementById('root')!;const root=createRoot(container);
  await act(async()=>root.render(React.createElement(Home)));
  const click=async(text:string)=>{const button=(Array.from(container.querySelectorAll('button')) as HTMLButtonElement[]).find(b=>b.textContent?.trim()===text);assert.ok(button,'Missing button: '+text);await act(async()=>button.click());};
  return {container,dom,storage,get raw(){return stored;},set fail(v:boolean){fail=v;},click,async close(){await act(async()=>root.unmount());dom.window.close();for(const [key,descriptor] of originals){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete (globalThis as any)[key];}}};
}
test('SIMULATED component quota failure keeps source visible, preserves bytes, and Retry save commits removal',async()=>{const app=await mount();try{await app.click('Saved sources1');const before=app.raw;app.fail=true;await app.click('Remove source');assert.equal(app.raw,before);assert.equal(app.container.querySelectorAll('article').length,1);assert.match(app.container.querySelector('[role="alert"]')!.textContent!,/Previously saved work is unchanged/);assert.match(app.container.textContent!,/Export attempted changes/);assert.ok(!app.container.textContent!.includes('Backup merged and saved'));app.fail=false;await app.click('Retry save');assert.equal(app.container.querySelectorAll('article').length,0);assert.equal(JSON.parse(app.raw).saved.length,0);assert.ok(JSON.parse(app.raw).assignments.every((a:any)=>a.sources.length===0));}finally{await app.close();}});
test('SIMULATED component quota failure does not check a requirement or claim it was saved',async()=>{const app=await mount();try{await app.click('Assignments');const before=app.raw;const checkbox=app.container.querySelector('input[type="checkbox"]') as HTMLInputElement;assert.equal(checkbox.checked,false);app.fail=true;await act(async()=>checkbox.click());assert.equal(checkbox.checked,false);assert.equal(app.raw,before);assert.match(app.container.textContent!,/Not saved/);app.fail=false;await app.click('Retry save');assert.equal((app.container.querySelector('input[type="checkbox"]') as HTMLInputElement).checked,true);assert.equal(JSON.parse(app.raw).assignments[0].checklist[0].complete,true);}finally{await app.close();}});

test('SIMULATED component import failure retains preview and old work without false success',async()=>{const app=await mount();try{const before=app.raw;const input=app.container.querySelector('input[aria-label="Import backup"]') as HTMLInputElement;const incoming={version:1,saved:[],assignments:[{...seed.assignments[0],id:'new-import',name:'Incoming essay'}]};Object.defineProperty(input,'files',{configurable:true,value:[{size:500,text:async()=>JSON.stringify(incoming)}]});await act(async()=>{input.dispatchEvent(new app.dom.window.Event('change',{bubbles:true}));await Promise.resolve();});app.fail=true;await app.click('Merge backup');assert.equal(app.raw,before);assert.match(app.container.textContent!,/Import was not saved/);assert.ok(!app.container.textContent!.includes('Backup merged and saved'));assert.match(app.container.textContent!,/Backup contains 1 assignments/);app.fail=false;await app.click('Retry save');assert.ok(JSON.parse(app.raw).assignments.some((a:any)=>a.name==='Incoming essay'));assert.equal(JSON.parse(app.raw).assignments.length,3);assert.match(app.container.textContent!,/Import saved after retry/);assert.ok(!app.container.textContent!.includes('Import was not saved'));}finally{await app.close();}});

