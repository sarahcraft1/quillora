import {accessConfig,localDevelopment,verifyAccess,type AccessIdentity} from '../access';
import {allowRequest} from '../rate-limit';
import {canvasConfig,type CanvasConfig} from './config';
import {CanvasError} from './errors';
import {requireCanvasOwner,type CanvasService} from './service';

type Environment=Record<string,string|undefined>;
type Operation='status'|'connect'|'refresh'|'disconnect';
type Dependencies={env?:Environment;verify?:typeof verifyAccess;config?:(env:Environment)=>CanvasConfig|null;service:(config:CanvasConfig)=>CanvasService};
const headers={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
function json(body:unknown,status=200){return Response.json(body,{status,headers});}
async function body(req:Request){
 if(!/^application\/json(?:;|$)/i.test(req.headers.get('content-type')||''))throw new CanvasError('invalid_request',415);
 if(Number(req.headers.get('content-length')||0)>16384)throw new CanvasError('invalid_request',413);
 const reader=req.body?.getReader();if(!reader)throw new CanvasError('invalid_request');
 const chunks:Uint8Array[]=[];let length=0;
 try{for(;;){const part=await reader.read();if(part.done)break;length+=part.value.byteLength;if(length>16384){await reader.cancel();throw new CanvasError('invalid_request',413);}chunks.push(part.value);}}
 catch(error){if(error instanceof CanvasError)throw error;throw new CanvasError('invalid_request');}
 try{const parsed:unknown=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error();return parsed as Record<string,unknown>;}catch{throw new CanvasError('invalid_request');}
}

/** Re-verifies the signed access assertion; the middleware header is never authorization. */
export async function canvasHttp(req:Request,operation:Operation,dependencies:Dependencies){
 try{
  const env=dependencies.env||process.env;
  if(localDevelopment(env)){
   if(operation!=='status')throw new CanvasError('account_required',401);
   return json({storageKey:'quillora-work:local',available:false,reason:'account_required',connected:false,institutions:[],snapshot:null});
  }
  const access=accessConfig(env);if(!access)throw new CanvasError('account_required',401);
  let identity:AccessIdentity;
  try{identity=await (dependencies.verify||verifyAccess)(req.headers.get('cf-access-jwt-assertion')||'',access);}catch{throw new CanvasError('account_required',401);}
  requireCanvasOwner(identity.storageKey);
  const config=(dependencies.config||canvasConfig)(env);
  if(!config){
   if(operation!=='status')throw new CanvasError('setup_required',503);
   return json({storageKey:identity.storageKey,available:false,reason:'setup_required',connected:false,institutions:[],snapshot:null});
  }
  if(req.headers.get('host')?.toLowerCase()!==new URL(config.publicOrigin).host.toLowerCase())throw new CanvasError('invalid_request',403);
  if(operation==='status')return json(await dependencies.service(config).status(identity.storageKey));
  if(req.headers.get('origin')!==config.publicOrigin)throw new CanvasError('invalid_request',403);
  const payload=await body(req);
  // A stale tab must not act on the newly signed-in user's connection.
  if(payload.storageKey!==identity.storageKey)throw new CanvasError('conflict',409);
  if(!allowRequest('canvas:'+identity.storageKey,8))return json({error:'Too many Canvas requests. Wait a minute before trying again.',code:'operation_in_progress'},429);
  const service=dependencies.service(config);
  return json(operation==='connect'?await service.connect(identity.storageKey,payload.institutionUrl,payload.token):operation==='refresh'?await service.refresh(identity.storageKey):await service.disconnect(identity.storageKey));
 }catch(error){const safe=error instanceof CanvasError?error:new CanvasError('unavailable',503);return json({error:safe.message,code:safe.code},safe.status);}
}
