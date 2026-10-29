import {createRemoteJWKSet} from 'jose/jwks/remote';
import {jwtVerify} from 'jose/jwt/verify';
import type {JWTVerifyGetKey} from 'jose/jwt/verify';
export type AccessIdentity = {subject:string; storageKey:string};
export type AccessConfig = {issuer:string; audience:string; emails:string[]};
export function accessConfig(env:Record<string,string|undefined>=process.env):AccessConfig|null {
 const issuer=env.CF_ACCESS_ISSUER?.replace(/\/$/,'');
 if(!issuer||!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer)||!env.CF_ACCESS_AUD||!env.QUILLORA_ALLOWED_EMAILS)return null;
 const emails=env.QUILLORA_ALLOWED_EMAILS.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
 return emails.length?{issuer,audience:env.CF_ACCESS_AUD,emails}:null;
}
let cached:{issuer:string;key:JWTVerifyGetKey}|undefined;
export async function verifyAccess(token:string,config:AccessConfig,key?:JWTVerifyGetKey):Promise<AccessIdentity>{
 if(!key){if(cached?.issuer!==config.issuer)cached={issuer:config.issuer,key:createRemoteJWKSet(new URL(config.issuer+'/cdn-cgi/access/certs'),{timeoutDuration:4000})};key=cached!.key;}
 const {payload}=await jwtVerify(token,key,{issuer:config.issuer,audience:config.audience,algorithms:['RS256'],requiredClaims:['exp','iat','sub','email'],clockTolerance:5});
 if(typeof payload.sub!=='string'||!payload.sub.trim()||typeof payload.email!=='string'||!config.emails.includes(payload.email.toLowerCase())||payload.type!=='app')throw Error('Access denied');
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(config.issuer+'\0'+payload.sub));
 return {subject:payload.sub,storageKey:'quillora-work:user:'+Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('')};
}
export function localDevelopment(env:Record<string,string|undefined>=process.env){return env.NODE_ENV==='development' && env.QUILLORA_ACCESS_MODE==='local';}
