import {test} from 'node:test';
import assert from 'node:assert/strict';
import React,{act} from 'react';
import {JSDOM} from 'jsdom';
import QuickNotes from '../app/quick-notes';
import {QUICK_NOTES_LIMIT,quickNotesKey,readQuickNote,saveQuickNote} from '../lib/quick-notes';

const workspace='quillora-work:local',key=quickNotesKey(workspace);
function stored(text:string){return JSON.stringify({version:1,text});}

test('scratchpad storage is isolated from academic work, preferences and other identities',()=>{
 const values=new Map([[workspace,'academic bytes'],[workspace+':preferences','preference bytes']]);const writes:string[]=[];
 const storage={getItem:(name:string)=>values.get(name)??null,setItem:(name:string,value:string)=>{writes.push(name);values.set(name,value);}};
 assert.deepEqual(readQuickNote(storage,workspace),{ok:true,text:'',raw:null});assert.equal(saveQuickNote(storage,workspace,null,'A passing thought').ok,true);assert.deepEqual(writes,[key]);assert.equal(values.get(workspace),'academic bytes');assert.equal(values.get(workspace+':preferences'),'preference bytes');assert.equal(readQuickNote(storage,'another-person').ok,true);assert.equal(values.get(quickNotesKey('another-person')),undefined);
});

test('scratchpad refuses conflicting saves and never overwrites a newer tab',()=>{
 let raw=stored('Newer note');const storage={getItem:()=>raw,setItem:(_:string,value:string)=>{raw=value;}};
 const result=saveQuickNote(storage,workspace,stored('Earlier note'),'My draft');assert.equal(result.ok,false);if(!result.ok)assert.equal(result.reason,'conflict');assert.equal(raw,stored('Newer note'));
});

test('invalid scratchpads, unavailable storage and limits do not claim successful saves',()=>{
 for(const raw of ['{broken',JSON.stringify({version:2,text:'future'}),stored('x'.repeat(QUICK_NOTES_LIMIT+1))])assert.equal(readQuickNote({getItem:()=>raw},workspace).ok,false);
 assert.equal(readQuickNote({getItem:()=>{throw Error('blocked');}},workspace).ok,false);
 const storage={getItem:()=>null,setItem:()=>{throw new DOMException('full','QuotaExceededError');}};assert.equal(saveQuickNote(storage,workspace,null,'Keep this draft').ok,false);assert.equal(saveQuickNote(storage,workspace,null,'x'.repeat(QUICK_NOTES_LIMIT+1)).ok,false);
});

async function mount(initial:string|null=null,width=1440){
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/'}),originals=new Map<string,PropertyDescriptor|undefined>();
 Object.defineProperty(dom.window,'innerWidth',{value:width,configurable:true});
 const values=new Map<string,string>([[workspace,'unchanged academic bytes']]);if(initial!==null)values.set(key,initial);const writes:string[]=[];const faults={read:false,write:false,copy:false};let clipboard='';
 const storage={getItem:(name:string)=>{if(faults.read)throw Error('blocked');return values.get(name)??null;},setItem:(name:string,value:string)=>{if(faults.write)throw new DOMException('full','QuotaExceededError');writes.push(name);values.set(name,value);}};
 Object.defineProperty(dom.window.navigator,'clipboard',{configurable:true,value:{writeText:async(value:string)=>{if(faults.copy)throw Error('denied');clipboard=value;}}});
 for(const [name,value] of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,HTMLElement:dom.window.HTMLElement,React,IS_REACT_ACT_ENVIRONMENT:true})){originals.set(name,Object.getOwnPropertyDescriptor(globalThis,name));Object.defineProperty(globalThis,name,{value,configurable:true,writable:true});}
 const {createRoot}=await import('react-dom/client');const container=dom.window.document.getElementById('root')!,root=createRoot(container);
 const render=async(identity=workspace)=>act(async()=>root.render(React.createElement('div',{className:'shell'},React.createElement('main',null,React.createElement('button',null,'Research action')),React.createElement(QuickNotes,{key:identity,storageKey:identity,storage}))));
 await render();
 const click=async(name:string)=>{const button=(Array.from(container.querySelectorAll('button')) as HTMLButtonElement[]).find(button=>button.getAttribute('aria-label')===name||button.textContent?.trim()===name);assert.ok(button,'Missing '+name);assert.equal(button.disabled,false);await act(async()=>button.click());};
 const edit=async(text:string)=>{const area=container.querySelector('textarea')!;assert.ok(area);await act(async()=>{Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype,'value')!.set!.call(area,text);area.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});};
 return {dom,container,values,writes,faults,storage,render,click,edit,get clipboard(){return clipboard;},async close(){await act(async()=>root.unmount());dom.window.close();for(const [name,value] of originals){if(value)Object.defineProperty(globalThis,name,value);else Reflect.deleteProperty(globalThis,name);}}};
}

