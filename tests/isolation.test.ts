import {test} from 'node:test';
import assert from 'node:assert/strict';
import {persistWorkLocked} from '../lib/storage';
import {operationalLog} from '../lib/privacy-log';
test('user writes and lock names never touch legacy or another user work',async()=>{const map=new Map([['quillora-work','legacy'],['user:b','B']]);const storage={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);}};let lock='';const locks={request:async(name:string,_options:unknown,callback:()=>unknown)=>{lock=name;return callback();}} as Pick<LockManager,'request'>;const a=await persistWorkLocked(storage,null,{saved:[],assignments:[]},locks,'user:a');assert.ok(a.ok);assert.equal(lock,'user:a-write');assert.equal(map.get('quillora-work'),'legacy');assert.equal(map.get('user:b'),'B');});
test('privacy logger emits only fixed event names, ignoring unrecognized inputs',()=>{const original=console.warn,lines:string[]=[];try{console.warn=(line:string)=>lines.push(line);operationalLog('rubric_rejected');operationalLog('private query or token' as never);assert.deepEqual(lines,['{"event":"rubric_rejected"}']);}finally{console.warn=original;}});
