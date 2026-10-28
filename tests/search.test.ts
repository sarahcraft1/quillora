import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GET} from '../app/api/search/route';
test('search service failures and malformed responses return a useful error instead of results',async()=>{const real=globalThis.fetch;try{for(const scenario of ['offline','rate-limit','malformed']){globalThis.fetch=(async()=>{if(scenario==='offline')throw Error('offline');return scenario==='rate-limit'?new Response('',{status:429}):Response.json({message:{items:null}});}) as typeof fetch;const response=await GET(new Request('http://localhost/api/search?q=test'));assert.equal(response.status,503);const data=await response.json();assert.match(data.error,/Crossref is unavailable/);assert.equal(data.articles,undefined);}}finally{globalThis.fetch=real;}});
