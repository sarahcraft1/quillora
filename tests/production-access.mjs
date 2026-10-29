import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://127.0.0.1:3019';
const denied=Number(process.env.EXPECTED_DENIED_STATUS||503);
for(const path of ['/','/api/search?q=private-test','/api/session','/api/rubric','/api/health/extra','/api/search/']){
 const r=await fetch(base+path,{redirect:'follow',headers:{'x-quillora-storage-key':'forged','cf-access-jwt-assertion':'forged','x-middleware-subrequest':'middleware:middleware:middleware:middleware:middleware'}});assert.equal(r.status,denied,path);assert.equal(r.headers.get('cache-control'),'no-store');assert.ok(!(await r.text()).includes('forged'));
}
const r=await fetch(base+'/api/rubric',{method:'POST',body:'rejected before parser'});assert.equal(r.status,denied);
const health=await fetch(base+'/api/health');assert.equal(health.status,200);assert.deepEqual(await health.json(),{status:'ok'});
console.log('Production HTTP: unauthorized pages/APIs/spoofed headers denied; health returns only status.');
