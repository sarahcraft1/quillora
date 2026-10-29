import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://localhost:3000';
const report=[];
async function upload(name,status){const form=new FormData();form.set('file',new File([await readFile('tests/fixtures/'+name)],name));const r=await fetch(base+'/api/rubric',{method:'POST',headers:{Origin:new URL(base).origin},body:form});const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));if(status===200){assert.match(d.text,/five peer-reviewed/);assert.match(d.text,/2020 and 2025/);}report.push({check:'rubric '+name,status:r.status});}
for(const [name,status] of [['rubric.pdf',200],['rubric.docx',200],['invalid.pdf',422],['unsupported.txt',400]])await upload(name,status);
assert.equal((await fetch(base+'/api/rubric',{method:'POST',headers:{Origin:new URL(base).origin},body:new FormData()})).status,400);
assert.equal((await fetch(base+'/api/search?q=%20')).status,400);
assert.equal((await fetch(base+'/api/search?q='+('x'.repeat(1001)))).status,400);
const records=[];
async function live(url){for(let attempt=1;attempt<=3;attempt++){await new Promise(r=>setTimeout(r,1200*attempt));const response=await fetch(url);if(![429,503].includes(response.status)||attempt===3)return response;report.push({check:'transient live request',status:response.status,attempt});}}

for(const q of ['Social connection and well-being','Urban climate adaptation','Artificial intelligence in education']){const r=await live(base+'/api/search?q='+encodeURIComponent(q));const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));assert.ok(d.articles.length);const a=d.articles.find(a=>a.authors.length>1)||d.articles[0];assert.equal(a.free,false);assert.match(a.url,/^https:\/\/doi.org\//);const mr=await live('https://api.crossref.org/works/'+encodeURIComponent(a.id));assert.equal(mr.status,200);const metadata=await mr.json();assert.equal(a.title,metadata.message.title[0].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());records.push(a);report.push({check:'live search '+q,count:d.articles.length,sample:a.id});}
if(process.env.UPDATE_FIXTURES==='1')await writeFile('tests/fixtures/live-records.json',JSON.stringify(records,null,2));
console.log(JSON.stringify(report,null,2));
