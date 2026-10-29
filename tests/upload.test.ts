import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {boundedBody,singleUpload} from '../lib/upload';
import {extractInWorker} from '../lib/extraction';
import {POST} from '../app/api/rubric/route';
test('body cap applies without or with a dishonest length header',async()=>{for(const headers of [{},{'content-length':'1'},{'content-length':'99999999'}])await assert.rejects(boundedBody(new Request('http://local/',{method:'POST',body:'x'.repeat(100),headers}),10));});
test('concurrent rubric requests are refused; permit is released after failure',async()=>{let release!:()=>void;const first=singleUpload(()=>new Promise<void>(resolve=>release=resolve));await assert.rejects(singleUpload(async()=>''),/Another rubric/);release();await first;await assert.rejects(singleUpload(async()=>{throw Error('bad');}));assert.equal(await singleUpload(async()=>'ready'),'ready');});
test('worker parses real PDF and DOCX and rejects malformed/mismatched files',async()=>{for(const kind of ['pdf','docx'] as const){const text=await extractInWorker(readFileSync('tests/fixtures/rubric.'+kind),kind);assert.match(text,/five peer-reviewed/);await assert.rejects(extractInWorker(Buffer.from('malformed'),kind));}await assert.rejects(extractInWorker(readFileSync('tests/fixtures/rubric.pdf'),'docx'));});
test('worker timeout and unexpected process exit fail safely',async()=>{await assert.rejects(extractInWorker(readFileSync('tests/fixtures/rubric.pdf'),'pdf',1),/too long/);await assert.rejects(extractInWorker(Buffer.from('bad'),'pdf',1000,'missing-worker.mjs'),/limits|unavailable/);});
test('multipart errors and oversized actual body return practical errors',async()=>{for(const [req,status] of [[new Request('http://local/',{method:'POST',body:'not multipart'}),400],[new Request('http://local/',{method:'POST',body:'bad',headers:{'content-type':'multipart/form-data; boundary=x'}}),400],[new Request('http://local/',{method:'POST',body:'x'.repeat(10100001),headers:{'content-type':'multipart/form-data; boundary=x'}}),413]] as const)assert.equal((await POST(req)).status,status);});

test('DOCX preflight rejects actual inflate bombs and excessive entries',async()=>{
 const {deflateRawSync}=await import('node:zlib');const {checkDocx}=await import('../scripts/rubric-worker.mjs');
 const make=(raw:Buffer,declared:number,count=1)=>{const compressed=deflateRawSync(raw),name=Buffer.from('word/document.xml'),local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50);local.writeUInt16LE(8,8);local.writeUInt16LE(name.length,26);const central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50);central.writeUInt16LE(8,10);central.writeUInt32LE(compressed.length,20);central.writeUInt32LE(declared,24);central.writeUInt16LE(name.length,28);const offset=local.length+name.length+compressed.length,end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(count,8);end.writeUInt16LE(count,10);end.writeUInt32LE(central.length+name.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([local,name,compressed,central,name,end]);};
 for(const b of [make(Buffer.alloc(5000001),1),make(Buffer.from('xml'),3,513),Buffer.from('PK corrupt')])assert.throws(()=>checkDocx(b));
 const good=readFileSync('tests/fixtures/rubric.docx');checkDocx(good);const corrupted=Buffer.from(good);corrupted.writeUInt32LE(0,0);assert.throws(()=>checkDocx(corrupted));
});

test('slow upload is cancelled at its deadline before multipart parsing',async()=>{let cancelled=false;const body=new ReadableStream({cancel(){cancelled=true;}});const req=new Request('http://local/',{method:'POST',body,duplex:'half'} as RequestInit);await assert.rejects(boundedBody(req,100,5),/too long/);assert.equal(cancelled,true);});
test('PDF with 61 pages is rejected before text extraction',async()=>{
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Count 61 /Kids ['+Array.from({length:61},(_,i)=>(i+3)+' 0 R').join(' ')+'] >>',...Array.from({length:61},()=> '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 100 100] >>')];let pdf='%PDF-1.4\n',offsets=[0];for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(pdf));pdf+=(i+1)+' 0 obj\n'+objects[i]+'\nendobj\n';}const start=Buffer.byteLength(pdf);pdf+='xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF';await assert.rejects(extractInWorker(Buffer.from(pdf),'pdf'));
});
