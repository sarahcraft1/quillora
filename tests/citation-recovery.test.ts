import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React, {act} from 'react';
import {JSDOM} from 'jsdom';
import Home from '../app/home';
import {formatCitation} from '../lib/citations';
const seed=JSON.parse(readFileSync(new URL('./fixtures/checklist-workflow.json',import.meta.url),'utf8'));

// Deliberate API failures in JSDOM: not native browser permission tests.
test('SIMULATED copy failure clears prior success and provides selectable keyboard recovery in both styles',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/'});
 const originals=new Map<string,PropertyDescriptor|undefined>();let denied=false;
 const globals={window:dom.window,self:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,React,IS_REACT_ACT_ENVIRONMENT:true,localStorage:{getItem:()=>JSON.stringify(seed)},navigator:dom.window.navigator,ClipboardItem:undefined};
 for(const [key,value] of Object.entries(globals)){originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});}
 Object.defineProperty(dom.window.navigator,'clipboard',{value:{writeText:async()=>{if(denied)throw Error('Denied');}},configurable:true}); const {createRoot}=await import('react-dom/client');const container=dom.window.document.getElementById('root')!;const root=createRoot(container);
 const click=async(text:string)=>{const button=(Array.from(container.querySelectorAll('button')) as HTMLButtonElement[]).find(b=>b.textContent?.trim()===text);assert.ok(button,text);await act(async()=>button.click());};
 try{
  await act(async()=>root.render(React.createElement(Home)));await click('Saved sources1'); 
  const cite=(Array.from(container.querySelectorAll('button')) as HTMLButtonElement[]).find(b=>b.textContent?.includes('Cite'))!;await act(async()=>cite.click());
  for(const style of ['APA','MLA']){
   const select=container.querySelector('select')!;if(select.value!==style)await act(async()=>{select.value=style;select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});
   denied=false;await click('Copy citation');assert.match(container.querySelector('[role="dialog"] [role="status"]')!.textContent!,/Copied as plain text/);
   denied=true;await click('Copied');assert.ok(!container.querySelector('[role="dialog"] [role="status"]'),'failed retry must not retain prior success');
   assert.match(container.querySelector('[role="alert"]')!.textContent!,/manually/);
   const fallback=container.querySelector('textarea[aria-label="Citation for manual copying"]') as HTMLTextAreaElement;assert.ok(fallback,'keyboard selectable recovery field');assert.equal(fallback.readOnly,true);assert.equal(fallback.value,formatCitation(seed.saved[0],style));assert.equal(dom.window.document.activeElement,fallback);assert.equal(fallback.selectionStart,0);assert.equal(fallback.selectionEnd,fallback.value.length);
   denied=false;await click('Copy citation');assert.equal(container.querySelector('[role="dialog"] [role="alert"]'),null);assert.equal(container.querySelector('textarea[aria-label="Citation for manual copying"]'),null);
  }
 }finally{await act(async()=>root.unmount());dom.window.close();for(const [key,descriptor] of originals){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}}
});
