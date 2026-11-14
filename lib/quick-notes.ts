import {type StoragePort} from './storage';

export const QUICK_NOTES_LIMIT=20000;
export function quickNotesKey(workspaceKey:string){return workspaceKey+':quick-notes';}
export type QuickNoteRead={ok:true;text:string;raw:string|null}|{ok:false;message:string};
export type QuickNoteSave={ok:true;raw:string}|{ok:false;message:string;reason:'conflict'|'storage'|'limit'};

export function readQuickNote(storage:Pick<StoragePort,'getItem'>,workspaceKey:string):QuickNoteRead{
 try{
  const raw=storage.getItem(quickNotesKey(workspaceKey));
  if(raw===null)return {ok:true,text:'',raw};
  const value=JSON.parse(raw);
  if(value?.version!==1||typeof value.text!=='string'||value.text.length>QUICK_NOTES_LIMIT)return {ok:false,message:'Stored Quick Notes could not be read. The saved note has not been replaced.'};
  return {ok:true,text:value.text,raw};
 }catch{return {ok:false,message:'Quick Notes storage could not be read. Copy your draft before refreshing; the saved note has not been replaced.'};}
}

export function saveQuickNote(storage:StoragePort,workspaceKey:string,previousRaw:string|null,text:string):QuickNoteSave{
 if(text.length>QUICK_NOTES_LIMIT)return {ok:false,reason:'limit',message:'This scratchpad holds up to 20,000 characters. Copy your text before shortening it.'};
 try{
  if(storage.getItem(quickNotesKey(workspaceKey))!==previousRaw)return {ok:false,reason:'conflict',message:'This note changed in another tab. Copy your draft, then load the saved note. Neither version was overwritten.'};
  const raw=JSON.stringify({version:1,text});storage.setItem(quickNotesKey(workspaceKey),raw);return {ok:true,raw};
 }catch{return {ok:false,reason:'storage',message:'Browser storage is full or unavailable. Your draft is still here. Copy it before refreshing, or retry saving.'};}
}
