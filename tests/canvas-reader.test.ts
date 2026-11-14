import {test} from 'node:test';
import assert from 'node:assert/strict';
import React,{act,useState} from 'react';
import {JSDOM} from 'jsdom';
import {CanvasDesk,CanvasSettings,useCanvasReader} from '../app/canvas-reader';
import {type CanvasSnapshot,type CanvasStatus} from '../lib/canvas/types';
import {type Work} from '../lib/work';

const storageKey='quillora-work:reader-test';
const origin='https://canvas.example.edu';
const snapshot:CanvasSnapshot={version:1,origin,refreshedAt:'2026-11-13T17:00:00Z',courses:[{id:'11',name:'Research seminar',code:'RES 101',url:origin+'/courses/11',timeZone:'America/Chicago'}],assignments:[{id:'23',courseId:'11',name:'A question worth following',url:origin+'/courses/11/assignments/23',description:'Read the assignment carefully. <script>plain instructions</script>',dueAt:'2026-11-20T06:30:00Z',rubric:[],submissionStatus:'unsubmitted'},{id:'24',courseId:'11',name:'Undated notebook',url:origin+'/courses/11/assignments/24',description:'',dueAt:null,rubric:[]}]};
const connected:CanvasStatus={storageKey,available:true,institutions:[{name:'Example Canvas',origin}],connected:true,origin,lastSyncAt:snapshot.refreshedAt,snapshot};
const blank:Work={saved:[],assignments:[]};
type Reply=(path:string,init?:RequestInit)=>Promise<Response>;
const reply=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
async function mount(fetcher:Reply,initial:Work=blank,accept=true){
 const dom=new JSDOM('<div id="root"></div>',{url:'https://quillora.example/'}),originals=new Map<string,PropertyDescriptor|undefined>();let saved:Work=initial,commits=0;
 for(const [key,value] of Object.entries({window:dom.window,self:dom.window,document:dom.window.document,navigator:dom.window.navigator,HTMLElement:dom.window.HTMLElement,React,IS_REACT_ACT_ENVIRONMENT:true,fetch:fetcher,localStorage:{getItem(){throw Error('Canvas may not read browser storage');},setItem(){throw Error('Canvas may not persist browser credentials');}}})){originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});}
 function Harness({namespace}:{namespace:string}){const reader=useCanvasReader(namespace),[work,setWork]=useState(initial);return React.createElement(React.Fragment,null,React.createElement(CanvasSettings,{reader}),React.createElement(CanvasDesk,{reader,work,onCommit:async(next:Work)=>{commits++;if(accept){saved=next;setWork(next);}return accept;},onOpen:()=>{}}));}
 const {createRoot}=await import('react-dom/client'),container=dom.window.document.getElementById('root')!,root=createRoot(container);
 await act(async()=>root.render(React.createElement(Harness,{namespace:storageKey})));
 const click=async(name:string,selector='button')=>{const button=(Array.from(container.querySelectorAll(selector)) as HTMLButtonElement[]).find(item=>item.textContent?.trim()===name||item.getAttribute('aria-label')===name);assert.ok(button,'Missing '+name);await act(async()=>button.click());};
 const change=async(selector:string,value:string)=>{const input=container.querySelector<HTMLInputElement|HTMLSelectElement>(selector)!;assert.ok(input,selector);const prototype=input.tagName==='SELECT'?dom.window.HTMLSelectElement.prototype:dom.window.HTMLInputElement.prototype;await act(async()=>{Object.getOwnPropertyDescriptor(prototype,'value')!.set!.call(input,value);input.dispatchEvent(new dom.window.Event(input.tagName==='SELECT'?'change':'input',{bubbles:true}));});};
 return {container,dom,click,change,get saved(){return saved;},get commits(){return commits;},async rerender(namespace:string){await act(async()=>root.render(React.createElement(Harness,{namespace})));},async close(){await act(async()=>root.unmount());dom.window.close();for(const [key,value] of originals){if(value)Object.defineProperty(globalThis,key,value);else Reflect.deleteProperty(globalThis,key);}}};
}

test('Canvas settings fails closed without a verified account and never renders a credential field',async()=>{
 const app=await mount(async()=>reply({...connected,available:false,reason:'account_required',connected:false,snapshot:null,institutions:[]}));
 try{assert.match(app.container.textContent!,/verified Quillora account/);assert.equal(app.container.querySelector('#canvas-token'),null);assert.equal(app.commits,0);}finally{await app.close();}
});

