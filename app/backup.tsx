'use client';
import { useEffect, useRef, useState } from 'react';
import { Work, parseWork, STORAGE_KEY, MAX_BACKUP_BYTES } from '../lib/work';
function download(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  try { const link = document.createElement('a'); link.href = url; link.download = name; link.click(); }
  finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
export function exportWork(work: Work, name = 'quillora-backup.json') {
  download(JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...work }, null, 2), name);
}
export default function Backup({work,ready,blocked,recoveryActive,onImport}:{work:Work;ready:boolean;blocked:boolean;recoveryActive:boolean;onImport:(work:Work)=>boolean}) {
  const [pending,setPending]=useState<Work|null>(null),[message,setMessage]=useState('');
  const failedImport=useRef<Work|null>(null);
  useEffect(()=>{if(!failedImport.current||recoveryActive)return;if(work!==failedImport.current){setPending(null);setMessage('Import saved after retry. Existing work was preserved.');}else setMessage('Attempted import discarded. The backup preview remains available to merge again.');failedImport.current=null;},[work,recoveryActive]);
  return <section className="backup" aria-label="Browser storage and backup">
    <p className="muted">Work is stored only in this browser, on this device and website address. It does not sync or have a server backup. Clearing site data, private browsing, or browser storage limits can remove it. Export a backup regularly; exported files include your rubric text and manually confirmed checklist progress.</p>
    <div className="backup-actions"><button className="outline" disabled={!ready} onClick={()=>{try{exportWork(work);setMessage('Backup download started. This includes saved work only.');}catch{setMessage('Backup download failed. Allow downloads and try again before clearing any site data.');}}}>Export backup</button>
    <label className="outline">Import backup<input aria-label="Import backup" type="file" accept=".json,application/json" disabled={!ready||blocked} onChange={async e=>{
      const input=e.currentTarget, file=input.files?.[0];setPending(null);if(!file)return;
      try {if(file.size>MAX_BACKUP_BYTES)throw Error('Choose a backup smaller than 10 MB. Nothing was imported.');const data=parseWork(JSON.parse(await file.text()));setPending(data);setMessage('Review the backup, then merge it. Existing work and checklist progress will be preserved.');}
      catch(err){setMessage(err instanceof Error?err.message:'This backup could not be read. Nothing was imported.');}finally{input.value='';}
    }}/></label>
    {blocked&&<button className="outline" onClick={()=>{try{download(localStorage.getItem(STORAGE_KEY)||'','quillora-stored-data.json');setMessage('Stored data download started. Keep it before repairing browser storage.');}catch{setMessage('Stored data cannot be accessed. Export backup can still download the loaded work.');}}}>Export stored data for recovery</button>}</div>
    {pending&&<div className="notice"><p>Backup contains {pending.assignments.length} assignments and {pending.saved.length} saved sources. Duplicate sources are kept once. Conflicting assignments or checklist progress become separate imported copies.</p>
    <button className="outline" disabled={blocked} onClick={()=>{if(onImport(pending)){setPending(null);setMessage('Backup merged and saved. Existing work was preserved.');}else {failedImport.current=work;setMessage('Import was not saved. Existing work is unchanged. Use Export attempted changes or Retry save above; no import was marked complete.');}}}>Merge backup</button> <button className="text-button" onClick={()=>{setPending(null);setMessage('Import preview closed. Previously saved work is unchanged.');}}>Cancel import</button></div>}
    {message&&<p role="status" className="muted">{message}</p>}
  </section>;
}
