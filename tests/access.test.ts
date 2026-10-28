import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPair,SignJWT} from 'jose';
import {accessConfig,verifyAccess,localDevelopment} from '../lib/access';
import {middleware} from '../middleware';
import {NextRequest} from 'next/server';
const config={issuer:'https://test.cloudflareaccess.com',audience:'quillora',emails:['student@example.invalid']};
test('Access requires signature, audience, issuer, expiration, app type and invited email',async()=>{
 const keys=await generateKeyPair('RS256'),other=await generateKeyPair('RS256');
 const make=(claims:Record<string,unknown>={},key=keys.privateKey)=>new SignJWT({email:'student@example.invalid',type:'app',...claims}).setProtectedHeader({alg:'RS256'}).setSubject('student-A').setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(key);
 const valid=await make();const a=await verifyAccess(valid,config,async()=>keys.publicKey);assert.match(a.storageKey,/^quillora-work:user:[a-f0-9]{64}$/);
 for(const token of ['',valid+'x',await make({},other.privateKey),await make({email:'outsider@example.invalid'}),await make({type:'service'})])await assert.rejects(verifyAccess(token,config,async()=>keys.publicKey));
 for(const settings of [{...config,audience:'wrong'},{...config,issuer:'https://wrong.cloudflareaccess.com'}])await assert.rejects(verifyAccess(valid,settings,async()=>keys.publicKey));
 const expired=await new SignJWT({email:config.emails[0],type:'app'}).setProtectedHeader({alg:'RS256'}).setIssuer(config.issuer).setAudience(config.audience).setSubject('A').setIssuedAt().setExpirationTime(Math.floor(Date.now()/1000)-60).sign(keys.privateKey);await assert.rejects(verifyAccess(expired,config,async()=>keys.publicKey));
 const b=await new SignJWT({email:config.emails[0],type:'app'}).setProtectedHeader({alg:'RS256'}).setIssuer(config.issuer).setAudience(config.audience).setSubject('student-B').setIssuedAt().setExpirationTime('5m').sign(keys.privateKey);assert.notEqual(a.storageKey,(await verifyAccess(b,config,async()=>keys.publicKey)).storageKey);
});
test('production cannot enable local bypass; malformed issuer and empty allowlist fail closed',()=>{assert.equal(localDevelopment({NODE_ENV:'production',QUILLORA_ACCESS_MODE:'local'}),false);assert.equal(accessConfig({CF_ACCESS_ISSUER:'http://localhost',CF_ACCESS_AUD:'a',QUILLORA_ALLOWED_EMAILS:'a'}),null);assert.equal(accessConfig({CF_ACCESS_ISSUER:config.issuer,CF_ACCESS_AUD:'a',QUILLORA_ALLOWED_EMAILS:' , '}),null);});
test('unauthorized pages, APIs and spoofed identity are rejected; health exposes no configuration',async()=>{
 const saved={...process.env};try{Object.assign(process.env,{NODE_ENV:'production'});delete process.env.CF_ACCESS_ISSUER;
 for(const path of ['/','/api/search?q=private','/api/rubric','/api/session']){const r=await middleware(new NextRequest('https://pilot.invalid'+path,{headers:{'x-quillora-storage-key':'forged'}}));assert.equal(r.status,503);assert.ok(!(await r.text()).includes('forged'));}
 process.env.CF_ACCESS_ISSUER=config.issuer;process.env.CF_ACCESS_AUD=config.audience;process.env.QUILLORA_ALLOWED_EMAILS=config.emails[0];for(const path of ['/','/api/search','/api/rubric','/api/session'])assert.equal((await middleware(new NextRequest('https://origin.invalid'+path))).status,401);
 assert.equal((await middleware(new NextRequest('https://origin.invalid/api/health'))).status,200);
 }finally{for(const k of Object.keys(process.env))if(!(k in saved))delete process.env[k];Object.assign(process.env,saved);}
});
test('explicit development mode replaces spoofed identities and blocks cross-origin writes',async()=>{const saved={...process.env};try{Object.assign(process.env,{NODE_ENV:'development'});process.env.QUILLORA_ACCESS_MODE='local';const r=await middleware(new NextRequest('http://localhost/',{headers:{'x-quillora-storage-key':'forged'}}));assert.equal(r.headers.get('x-middleware-request-x-quillora-storage-key'),'quillora-work:local');assert.equal((await middleware(new NextRequest('http://localhost/api/rubric',{method:'POST',headers:{host:'localhost',origin:'http://localhost'}}))).status,200);assert.equal((await middleware(new NextRequest('http://localhost/api/rubric',{method:'POST',headers:{host:'localhost',origin:'https://outsider.invalid'}}))).status,403);}finally{for(const k of Object.keys(process.env))if(!(k in saved))delete process.env[k];Object.assign(process.env,saved);}});

test('missing required token claims fail even with a valid signature',async()=>{const keys=await generateKeyPair('RS256');const claims={iss:config.issuer,aud:config.audience,sub:'A',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+300,email:config.emails[0],type:'app'};for(const field of ['iss','aud','sub','iat','exp','email']){const missing={...claims};delete missing[field];const token=await new SignJWT(missing).setProtectedHeader({alg:'RS256'}).sign(keys.privateKey);await assert.rejects(verifyAccess(token,config,async()=>keys.publicKey));}});
