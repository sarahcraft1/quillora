import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dois=`10.1037/ppm0000185
10.1371/journal.pone.0193972
10.3389/fpsyg.2018.00072
10.1016/j.chb.2017.02.038
10.1037/cbs0000411
10.1017/S0144686X20001932
10.1038/171737a0
10.1126/science.169.3946.635
10.1126/science.1058040
10.1038/35057062
10.1038/nature12373
10.1126/science.1258096
10.1126/science.1156409
10.1038/nature14539
10.1038/nature16961
10.1038/nature14236
10.1038/nature24270
10.1038/s41586-021-03819-2
10.1038/s41586-020-2649-2
10.1056/NEJMoa2034577
10.1056/NEJMoa2035389
10.1056/NEJMoa2021436
10.1016/S0140-6736(20)30183-5
10.1016/S0140-6736(20)30566-3
10.1371/journal.pmed.0020124
10.1371/journal.pmed.1000097
10.1136/bmj.n71
10.1136/bmj.l4898
10.1186/1471-2105-10-421
10.1093/bioinformatics/btp163
10.1093/bioinformatics/btu170
10.1038/nmeth.1923
10.1038/nbt.1754
10.1038/nmeth.2019
10.1038/nmeth.2109
10.1038/nmeth.1226
10.1038/nmeth.1618
10.1038/nmeth.3317
10.1038/nbt.2954
10.1093/nar/gks1219
10.1093/nar/gky1121
10.1093/nar/gkaa1100
10.1016/j.caeai.2022.100049
10.1016/j.uclim.2025.102290
10.1093/geroni/igaf122.2051
10.33184/dokbsu-2018.1.8
10.1007/BF01397280
10.1002/andp.19053221004
10.1103/PhysRevLett.116.061102`.split('\n');
await mkdir('tests/fixtures/scholarly',{recursive:true});
let cached={records:[]};try{cached=JSON.parse(await readFile('tests/fixtures/scholarly/crossref-records.json','utf8'))}catch{}
const records=[...cached.records],failures=[];
for(const doi of dois){if(records.some(r=>r.doi===doi.toLowerCase()))continue;let lastError;
 for(let attempt=0;attempt<4;attempt++){await new Promise(r=>setTimeout(r,1100*(attempt+1)));try{const url='https://api.crossref.org/works/'+encodeURIComponent(doi);const response=await fetch(url,{headers:{'User-Agent':'Quillora-QA/1.0 (metadata-only validation)'},signal:AbortSignal.timeout(25000)});if(response.status===429){const seconds=Number(response.headers.get('retry-after'));if(seconds>0)await new Promise(r=>setTimeout(r,Math.min(seconds,60)*1000));throw Error('HTTP 429');}if(!response.ok)throw Error('HTTP '+response.status);const {message}=await response.json();if(message.DOI.toLowerCase()!==doi.toLowerCase())throw Error('DOI mismatch');const metadata=Object.fromEntries(['DOI','type','title','author','published','published-print','published-online','container-title','volume','issue','page','article-number','URL','language','relation','update-to'].filter(k=>message[k]!==undefined).map(k=>[k,message[k]]));records.push({doi:doi.toLowerCase(),recordUrl:url,retrievedAt:new Date().toISOString(),metadata,sha256:createHash('sha256').update(JSON.stringify(metadata)).digest('hex')});lastError=null;break;}catch(e){lastError=e.message;if(lastError==='HTTP 404')break;}}
 if(lastError)failures.push({doi,error:lastError});records.sort((a,b)=>a.doi.localeCompare(b.doi));await writeFile('tests/fixtures/scholarly/crossref-records.json',JSON.stringify({version:1,purpose:'Frozen real scholarly metadata; not citation gold standards or peer-review/OA verification',records,failures},null,2)+'\n');console.log('Recorded',records.length,'sources');}
console.log(JSON.stringify({records:records.length,failures}));if(records.length<40)process.exitCode=1;
