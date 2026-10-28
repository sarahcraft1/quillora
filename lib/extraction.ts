import {fork} from 'node:child_process';
import path from 'node:path';
import {UploadError} from './upload';
export function extractInWorker(buffer:Buffer,kind:'pdf'|'docx',timeout=15000,worker=path.join(process.cwd(),'scripts/rubric-worker.mjs')):Promise<string>{
 return new Promise((resolve,reject)=>{
  const child=fork(worker,[],{execArgv:['--max-old-space-size=256'],stdio:['ignore','ignore','ignore','ipc'],env:{NODE_ENV:'production',PATH:process.env.PATH,SystemRoot:process.env.SystemRoot}});
  let settled=false;const finish=(error?:Error,text?:string)=>{if(settled)return;settled=true;clearTimeout(timer);child.kill('SIGKILL');error?reject(error):resolve(text!);};
  const timer=setTimeout(()=>finish(new UploadError('This file took too long to read. Paste the assignment instructions instead.')),timeout);
  child.once('error',()=>finish(new UploadError('File processing is unavailable. Paste your instructions instead.')));
  child.once('exit',()=>finish(new UploadError('This file exceeded processing limits or could not be read. Paste the instructions instead.')));
  child.once('message',(message:unknown)=>{const m=message as {text?:string};if(typeof m?.text!=='string'||!m.text.trim()||m.text.length>200000)return finish(new UploadError('We could not safely read this file. Use a shorter rubric or paste the instructions.'));finish(undefined,m.text);});
  child.send({kind,data:buffer.toString('base64')},error=>{if(error)finish(new UploadError('File processing is unavailable. Paste your instructions instead.'));});
 });
}
