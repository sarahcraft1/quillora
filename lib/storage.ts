import { STORAGE_KEY, type Work } from './work';
export type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
export type SaveResult = { ok: true; raw: string } | { ok: false; reason: 'quota' | 'unavailable' | 'conflict'; message: string };
export function persistWork(storage: StoragePort, previousRaw: string | null, next: Work): SaveResult {
  try {
    if (storage.getItem(STORAGE_KEY) !== previousRaw) return {ok:false,reason:'conflict',message:'Work changed in another tab. Export your attempted changes, then refresh before continuing. Previously saved work was not replaced.'};
    const raw = JSON.stringify(next);
    // Never remove or clear previously saved work to make space.
    storage.setItem(STORAGE_KEY, raw);
    return {ok:true,raw};
  } catch (error) {
    const quota = error && typeof error === 'object' && 'name' in error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    return {ok:false,reason:quota?'quota':'unavailable',message:quota
      ? 'Not saved: browser storage is full. Previously saved work is unchanged. Export attempted changes, free space for this site, then retry. Do not clear site data without a backup.'
      : 'Not saved: browser storage is unavailable. Previously saved work was not replaced. Export attempted changes, allow site storage, then retry.'};
  }
}
