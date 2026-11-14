import {decodeHTML} from 'entities';
import {CanvasError} from './errors';
import {type CanvasInstitution} from './config';
import {validCanvasId,validCanvasTimestamp,CANVAS_SUBMISSION_STATES,type CanvasSubmissionStatus,type CanvasCourse,type CanvasAssignment,type CanvasSnapshot} from './types';
export type CanvasTokens={accessToken:string;refreshToken:string;expiresAt:number};
type Fetcher=typeof fetch;
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
function id(value:unknown){const result=typeof value==='number'&&Number.isSafeInteger(value)?String(value):value;if(!validCanvasId(result))throw new CanvasError('invalid_response',502);return result;}
function text(value:unknown,max=50000){if(typeof value!=='string'||value.length>max)throw new CanvasError('invalid_response',502);return value;}
export function canvasPlainText(value:string){return decodeHTML(value.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'').replace(/<!--[^]*?-->/g,'').replace(/<br\s*\/?\s*>|<\/(p|div|li|h[1-6]|tr)>/gi,'\n').replace(/<li\b[^>]*>/gi,'• ').replace(/<[^>]*>/g,'')).replace(/\r/g,'').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim();}
export class CanvasClient{
 private requests=0;
 constructor(private institution:CanvasInstitution,private send:Fetcher=fetch,private signal?:AbortSignal){}
 private async request(url:URL,method:'GET'|'POST'|'DELETE',token?:string,form?:URLSearchParams){
  const allowed=url.pathname==='/login/oauth2/token'||(method==='GET'&&(url.pathname==='/api/v1/users/self'||/^\/api\/v1\/courses(?:\/[1-9]\d*\/assignments)?$/.test(url.pathname)));
  if(url.origin!==this.institution.origin||!allowed||url.username||url.password||url.hash||url.searchParams.has('access_token'))throw new CanvasError('invalid_response',502);
  if(++this.requests>100)throw new CanvasError('limit_exceeded',422);
  let response:Response;
  try{response=await this.send(url,{method,redirect:'error',cache:'no-store',signal:AbortSignal.any([AbortSignal.timeout(12000),...(this.signal?[this.signal]:[])]),headers:{Accept:'application/json+canvas-string-ids',...(token?{Authorization:'Bearer '+token}:{}),...(form?{'Content-Type':'application/x-www-form-urlencoded'}:{})},...(form?{body:form}:{} )});}catch{throw new CanvasError('unavailable',502);}
  if(!response.ok){await response.body?.cancel();throw new CanvasError(response.status===401?'authorization_expired':response.status===403?'permission_denied':'unavailable',response.status===401||response.status===403?409:502);}
  if(method==='DELETE'){await response.body?.cancel();return {data:null,link:null};}
  const reader=response.body?.getReader();if(!reader)throw new CanvasError('invalid_response',502);
  const chunks:Uint8Array[]=[];let size=0;
  try{for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>2_000_000){await reader.cancel();throw new CanvasError('limit_exceeded',422);}chunks.push(part.value);}}catch(e){if(e instanceof CanvasError)throw e;throw new CanvasError('unavailable',502);}
  let data:unknown;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new CanvasError('invalid_response',502);}
  return {data,link:response.headers.get('link')};
 }
 async token(grant:{code:string}|{refreshToken:string},redirectUri:string):Promise<CanvasTokens>{
  if(!this.institution.clientId||!this.institution.clientSecret)throw new CanvasError('setup_required',503);
  const form=new URLSearchParams({client_id:this.institution.clientId,client_secret:this.institution.clientSecret,redirect_uri:redirectUri,...('code' in grant?{grant_type:'authorization_code',code:grant.code}:{grant_type:'refresh_token',refresh_token:grant.refreshToken})});
  const {data}=await this.request(new URL('/login/oauth2/token',this.institution.origin),'POST',undefined,form);
  if(!object(data)||typeof data.access_token!=='string'||!data.access_token||data.access_token.length>10000||data.token_type!=='Bearer'||typeof data.expires_in!=='number'||!Number.isFinite(data.expires_in)||data.expires_in<=0||data.expires_in>86400)throw new CanvasError('invalid_response',502);
  const refreshToken=typeof data.refresh_token==='string'?data.refresh_token:('refreshToken' in grant?grant.refreshToken:'');
  if(!refreshToken||refreshToken.length>10000)throw new CanvasError('invalid_response',502);
  return {accessToken:data.access_token,refreshToken,expiresAt:Date.now()+data.expires_in*1000};
 }
 async revoke(token:string){await this.request(new URL('/login/oauth2/token',this.institution.origin),'DELETE',token);}
 async validateToken(token:string):Promise<{id:string}>{
  const {data}=await this.request(new URL('/api/v1/users/self',this.institution.origin),'GET',token);
  if(!object(data))throw new CanvasError('invalid_response',502);
  // Retain only the stable Canvas ID; names, email and account details are unnecessary.
  return {id:id(data.id)};
 }
 private async list(path:string,token:string,params:Record<string,string>={}){
  let url:URL|null=new URL(path,this.institution.origin);for(const [key,value] of Object.entries({...params,per_page:'100'}))url.searchParams.set(key,value);
  const seen=new Set<string>(),items:unknown[]=[];
  while(url){
   if(url.origin!==this.institution.origin||url.pathname!==path||seen.has(url.href))throw new CanvasError('invalid_response',502);seen.add(url.href);
   const result=await this.request(url,'GET',token);if(!Array.isArray(result.data))throw new CanvasError('invalid_response',502);items.push(...result.data);if(items.length>10000)throw new CanvasError('limit_exceeded',422);
   const next=result.link?.split(/,\s*(?=<)/).find(part=>/;\s*rel="next"(?:;|$)/.test(part));
   if(!next){url=null;continue;}const href=next.match(/^\s*<([^>]+)>/)?.[1];if(!href)throw new CanvasError('invalid_response',502);try{url=new URL(href);}catch{throw new CanvasError('invalid_response',502);}
  }
  return items;
 }
 async snapshot(token:string,now=new Date()):Promise<CanvasSnapshot>{
  const raw=await this.list('/api/v1/courses',token,{enrollment_state:'active',enrollment_type:'student'});const courses:CanvasCourse[]=[];
  for(const value of raw){if(!object(value))throw new CanvasError('invalid_response',502);if(value.workflow_state&&value.workflow_state!=='available')continue;
   const courseId=id(value.id),name=text(value.name,500).trim();if(!name)throw new CanvasError('invalid_response',502);
   const zone=typeof value.time_zone==='string'?value.time_zone:'UTC';try{new Intl.DateTimeFormat('en',{timeZone:zone});}catch{throw new CanvasError('invalid_response',502);}
   if(!courses.some(c=>c.id===courseId))courses.push({id:courseId,name,code:value.course_code==null?'':text(value.course_code,150),timeZone:zone,url:`${this.institution.origin}/courses/${courseId}`});
  }
  if(courses.length>100)throw new CanvasError('limit_exceeded',422);
  const assignments:CanvasAssignment[]=[];
  for(const course of courses){
   for(const value of await this.list(`/api/v1/courses/${course.id}/assignments`,token,{'include[]':'submission'})){
    if(!object(value))throw new CanvasError('invalid_response',502);if(value.published===false)continue;
    const assignmentId=id(value.id);if(value.course_id!==undefined&&id(value.course_id)!==course.id)throw new CanvasError('invalid_response',502);
    const dueAt=value.due_at==null?null:text(value.due_at,100);if(dueAt!==null&&!validCanvasTimestamp(dueAt))throw new CanvasError('invalid_response',502);
    if(dueAt&&Date.parse(dueAt)<now.getTime())continue;
    const name=text(value.name,500).trim();if(!name)throw new CanvasError('invalid_response',502);
    if(value.rubric!=null&&!Array.isArray(value.rubric))throw new CanvasError('invalid_response',502);
    const rubric=(value.rubric as unknown[]||[]).map(r=>{if(!object(r))throw new CanvasError('invalid_response',502);const points=r.points==null?null:r.points;if(points!==null&&(typeof points!=='number'||!Number.isFinite(points)||points<0))throw new CanvasError('invalid_response',502);return {id:text(r.id,100),description:canvasPlainText(text(r.description,1000)),detail:r.long_description==null?'':canvasPlainText(text(r.long_description,10000)),points:points as number|null};});
    if(rubric.length>100)throw new CanvasError('limit_exceeded',422);
    const state=object(value.submission)?value.submission.workflow_state:undefined;
    const submissionStatus=CANVAS_SUBMISSION_STATES.includes(state as CanvasSubmissionStatus)?state as CanvasSubmissionStatus:undefined;
    if(!assignments.some(a=>a.id===assignmentId&&a.courseId===course.id))assignments.push({id:assignmentId,courseId:course.id,name,url:`${this.institution.origin}/courses/${course.id}/assignments/${assignmentId}`,description:value.description==null?'':canvasPlainText(text(value.description)),dueAt,rubric,...(submissionStatus?{submissionStatus}:{})});
    if(assignments.length>2000)throw new CanvasError('limit_exceeded',422);
   }
  }
  const snapshot:CanvasSnapshot={version:1,origin:this.institution.origin,refreshedAt:now.toISOString(),courses,assignments};if(Buffer.byteLength(JSON.stringify(snapshot))>5_000_000)throw new CanvasError('limit_exceeded',422);return snapshot;
 }
}
