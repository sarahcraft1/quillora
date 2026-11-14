import {Pool,type PoolClient} from 'pg';
import {randomUUID} from 'node:crypto';
import {CanvasError} from './errors';
import {type CanvasRepository,type CanvasConnection} from './repository';
function connection(row:Record<string,unknown>):CanvasConnection{return {origin:String(row.origin),clientId:String(row.client_id),generation:String(row.generation),tokenBox:String(row.token_box),snapshotBox:row.snapshot_box?String(row.snapshot_box):null,lastSyncAt:row.last_sync_at?new Date(row.last_sync_at as string).toISOString():null,error:row.last_error?String(row.last_error):null};}
export function createCanvasPool(connectionString:string,production=process.env.NODE_ENV==='production'){
 const url=new URL(connectionString);if(!['postgres:','postgresql:'].includes(url.protocol)||!url.hostname||!url.pathname.slice(1))throw new CanvasError('setup_required',503);
 const loopback=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
 return new Pool({host:url.hostname,port:Number(url.port||5432),user:decodeURIComponent(url.username),password:decodeURIComponent(url.password),database:decodeURIComponent(url.pathname.slice(1)),ssl:!production&&loopback?false:{rejectUnauthorized:true},max:5,connectionTimeoutMillis:5000,idleTimeoutMillis:10000,application_name:'quillora-canvas'});
}
/** Every operation scopes both its SQL and transaction-local RLS identity. */
export class PostgresCanvasRepository implements CanvasRepository{
 constructor(private pool:Pool){}
 private async own<T>(owner:string,action:(client:PoolClient)=>Promise<T>):Promise<T>{
  if(!/^quillora-work:user:[a-f0-9]{64}$/.test(owner))throw new CanvasError('account_required',401);
  const client=await this.pool.connect();try{await client.query('BEGIN');
   const role=await client.query('SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user');
   if(!role.rows[0]||role.rows[0].rolsuper||role.rows[0].rolbypassrls)throw new CanvasError('setup_required',503);
   const security=await client.query("SELECT count(*)=3 AND bool_and(relrowsecurity AND relforcerowsecurity) AS secured FROM pg_class WHERE oid IN (to_regclass('quillora_canvas_owners'),to_regclass('quillora_canvas_connections'),to_regclass('quillora_canvas_oauth_states'))");
   if(security.rows[0]?.secured!==true)throw new CanvasError('setup_required',503);
   await client.query("SELECT set_config('quillora.owner_id',$1,true)",[owner]);const result=await action(client);await client.query('COMMIT');return result;}catch(error){await client.query('ROLLBACK').catch(()=>{});throw error;}finally{client.release();}
 }
 read(owner:string){return this.own(owner,async db=>{const r=await db.query('SELECT * FROM quillora_canvas_connections WHERE owner_id=$1',[owner]);return r.rows[0]?connection(r.rows[0]):null;});}
 beginConnection(owner:string){return this.own(owner,async db=>{
  const r=await db.query('INSERT INTO quillora_canvas_owners(owner_id,epoch) VALUES($1,1) ON CONFLICT(owner_id) DO UPDATE SET epoch=quillora_canvas_owners.epoch+1 RETURNING epoch',[owner]);
  await db.query('DELETE FROM quillora_canvas_oauth_states WHERE owner_id=$1',[owner]);return Number(r.rows[0].epoch);
 });}
 beginAuthorization(owner:string,stateHash:string,nonceHash:string,origin:string){return this.own(owner,async db=>{
  const r=await db.query('INSERT INTO quillora_canvas_owners(owner_id,epoch) VALUES($1,1) ON CONFLICT(owner_id) DO UPDATE SET epoch=quillora_canvas_owners.epoch+1 RETURNING epoch',[owner]);
  await db.query('DELETE FROM quillora_canvas_oauth_states WHERE owner_id=$1',[owner]);
  await db.query("INSERT INTO quillora_canvas_oauth_states(owner_id,state_hash,nonce_hash,origin,epoch,expires_at) VALUES($1,$2,$3,$4,$5,now()+interval '10 minutes')",[owner,stateHash,nonceHash,origin,r.rows[0].epoch]);return Number(r.rows[0].epoch);
 });}
 consumeAuthorization(owner:string,stateHash:string,nonceHash:string){return this.own(owner,async db=>{const r=await db.query('DELETE FROM quillora_canvas_oauth_states WHERE owner_id=$1 AND state_hash=$2 AND nonce_hash=$3 AND expires_at>now() RETURNING origin,epoch',[owner,stateHash,nonceHash]);return r.rows[0]?{origin:String(r.rows[0].origin),epoch:Number(r.rows[0].epoch)}:null;});}
 completeAuthorization(owner:string,epoch:number,c:CanvasConnection){return this.own(owner,async db=>{
  const r=await db.query('SELECT epoch FROM quillora_canvas_owners WHERE owner_id=$1 FOR UPDATE',[owner]);if(Number(r.rows[0]?.epoch)!==epoch)return false;
  await db.query('INSERT INTO quillora_canvas_connections(owner_id,origin,client_id,generation,token_box,snapshot_box,last_sync_at) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(owner_id) DO UPDATE SET origin=EXCLUDED.origin,client_id=EXCLUDED.client_id,generation=EXCLUDED.generation,token_box=EXCLUDED.token_box,snapshot_box=EXCLUDED.snapshot_box,last_sync_at=EXCLUDED.last_sync_at,last_error=NULL,lease_id=NULL,lease_expires_at=NULL',[owner,c.origin,c.clientId,c.generation,c.tokenBox,c.snapshotBox,c.lastSyncAt]);return true;
 });}
 beginSync(owner:string){return this.own(owner,async db=>{const lease=randomUUID();const r=await db.query("UPDATE quillora_canvas_connections SET lease_id=$2,lease_expires_at=now()+interval '120 seconds' WHERE owner_id=$1 AND (lease_expires_at IS NULL OR lease_expires_at<now()) RETURNING *",[owner,lease]);return r.rows[0]?{connection:connection(r.rows[0]),lease}:null;});}
 updateTokens(owner:string,generation:string,lease:string,tokenBox:string){return this.own(owner,async db=>{const r=await db.query('UPDATE quillora_canvas_connections SET token_box=$4 WHERE owner_id=$1 AND generation=$2 AND lease_id=$3',[owner,generation,lease,tokenBox]);return r.rowCount===1;});}
 finishSync(owner:string,generation:string,lease:string,result:{snapshotBox:string;at:string}|{error:string}){return this.own(owner,async db=>{
  const r='error' in result?await db.query('UPDATE quillora_canvas_connections SET last_error=$4,lease_id=NULL,lease_expires_at=NULL WHERE owner_id=$1 AND generation=$2 AND lease_id=$3',[owner,generation,lease,result.error]):await db.query('UPDATE quillora_canvas_connections SET snapshot_box=$4,last_sync_at=$5,last_error=NULL,lease_id=NULL,lease_expires_at=NULL WHERE owner_id=$1 AND generation=$2 AND lease_id=$3',[owner,generation,lease,result.snapshotBox,result.at]);return r.rowCount===1;
 });}
 disconnect(owner:string){return this.own(owner,async db=>{
  await db.query('INSERT INTO quillora_canvas_owners(owner_id,epoch) VALUES($1,1) ON CONFLICT(owner_id) DO UPDATE SET epoch=quillora_canvas_owners.epoch+1',[owner]);await db.query('DELETE FROM quillora_canvas_oauth_states WHERE owner_id=$1',[owner]);const r=await db.query('DELETE FROM quillora_canvas_connections WHERE owner_id=$1 RETURNING *',[owner]);return r.rows[0]?connection(r.rows[0]):null;
 });}
}
