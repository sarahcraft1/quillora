import { STORAGE_KEY, type Work } from './work';
export type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
export type SaveResult = { ok: true; raw: string } | { ok: false; reason: 'quota' | 'unavailable' | 'conflict'; message: string };
export function persistWork(storage: StoragePort, previousRaw: string | null, next: Work,key=STORAGE_KEY): SaveResult {
  try {
    if (storage.getItem(key) !== previousRaw) return {ok:false,reason:'conflict',message:'Work changed in another tab. Export your attempted changes, then refresh before continuing. Previously saved work was not replaced.'};
    const raw = JSON.stringify(next);
    // Never remove or clear previously saved work to make space.
    storage.setItem(key, raw);
    return {ok:true,raw};
  } catch (error) {
    const quota = error && typeof error === 'object' && 'name' in error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    return {ok:false,reason:quota?'quota':'unavailable',message:quota
      ? 'Not saved: browser storage is full. Previously saved work is unchanged. Export attempted changes, free space for this site, then retry. Do not clear site data without a backup.'
      : 'Not saved: browser storage is unavailable. Previously saved work was not replaced. Export attempted changes, allow site storage, then retry.'};
  }
}
/** Cooperating beta tabs serialize the read/compare/write section on secure origins. */
export async function persistWorkLocked(storage:StoragePort,previousRaw:string|null,next:Work,locks?:Pick<LockManager,'request'>,key=STORAGE_KEY):Promise<SaveResult>{
  if(!locks)return persistWork(storage,previousRaw,next,key);
  try{return await locks.request(key+'-write',{signal:AbortSignal.timeout(5000)},()=>persistWork(storage,previousRaw,next,key));}
  catch{return {ok:false,reason:'unavailable',message:'Not saved: browser save coordination is unavailable. Previously saved work was not replaced. Export attempted changes, then retry.'};}
}
