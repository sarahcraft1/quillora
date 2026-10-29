import {NextRequest,NextResponse} from 'next/server';
import {accessConfig,localDevelopment,verifyAccess} from './access';
export function validPublicOrigin(value:string|undefined){try{if(!value)return null;const url=new URL(value);return url.protocol==='https:'&&url.origin===value&&!url.username&&!url.password?value:null;}catch{return null;}}
export async function requestGate(req:NextRequest,env:Record<string,string|undefined>=process.env,verify:typeof verifyAccess=verifyAccess){
 const headers=new Headers(req.headers);headers.delete('x-quillora-storage-key');
 if(req.nextUrl.pathname==='/api/health')return NextResponse.next({request:{headers}});
 const publicOrigin=validPublicOrigin(env.QUILLORA_PUBLIC_ORIGIN);
 let storageKey:string;
 if(localDevelopment(env))storageKey='quillora-work:local';
 else {
  const config=accessConfig(env);
  if(!config||!publicOrigin)return deny(req,503,'Private access is not configured. Please contact the pilot organizer.');
  try{storageKey=(await verify(req.headers.get('cf-access-jwt-assertion')||'',config)).storageKey;}
  catch{return deny(req,401,'Access could not be verified. Open Quillora through your private invitation link and sign in again.');}
 }
 if(!localDevelopment(env)&&req.headers.get('host')?.toLowerCase()!==new URL(publicOrigin!).host.toLowerCase())return deny(req,403,'Open Quillora through the approved private website address.');
 headers.set('x-quillora-storage-key',storageKey);
 if(req.method!=='GET'&&req.method!=='HEAD'&&req.headers.get('origin')!==(localDevelopment(env)?'http://'+req.headers.get('host'):publicOrigin))return deny(req,403,'Open Quillora and retry this action from the same browser tab.');
 const response=NextResponse.next({request:{headers}});
 response.headers.set('Cache-Control','private, no-store');
 response.headers.set('Referrer-Policy','no-referrer');
 response.headers.set('X-Content-Type-Options','nosniff');
 response.headers.set('Content-Security-Policy',"frame-ancestors 'none'; object-src 'none'; base-uri 'self'");
 return response;
}
function deny(req:NextRequest,status:number,message:string){return req.nextUrl.pathname.startsWith('/api/')?NextResponse.json({error:message},{status,headers:{'Cache-Control':'no-store'}}):new NextResponse(message,{status,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
