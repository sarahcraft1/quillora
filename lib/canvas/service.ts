import {randomUUID} from 'node:crypto';
import {CanvasClient} from './client';
import {institutionFor,type CanvasConfig,type CanvasInstitution} from './config';
import {CanvasError,CANVAS_MESSAGES} from './errors';
import type {CanvasConnection,CanvasRepository} from './repository';
import type {CanvasSnapshot,CanvasStatus} from './types';
import {seal,unseal} from './vault';

type PersonalCredential={kind:'personal';accessToken:string;canvasUserId:string};
type Reader=Pick<CanvasClient,'validateToken'|'snapshot'>;
type ReaderFactory=(institution:CanvasInstitution,signal:AbortSignal)=>Reader;
export function requireCanvasOwner(owner:string){
 if(!/^quillora-work:user:[a-f0-9]{64}$/.test(owner))throw new CanvasError('account_required',401);
}
export function validPersonalToken(token:unknown):token is string{return typeof token==='string'&&/^[!-~]{1,10000}$/.test(token);}

/** Only verified server identities can address the vault. No token leaves this service. */
export class CanvasService{
 constructor(private config:CanvasConfig,private repository:CanvasRepository,private reader:ReaderFactory=(institution,signal)=>new CanvasClient(institution,fetch,signal)){}
 private statusFor(owner:string,connection:CanvasConnection|null):CanvasStatus{
  const snapshot=connection?.snapshotBox?unseal<CanvasSnapshot>(connection.snapshotBox,this.config.key,owner,connection.origin,'snapshot'):null;
  return {storageKey:owner,available:true,institutions:this.config.institutions.map(({origin,name})=>({origin,name})),connected:!!connection,snapshot,
   ...(connection?{origin:connection.origin,...(connection.lastSyncAt?{lastSyncAt:connection.lastSyncAt}:{}),...(connection.error?{error:Object.hasOwn(CANVAS_MESSAGES,connection.error)?connection.error:'unavailable'}:{})}:{})};
 }
 async status(owner:string){requireCanvasOwner(owner);return this.statusFor(owner,await this.repository.read(owner));}
 async connect(owner:string,institutionUrl:unknown,token:unknown){
  requireCanvasOwner(owner);
  if(typeof institutionUrl!=='string'||institutionUrl.length>300||!validPersonalToken(token))throw new CanvasError('invalid_request');
  const institution=institutionFor(this.config,institutionUrl);
  if(!institution.personalTokens)throw new CanvasError('institution_unsupported');
  // Advancing the epoch prevents an older connect completing after disconnect/reconnect.
  const epoch=await this.repository.beginConnection(owner);
  const reader=this.reader(institution,AbortSignal.timeout(90000));
  const user=await reader.validateToken(token);
  const snapshot=await reader.snapshot(token);
  const credential:PersonalCredential={kind:'personal',accessToken:token,canvasUserId:user.id};
  const connection:CanvasConnection={origin:institution.origin,clientId:'personal',generation:randomUUID(),tokenBox:seal(credential,this.config.key,owner,institution.origin,'tokens'),snapshotBox:seal(snapshot,this.config.key,owner,institution.origin,'snapshot'),lastSyncAt:snapshot.refreshedAt,error:null};
  if(!await this.repository.completeAuthorization(owner,epoch,connection))throw new CanvasError('conflict',409);
  return this.statusFor(owner,connection);
 }
 async refresh(owner:string){
  requireCanvasOwner(owner);
  const current=await this.repository.read(owner);if(!current)throw new CanvasError('connection_required',409);
  const held=await this.repository.beginSync(owner);if(!held)throw new CanvasError('operation_in_progress',409);
  const {connection,lease}=held;
  try{
   const institution=institutionFor(this.config,connection.origin);
   if(!institution.personalTokens)throw new CanvasError('institution_unsupported');
   let credential:PersonalCredential;
   try{credential=unseal<PersonalCredential>(connection.tokenBox,this.config.key,owner,connection.origin,'tokens');}catch{throw new CanvasError('authorization_expired',409);}
   if(credential.kind!=='personal'||!validPersonalToken(credential.accessToken))throw new CanvasError('authorization_expired',409);
   const snapshot=await this.reader(institution,AbortSignal.timeout(90000)).snapshot(credential.accessToken);
   const snapshotBox=seal(snapshot,this.config.key,owner,connection.origin,'snapshot');
   if(!await this.repository.finishSync(owner,connection.generation,lease,{snapshotBox,at:snapshot.refreshedAt}))throw new CanvasError('conflict',409);
   return this.statusFor(owner,{...connection,snapshotBox,lastSyncAt:snapshot.refreshedAt,error:null});
  }catch(error){
   const safe=error instanceof CanvasError?error:new CanvasError('unavailable',503);
   if(!await this.repository.finishSync(owner,connection.generation,lease,{error:safe.code}))throw new CanvasError('conflict',409);
   throw safe;
  }
 }
 async disconnect(owner:string){
  requireCanvasOwner(owner);await this.repository.disconnect(owner);
  // A PAT may authorize other applications; remove our copy without revoking it globally.
  return this.statusFor(owner,null);
 }
}
