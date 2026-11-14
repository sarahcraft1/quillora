import {canvasOrigin} from './types';
import {CanvasError} from './errors';
export const CANVAS_SCOPES=['url:GET|/api/v1/users/:id','url:GET|/api/v1/courses','url:GET|/api/v1/courses/:course_id/assignments'];
export type CanvasInstitution={origin:string;name:string;personalTokens:boolean;clientId?:string;clientSecret?:string};
export type CanvasConfig={institutions:CanvasInstitution[];key:Buffer;publicOrigin:string;databaseUrl:string};
export function canvasConfig(env:Record<string,string|undefined>=process.env):CanvasConfig|null{
 try{
  if(!env.QUILLORA_CANVAS_INSTITUTIONS||!env.QUILLORA_CANVAS_TOKEN_KEY||!env.QUILLORA_DATABASE_URL||!env.QUILLORA_PUBLIC_ORIGIN)return null;
  const publicUrl=new URL(env.QUILLORA_PUBLIC_ORIGIN);if(publicUrl.protocol!=='https:'||publicUrl.origin!==env.QUILLORA_PUBLIC_ORIGIN||publicUrl.username||publicUrl.password)return null;
  const key=Buffer.from(env.QUILLORA_CANVAS_TOKEN_KEY,'base64');if(key.length!==32||key.toString('base64')!==env.QUILLORA_CANVAS_TOKEN_KEY)return null;
  const raw:unknown=JSON.parse(env.QUILLORA_CANVAS_INSTITUTIONS);if(!Array.isArray(raw)||!raw.length||raw.length>100)return null;
  const institutions:CanvasInstitution[]=raw.map(v=>{
   if(!v||typeof v.origin!=='string'||canvasOrigin(v.origin)!==v.origin||typeof v.name!=='string'||!v.name.trim()||v.name.length>150||v.personalTokens!==true)throw new Error();
   if(v.clientId!==undefined&&(typeof v.clientId!=='string'||!/^\d{1,30}$/.test(v.clientId)))throw new Error();
   if(v.clientSecret!==undefined&&(typeof v.clientSecret!=='string'||!v.clientSecret.trim()))throw new Error();
   return {origin:v.origin,name:v.name.trim(),personalTokens:true,clientId:v.clientId,clientSecret:v.clientSecret};
  });
  if(new Set(institutions.map(i=>i.origin)).size!==institutions.length)return null;
  return {key,institutions,publicOrigin:publicUrl.origin,databaseUrl:env.QUILLORA_DATABASE_URL};
 }catch{return null;}
}
export function institutionFor(config:CanvasConfig,domain:string){let origin:string;try{origin=canvasOrigin(domain);}catch{throw new CanvasError('invalid_request');}const institution=config.institutions.find(i=>i.origin===origin);if(!institution)throw new CanvasError('institution_unsupported');return institution;}