test('Quick Notes hydrates without writes and autosaves only its separate scratchpad',async()=>{
 const app=await mount(stored('Earlier thought'));try{assert.deepEqual(app.writes,[]);await app.click('Open Quick Notes');assert.equal(app.container.querySelector('textarea')!.value,'Earlier thought');await app.edit('A small idea worth keeping');assert.match(app.container.querySelector('.quick-notes-save')!.textContent!,/Saving/);await act(async()=>{await new Promise(resolve=>setTimeout(resolve,450));});assert.equal(app.values.get(key),stored('A small idea worth keeping'));assert.match(app.container.querySelector('.quick-notes-save')!.textContent!,/Saved in this browser/);assert.deepEqual(app.writes,[key]);assert.equal(app.values.get(workspace),'unchanged academic bytes');}finally{await app.close();}
});

test('minimizing and remounting retain notes and flush the latest pending edit',async()=>{
 const app=await mount();let raw!:string;try{await app.click('Open Quick Notes');await app.edit('Keep this across navigation');await app.click('Minimize Quick Notes');assert.equal(app.container.querySelector('textarea'),null);raw=app.values.get(key)!;assert.equal(raw,stored('Keep this across navigation'));await app.click('Open Quick Notes');assert.equal(app.container.querySelector('textarea')!.value,'Keep this across navigation');}finally{await app.close();}const restored=await mount(raw);try{await restored.click('Open Quick Notes');assert.equal(restored.container.querySelector('textarea')!.value,'Keep this across navigation');assert.deepEqual(restored.writes,[]);}finally{await restored.close();}
});

test('clearing requires confirmation, cancellation preserves content, and research bytes stay intact',async()=>{
 const app=await mount(stored('Remember the methods'));try{await app.click('Open Quick Notes');await app.click('Clear note');assert.equal(app.dom.window.document.activeElement?.textContent,'Keep note');assert.equal(app.values.get(key),stored('Remember the methods'));await app.click('Keep note');assert.equal(app.dom.window.document.activeElement,app.container.querySelector('textarea'));assert.equal(app.container.querySelector('textarea')!.value,'Remember the methods');await app.click('Clear note');await app.click('Clear scratchpad');assert.equal(app.container.querySelector('textarea')!.value,'');assert.equal(app.values.get(key),stored(''));assert.equal(app.values.get(workspace),'unchanged academic bytes');}finally{await app.close();}
});

test('copy reports success only after a real clipboard write and offers manual copying on failure',async()=>{
 const app=await mount(stored('My passing thought'));try{await app.click('Open Quick Notes');await app.click('Copy note');assert.equal(app.clipboard,'My passing thought');assert.match(app.container.querySelector('.quick-notes-copy-status')!.textContent!,/Note copied/);app.faults.copy=true;await app.click('Copy note');assert.match(app.container.querySelector('.quick-notes-copy-status')!.textContent!,/unavailable/);assert.equal(app.dom.window.document.activeElement,app.container.querySelector('textarea'));}finally{await app.close();}
});

