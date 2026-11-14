import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import type {Pool} from 'pg';
import {CanvasService} from '../lib/canvas/service';
import {canvasHttp} from '../lib/canvas/http';
import {canvasConfig,type CanvasConfig} from '../lib/canvas/config';
import {CanvasError} from '../lib/canvas/errors';
import {PostgresCanvasRepository} from '../lib/canvas/postgres';
import {seal,unseal} from '../lib/canvas/vault';
import type {CanvasConnection,CanvasRepository} from '../lib/canvas/repository';
import type {CanvasSnapshot} from '../lib/canvas/types';

const owner='quillora-work:user:'+'a'.repeat(64),other='quillora-work:user:'+'b'.repeat(64);
const origin='https://canvas.example.edu';
const config:CanvasConfig={key:randomBytes(32),databaseUrl:'postgresql://runtime:placeholder@localhost/quillora_test',publicOrigin:'https://quillora.example.edu',institutions:[{origin,name:'Example College',personalTokens:true}]};
const snapshot=(at='2026-11-13T12:00:00Z'):CanvasSnapshot=>({version:1,origin,refreshedAt:at,courses:[{id:'1',name:'History',code:'HIST',timeZone:'America/Chicago',url:origin+'/courses/1'}],assignments:[]});

/** Mocked concurrency/ownership contract; this does not establish PostgreSQL/RLS correctness. */
class MemoryRepository implements CanvasRepository{
 connections=new Map<string,CanvasConnection>();epochs=new Map<string,number>();leases=new Map<string,string>();
 async read(owner:string){return this.connections.get(owner)||null;}
 async beginConnection(owner:string){const epoch=(this.epochs.get(owner)||0)+1;this.epochs.set(owner,epoch);return epoch;}
 async beginAuthorization(owner:string){return this.beginConnection(owner);}
 async consumeAuthorization(){return null;}
 async completeAuthorization(owner:string,epoch:number,connection:CanvasConnection){if(this.epochs.get(owner)!==epoch)return false;this.connections.set(owner,connection);this.leases.delete(owner);return true;}
 async beginSync(owner:string){const connection=this.connections.get(owner);if(!connection||this.leases.has(owner))return null;const lease='lease';this.leases.set(owner,lease);return {connection:{...connection},lease};}
 async updateTokens(){return false;}
 async finishSync(owner:string,generation:string,lease:string,result:{snapshotBox:string;at:string}|{error:string}){const connection=this.connections.get(owner);if(!connection||connection.generation!==generation||this.leases.get(owner)!==lease)return false;if('error' in result)connection.error=result.error;else Object.assign(connection,{snapshotBox:result.snapshotBox,lastSyncAt:result.at,error:null});this.leases.delete(owner);return true;}
 async disconnect(owner:string){await this.beginConnection(owner);const old=await this.read(owner);this.connections.delete(owner);this.leases.delete(owner);return old;}
}
function deferred<T>(){let resolve!:(value:T)=>void;const promise=new Promise<T>(r=>resolve=r);return {promise,resolve};}
function mockedService(repository=new MemoryRepository()){
 const requests:string[]=[];let fail=false;let pending:ReturnType<typeof deferred<CanvasSnapshot>>|undefined;
 const service=new CanvasService(config,repository,()=>({validateToken:async token=>{requests.push('validate:'+token);return {id:'5'};},snapshot:async token=>{requests.push('snapshot:'+token);if(fail)throw new CanvasError('unavailable',502);return pending?pending.promise:snapshot();}}));
 return {service,repository,requests,setFail:()=>{fail=true;},delay:()=>pending=deferred<CanvasSnapshot>()};
}

test('mocked Canvas connect validates first, encrypts per owner, and returns no credential',async()=>{
 const {service,repository,requests}=mockedService();const status=await service.connect(owner,origin,'synthetic-personal-token');
 assert.deepEqual(requests,['validate:synthetic-personal-token','snapshot:synthetic-personal-token']);assert.equal(status.connected,true);assert.deepEqual(status.snapshot,snapshot());
 const stored=repository.connections.get(owner)!;assert.ok(!JSON.stringify(stored).includes('synthetic-personal-token'));assert.ok(!JSON.stringify(status).includes('synthetic-personal-token'));
 assert.equal(unseal<{accessToken:string}>(stored.tokenBox,config.key,owner,origin,'tokens').accessToken,'synthetic-personal-token');
 assert.equal((await service.status(other)).connected,false);
 await assert.rejects(service.connect('quillora-work:local',origin,'token'),{code:'account_required'});
 await assert.rejects(service.connect(owner,'https://unregistered.example.edu','token'),{code:'institution_unsupported'});
 await assert.rejects(service.connect(owner,origin,'bad\r\ntoken'),{code:'invalid_request'});
});

