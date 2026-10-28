import React from 'react';
import {createRoot} from 'react-dom/client';
import Home from '../app/home';
import {persistWorkLocked} from '../lib/storage';
const key='quillora-work:user:disposable';
const output=document.getElementById('test-result')!;
const report=()=>{const w=JSON.parse(localStorage.getItem(key)||'{"saved":[],"assignments":[]}');output.textContent=JSON.stringify({assignments:w.assignments.length,sources:w.saved.length,questionLengths:w.assignments.map((a:{question:string})=>a.question.length),names:w.assignments.map((a:{name:string})=>a.name)});};
document.getElementById('seed')!.onclick=async()=>{if(localStorage.getItem(key)){output.textContent='Seed refused: disposable work already exists.';return;}localStorage.setItem(key,await(await fetch('/seed.json')).text());location.reload();};
document.getElementById('fill')!.onclick=()=>{let i=0;for(const size of [100000,1000,10,1]){while(true){try{localStorage.setItem('quota-filler-'+size+'-'+i++,'x'.repeat(size));}catch(e){if(!(e instanceof DOMException)||e.name!=='QuotaExceededError')throw e;break;}}}output.textContent='Actual browser QuotaExceededError reached; saved work still present. '+(localStorage.getItem(key)?.length||0)+' characters.';};
document.getElementById('free')!.onclick=()=>{for(const k of Object.keys(localStorage))if(k.startsWith('quota-filler-'))localStorage.removeItem(k);output.textContent='Only disposable filler removed.';};
document.getElementById('inspect')!.onclick=report;
document.getElementById('hold')!.onclick=()=>{void navigator.locks.request(key+'-write',()=>new Promise<void>(()=>{output.textContent='Disposable write lock held until this page closes.';}));};
createRoot(document.getElementById('root')!).render(<Home storageKey={key}/>);report();

document.getElementById('interrupt')!.onclick=()=>{void navigator.locks.request(key+'-write',()=>new Promise<void>(()=>{const previous=localStorage.getItem(key);const work=JSON.parse(previous!);work.assignments.push({...work.assignments[0],id:'interrupted',name:'INTERRUPTED MUST NOT PERSIST'});void persistWorkLocked(localStorage,previous,work,navigator.locks,key);setTimeout(()=>location.reload(),100);}));};