test('failed saves keep the editable draft through minimize and recover with retry',async()=>{
 const app=await mount(stored('Saved earlier'));try{await app.click('Open Quick Notes');app.faults.write=true;await app.edit('Unsaved but still here');await app.click('Minimize Quick Notes');assert.equal(app.values.get(key),stored('Saved earlier'));await app.click('Open Quick Notes');assert.equal(app.container.querySelector('textarea')!.value,'Unsaved but still here');assert.match(app.container.querySelector('[role="alert"]')!.textContent!,/full or unavailable/);assert.match(app.container.querySelector('.quick-notes-save')!.textContent!,/Not saved/);app.faults.write=false;await app.click('Retry save');assert.equal(app.values.get(key),stored('Unsaved but still here'));assert.equal(app.container.querySelector('[role="alert"]'),null);}finally{await app.close();}
});

test('dirty cross-tab conflicts require explicit draft replacement before loading saved notes',async()=>{
 const app=await mount(stored('Earlier'));try{await app.click('Open Quick Notes');await app.edit('My local draft');app.values.set(key,stored('Other tab version'));await act(async()=>app.dom.window.dispatchEvent(new app.dom.window.StorageEvent('storage',{key,newValue:stored('Other tab version')})));await app.click('Retry save');assert.equal(app.values.get(key),stored('Other tab version'));assert.equal(app.container.querySelector('textarea')!.value,'My local draft');await app.click('Load saved note');await app.click('Keep note');assert.equal(app.container.querySelector('textarea')!.value,'My local draft');await app.click('Load saved note');await app.click('Load saved note and replace draft');assert.equal(app.container.querySelector('textarea')!.value,'Other tab version');assert.deepEqual(app.writes,[]);}finally{await app.close();}
});

test('mobile sheet restores focus and background interactivity when minimized with Escape',async()=>{
 const app=await mount(stored('Mobile thought'),375);
 try{
  await app.click('Open Quick Notes');
  const launcher=app.container.querySelector<HTMLButtonElement>('.quick-notes-launcher')!;
  const focusLauncher=launcher.focus.bind(launcher);
  // Real browsers reject focus while modal CSS hides the launcher; jsdom does not.
  launcher.focus=()=>{if(app.container.querySelector('.quick-notes')!.getAttribute('data-modal')!=='true')focusLauncher();};
  assert.equal(app.container.querySelector('[role="dialog"]')!.getAttribute('aria-modal'),'true');
  assert.equal(app.container.querySelector('main')!.hasAttribute('inert'),true);
  assert.equal(app.dom.window.document.activeElement,app.container.querySelector('textarea'));
  const controls=app.container.querySelectorAll<HTMLButtonElement>('[role="dialog"] button');
  const last=controls[controls.length-1];last.focus();
  await act(async()=>last.dispatchEvent(new app.dom.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true})));
  assert.equal(app.dom.window.document.activeElement,controls[0]);
  await act(async()=>app.dom.window.document.dispatchEvent(new app.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})));
  assert.equal(app.container.querySelector('[role="dialog"]'),null);
  assert.equal(app.container.querySelector('main')!.hasAttribute('inert'),false);
  assert.equal(app.dom.window.document.activeElement,launcher);
 }finally{await app.close();}
});

test('identity changes save the old draft to its original key without exposing it to the new identity',async()=>{
 const app=await mount();try{await app.click('Open Quick Notes');await app.edit('Only in this workspace');await app.render('another-workspace');assert.equal(app.values.get(key),stored('Only in this workspace'));await app.click('Open Quick Notes');assert.equal(app.container.querySelector('textarea')!.value,'');assert.equal(app.values.get(quickNotesKey('another-workspace')),undefined);}finally{await app.close();}
});

test('unreadable stored notes remain intact while new unsaved text remains available to copy',async()=>{
 const app=await mount('{unreadable');try{await app.click('Open Quick Notes');await app.edit('Keep this new draft too');await app.click('Retry save');assert.equal(app.values.get(key),'{unreadable');assert.equal(app.container.querySelector('textarea')!.value,'Keep this new draft too');assert.match(app.container.querySelector('.quick-notes-save')!.textContent!,/Not saved/);await app.click('Copy note');assert.equal(app.clipboard,'Keep this new draft too');assert.deepEqual(app.writes,[]);}finally{await app.close();}
});