test('vault rejects wrong owner, institution, purpose, key, and changed ciphertext',()=>{
 const box=seal({accessToken:'synthetic'},config.key,owner,origin,'tokens');
 for(const [key,identity,domain,purpose] of [[config.key,other,origin,'tokens'],[config.key,owner,'https://other.example.edu','tokens'],[config.key,owner,origin,'snapshot'],[randomBytes(32),owner,origin,'tokens']] as const)assert.throws(()=>unseal(box,key,identity,domain,purpose));
 const changed=JSON.parse(box);changed.data=Buffer.from('tampered').toString('base64');assert.throws(()=>unseal(JSON.stringify(changed),config.key,owner,origin,'tokens'));
});

test('mocked failed refresh preserves last success and disconnect removes only this owner',async()=>{
 const {service,repository,setFail}=mockedService();await service.connect(owner,origin,'synthetic');await service.connect(other,origin,'other-synthetic');
 const before=repository.connections.get(owner)!.snapshotBox;setFail();await assert.rejects(service.refresh(owner),{code:'unavailable'});
 const failed=await service.status(owner);assert.equal(failed.lastSyncAt,snapshot().refreshedAt);assert.equal(repository.connections.get(owner)!.snapshotBox,before);assert.equal(failed.error,'unavailable');
 await service.disconnect(owner);assert.equal((await service.status(owner)).connected,false);assert.equal((await service.status(other)).connected,true);
 await assert.rejects(service.refresh(owner),{code:'connection_required'});
});

test('mocked disconnect prevents delayed connect and delayed refresh from resurrecting credentials',async()=>{
 const setup=mockedService();const blocked=setup.delay();const connect=setup.service.connect(owner,origin,'synthetic');await new Promise(resolve=>setImmediate(resolve));await setup.service.disconnect(owner);blocked.resolve(snapshot());await assert.rejects(connect,{code:'conflict'});assert.equal((await setup.service.status(owner)).connected,false);
 const next=mockedService();await next.service.connect(owner,origin,'synthetic');const held=next.delay();const refresh=next.service.refresh(owner);await new Promise(resolve=>setImmediate(resolve));await assert.rejects(next.service.refresh(owner),{code:'operation_in_progress'});await next.service.disconnect(owner);held.resolve(snapshot());await assert.rejects(refresh,{code:'conflict'});assert.equal((await next.service.status(owner)).connected,false);
});

test('mocked successful refresh records a new snapshot and cannot overwrite a later reconnect',async()=>{
 const setup=mockedService();await setup.service.connect(owner,origin,'old-synthetic');
 const later=snapshot('2026-11-13T13:00:00Z');const successful=setup.delay();const first=setup.service.refresh(owner);successful.resolve(later);
 const refreshed=await first;assert.equal(refreshed.lastSyncAt,later.refreshedAt);assert.deepEqual(refreshed.snapshot,later);
 const delayed=setup.delay();const stale=setup.service.refresh(owner);await new Promise(resolve=>setImmediate(resolve));
 const replacement=mockedService(setup.repository);await replacement.service.connect(owner,origin,'replacement-synthetic');
 delayed.resolve(snapshot('2026-11-13T14:00:00Z'));await assert.rejects(stale,{code:'conflict'});
 const connected=await replacement.service.status(owner);assert.equal(connected.lastSyncAt,snapshot().refreshedAt);
 const stored=setup.repository.connections.get(owner)!;assert.equal(unseal<{accessToken:string}>(stored.tokenBox,config.key,owner,origin,'tokens').accessToken,'replacement-synthetic');
});

test('mocked failed replacement retains the previous connection and revoked institution approval prevents reads',async()=>{
 const setup=mockedService();await setup.service.connect(owner,origin,'old-synthetic');const before=setup.repository.connections.get(owner)!;
 const denied=new CanvasService(config,setup.repository,()=>({validateToken:async()=>{throw new CanvasError('authorization_expired',409);},snapshot:async()=>{throw Error('must not read');}}));
 await assert.rejects(denied.connect(owner,origin,'rejected-synthetic'),{code:'authorization_expired'});assert.equal(setup.repository.connections.get(owner),before);
 let requested=false;const unsupported=new CanvasService({...config,institutions:[{...config.institutions[0],personalTokens:false}]},setup.repository,()=>{requested=true;throw Error();});
 await assert.rejects(unsupported.refresh(owner),{code:'institution_unsupported'});assert.equal(requested,false);assert.equal(setup.repository.connections.get(owner)!.snapshotBox,before.snapshotBox);
});

