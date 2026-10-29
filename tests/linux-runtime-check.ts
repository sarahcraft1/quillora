import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {POST} from '../app/api/rubric/route';
import {boundedBody} from '../lib/upload';
import {extractInWorker} from '../lib/extraction';
async function main(){
 const results:string[]=[];assert.equal(process.platform,'linux');assert.equal(Number(process.versions.node.split('.')[0]),24);assert.notEqual(process.getuid?.(),0);results.push('Linux Node 24; non-root runtime');
 const memory=readFileSync('/sys/fs/cgroup/memory.max','utf8').trim();assert.notEqual(memory,'max');assert.ok(Number(memory)<=1536*1024*1024);results.push('cgroup hard memory limit <=1536 MiB');
 const fixtures=path.join(process.cwd(),'qa/fixtures');
 const request=(name:string,data:Buffer,identity=name)=>{const form=new FormData();form.set('file',new File([new Uint8Array(data)],name));return new Request('http://localhost/api/rubric',{method:'POST',body:form,headers:{'x-quillora-storage-key':'qa-'+identity}});};
 for(const kind of ['pdf','docx']){const response=await POST(request('rubric.'+kind,readFileSync(path.join(fixtures,'rubric.'+kind))));assert.equal(response.status,200,await response.clone().text());assert.match((await response.json()).text,/five peer-reviewed/);results.push('production handler '+kind+' extraction');}
 for(const [name,bytes,status] of [['bad.pdf',Buffer.from('not a PDF'),422],['bad.docx',Buffer.from('not a ZIP'),422],['wrong.docx',readFileSync(path.join(fixtures,'rubric.pdf')),422],['large.pdf',Buffer.alloc(10000001),413]] as const){const r=await POST(request(name,bytes));assert.equal(r.status,status);results.push(name+' safely rejected '+status);}
 let release!:()=>void;const body=new ReadableStream<Uint8Array>({start(controller){release=()=>controller.close();}});const slow=new Request('http://localhost/api/rubric',{method:'POST',headers:{'content-type':'multipart/form-data; boundary=qa','x-quillora-storage-key':'qa-overlap'},body,duplex:'half'} as RequestInit);
 const first=POST(slow);const second=await POST(request('overlap.pdf',readFileSync(path.join(fixtures,'rubric.pdf'))));assert.equal(second.status,429);release();assert.equal((await first).status,400);results.push('overlapping upload refused; admission slot released');
 await assert.rejects(boundedBody(new Request('http://localhost/',{method:'POST',body:'x'.repeat(101)}),100));let cancelled=false;const stalled=new Request('http://localhost/',{method:'POST',body:new ReadableStream({cancel(){cancelled=true;}}),duplex:'half'} as RequestInit);await assert.rejects(boundedBody(stalled,100,10),/too long/);assert.ok(cancelled);results.push('streaming body cap and slow-upload cancellation');
 const pdf=readFileSync(path.join(fixtures,'rubric.pdf'));await assert.rejects(extractInWorker(pdf,'pdf',100,path.join(process.cwd(),'qa/hang.mjs')),/too long/);await assert.rejects(extractInWorker(pdf,'pdf',1000,path.join(process.cwd(),'qa/crash.mjs')),/limits|unavailable/);assert.match(await extractInWorker(pdf,'pdf'),/five peer-reviewed/);results.push('hung/crashed worker rejected; subsequent extraction recovers');
 // Execute original regression cases in the runtime image, not through an HTTP bypass.
 console.log(JSON.stringify({results,rssBytes:process.memoryUsage().rss,memoryLimitBytes:Number(memory)},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