test('Canvas connection sends token only in request body, clears it immediately and displays safe errors',async()=>{
 const calls:{path:string;init?:RequestInit}[]=[];let respond:((response:Response)=>void)|undefined;
 const app=await mount(async(path,init)=>{calls.push({path,init});if(init?.method==='POST')return new Promise(resolve=>{respond=resolve;});return reply({...connected,connected:false,snapshot:null});});
 try{await app.change('#canvas-institution',origin);await app.change('#canvas-token','synthetic-personal-token');await act(async()=>app.container.querySelector('form')!.dispatchEvent(new app.dom.window.Event('submit',{bubbles:true,cancelable:true})));assert.equal(app.container.querySelector<HTMLInputElement>('#canvas-token')!.value,'');const sent=calls.find(call=>call.init?.method==='POST')!;assert.equal(sent.path,'/api/canvas');assert.deepEqual(JSON.parse(String(sent.init!.body)),{institutionUrl:origin,token:'synthetic-personal-token',storageKey});assert.equal(sent.init!.credentials,'same-origin');assert.doesNotMatch(app.container.textContent!,/synthetic-personal-token/);await act(async()=>respond!(reply({code:'authorization_expired',error:'Private response should not be echoed'},401)));assert.match(app.container.textContent!,/authorization expired/);assert.doesNotMatch(app.container.textContent!,/Private response/);assert.equal(app.commits,0);}finally{await app.close();}
});

test('failed refresh retains last success and Canvas cards, undated deadlines and inert description text',async()=>{
 const app=await mount(async(_path,init)=>init?.method==='POST'?reply({code:'unavailable'},503):reply(connected));
 try{assert.equal(app.container.querySelectorAll('.canvas-assignment').length,2);assert.match(app.container.textContent!,/No deadline listed/);assert.match(app.container.textContent!,/America\/Chicago/);assert.match(app.container.textContent!,/Not submitted/);assert.equal(app.container.querySelector('.canvas-description script'),null);assert.equal(app.container.querySelector<HTMLAnchorElement>('.canvas-assignment a')!.href,snapshot.assignments[0].url);await app.click('Refresh Canvas');assert.match(app.container.textContent!,/could not be reached/);assert.equal(app.container.querySelectorAll('.canvas-assignment').length,2);assert.equal(app.container.querySelector('time')!.getAttribute('datetime'),snapshot.refreshedAt);assert.equal(app.commits,0);}finally{await app.close();}
});

test('Canvas import links an existing research workspace, creates others and remains idempotent',async()=>{
 const initial:Work={saved:[],classes:[{id:'local-class',name:'Research seminar',code:'RES 101',icon:'book',color:'#52664a'}],assignments:[{id:'local-workspace',name:'My carefully edited title',question:'My original question',notes:'Research in progress',rubric:'My notes on the rubric',requirements:'Read methods',checklist:[{id:'r1',text:'Read methods',complete:true}],sources:[]}]};
 const app=await mount(async()=>reply(connected),initial);
 try{await app.click('Review courses & workspaces');await app.change('select[aria-label="Workspace for A question worth following"]','local-workspace');await app.click('Save Canvas to my desk');assert.equal(app.saved.classes!.length,1);assert.equal(app.saved.assignments.length,2);const linked=app.saved.assignments.find(a=>a.id==='local-workspace')!;assert.equal(linked.name,initial.assignments[0].name);assert.equal(linked.question,initial.assignments[0].question);assert.equal(linked.notes,initial.assignments[0].notes);assert.deepEqual(linked.checklist,initial.assignments[0].checklist);assert.equal(linked.canvas?.id,'23');assert.ok(app.container.querySelector('button[aria-label="Open research workspace: My carefully edited title"]'));await app.click('Review courses & workspaces');await app.click('Save Canvas to my desk');assert.equal(app.saved.assignments.length,2);assert.equal(app.saved.classes!.length,1);}finally{await app.close();}
});

test('a rejected Canvas import keeps review choices and existing research intact',async()=>{
 const app=await mount(async()=>reply(connected),blank,false);
 try{await app.click('Review courses & workspaces');await app.click('Save Canvas to my desk');assert.deepEqual(app.saved,blank);assert.equal(app.commits,1);assert.ok(app.container.querySelector('.canvas-import-review'));assert.match(app.container.textContent!,/Resolve the workspace save warning/);assert.doesNotMatch(app.container.textContent!,/Canvas saved to your desk/);}finally{await app.close();}
});

test('a status response from a different identity is rejected before showing Canvas data',async()=>{
 const app=await mount(async()=>reply({...connected,storageKey:'quillora-work:another-person'}));
 try{assert.match(app.container.textContent!,/session changed/);assert.equal(app.container.querySelectorAll('.canvas-assignment').length,0);assert.equal(app.container.querySelector('#canvas-token'),null);}finally{await app.close();}
});

test('Canvas explains empty active courses and permits importing courses without upcoming assignments',async()=>{
 const empty=await mount(async()=>reply({...connected,snapshot:{...snapshot,courses:[],assignments:[]}}));
 try{assert.match(empty.container.textContent!,/No active enrolled courses were returned/);assert.equal(empty.container.querySelectorAll('.canvas-assignment').length,0);assert.equal(empty.commits,0);}finally{await empty.close();}
 const coursesOnly=await mount(async()=>reply({...connected,snapshot:{...snapshot,assignments:[]}}));
 try{assert.match(coursesOnly.container.textContent!,/No upcoming or undated assignments/);await coursesOnly.click('Review courses & workspaces');await coursesOnly.click('Save Canvas to my desk');assert.equal(coursesOnly.saved.classes!.length,1);assert.equal(coursesOnly.saved.assignments.length,0);}finally{await coursesOnly.close();}
});