const env={NODE_ENV:'production',CF_ACCESS_ISSUER:'https://example.cloudflareaccess.com',CF_ACCESS_AUD:'pilot',QUILLORA_ALLOWED_EMAILS:'synthetic@example.invalid'};
function request(method='GET',payload:unknown={storageKey:owner},extra:Record<string,string>={}){return new Request(config.publicOrigin+'/api/canvas',{method,headers:{host:new URL(config.publicOrigin).host,origin:config.publicOrigin,'content-type':'application/json','cf-access-jwt-assertion':'synthetic-assertion',...extra},...(method==='GET'?{}:{body:JSON.stringify(payload)})});}

test('Canvas HTTP independently rejects forged assertions, stale identities, cross-origin writes and oversized bodies',async()=>{
 let calls=0;const dependencies={env,config:()=>config,verify:async()=>({subject:'student',storageKey:owner}),service:()=>{calls++;return mockedService().service;}};
 const denied=await canvasHttp(request('POST',{storageKey:owner,token:'private-synthetic'}),'connect',{...dependencies,verify:async()=>{throw Error('raw private verifier detail');}});assert.equal(denied.status,401);assert.ok(!(await denied.text()).includes('raw private'));
 const stale=await canvasHttp(request('POST',{storageKey:other}),'connect',dependencies);assert.equal(stale.status,409);
 const csrf=await canvasHttp(request('POST',{storageKey:owner},{origin:'https://attacker.example.edu'}),'connect',dependencies);assert.equal(csrf.status,403);
 const oversized=await canvasHttp(request('POST',{storageKey:owner,token:'x'.repeat(20000)}),'connect',dependencies);assert.equal(oversized.status,413);assert.equal(calls,0);
 const valid=await canvasHttp(request(),'status',dependencies);assert.equal(valid.status,200);assert.equal(valid.headers.get('cache-control'),'private, no-store');assert.equal((await valid.json()).storageKey,owner);
});

test('local credentials fail closed and missing verified-account configuration explains setup',async()=>{
 const service=()=>{throw Error('must not access repository');};
 const local={env:{NODE_ENV:'development',QUILLORA_ACCESS_MODE:'local'},service};
 assert.equal((await canvasHttp(request('POST'),'connect',local)).status,401);
 const status=await canvasHttp(request(),'status',local);assert.equal((await status.json()).reason,'account_required');
 const missing=await canvasHttp(request(),'status',{env,service,verify:async()=>({subject:'student',storageKey:owner}),config:()=>null});assert.equal((await missing.json()).reason,'setup_required');
});

test('PAT configuration requires explicit institution approval and server-only key/database/HTTPS origin',()=>{
 const configured={QUILLORA_CANVAS_INSTITUTIONS:JSON.stringify([{origin,name:'Example College',personalTokens:true}]),QUILLORA_CANVAS_TOKEN_KEY:config.key.toString('base64'),QUILLORA_DATABASE_URL:config.databaseUrl,QUILLORA_PUBLIC_ORIGIN:config.publicOrigin};
 assert.equal(canvasConfig(configured)?.institutions[0].personalTokens,true);
 assert.equal(canvasConfig({...configured,QUILLORA_CANVAS_INSTITUTIONS:JSON.stringify([{origin,name:'No explicit approval'}])}),null);
 for(const field of Object.keys(configured))assert.equal(canvasConfig({...configured,[field]:''}),null);
 assert.equal(canvasConfig({...configured,QUILLORA_PUBLIC_ORIGIN:'http://localhost:3035'}),null);
});

test('mocked SQL adapter refuses privileged roles and missing forced RLS before reading connections',async()=>{
 for(const privileged of [true,false]){
  const queries:string[]=[];let released=false;
  const client={query:async(sql:string)=>{queries.push(sql);if(sql.startsWith('SELECT rolsuper'))return {rows:[{rolsuper:privileged,rolbypassrls:false}]};if(sql.startsWith('SELECT count'))return {rows:[{secured:false}]};return {rows:[]};},release:()=>{released=true;}};
  const repository=new PostgresCanvasRepository({connect:async()=>client} as unknown as Pool);
  await assert.rejects(repository.read(owner),{code:'setup_required'});assert.ok(queries.includes('ROLLBACK'));assert.ok(!queries.some(q=>q.startsWith('SELECT * FROM')));assert.equal(released,true);
 }
});
