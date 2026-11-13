'use client';
import {useCallback,useEffect,useRef,useState,type CSSProperties} from 'react';
import {NotebookPen,Minus,Copy,Trash2,Check,RotateCcw} from 'lucide-react';
import {QUICK_NOTES_LIMIT,quickNotesKey,readQuickNote,saveQuickNote} from '../lib/quick-notes';
import {type StoragePort} from '../lib/storage';

export default function QuickNotes({storageKey,storage}:{storageKey:string;storage?:StoragePort}){
 const [open,setOpen]=useState(false),[text,setText]=useState(''),[ready,setReady]=useState(false),[status,setStatus]=useState('Opening your scratchpad…'),[error,setError]=useState(''),[copied,setCopied]=useState(''),[confirmation,setConfirmation]=useState<'clear'|'reload'|null>(null),[compact,setCompact]=useState(false),[viewport,setViewport]=useState({height:0,bottom:0});
 const root=useRef<HTMLDivElement>(null),panel=useRef<HTMLElement>(null),textarea=useRef<HTMLTextAreaElement>(null),launcher=useRef<HTMLButtonElement>(null),mounted=useRef(false),restoreFocus=useRef(false);
 const note=useRef({text:'',raw:null as string|null,ready:false,dirty:false,readable:false});
 const port=useCallback(()=>storage||localStorage,[storage]);
 const save=useCallback(()=>{
  const current=note.current;
  if(!current.ready||!current.dirty)return true;
  if(!current.readable){if(mounted.current){setStatus('Not saved');setError('The saved note could not be loaded. Copy your draft before loading the saved note again.');}return false;}
  let result;
  try{result=saveQuickNote(port(),storageKey,current.raw,current.text);}catch{result={ok:false as const,message:'Browser storage is unavailable. Copy your draft before refreshing.'};}
  if(result.ok){current.raw=result.raw;current.dirty=false;if(mounted.current){setStatus('Saved in this browser');setError('');}return true;}
  if(mounted.current){setStatus('Not saved');setError(result.message);}return false;
 },[port,storageKey]);
 const load=useCallback(()=>{
  let result;
  try{result=readQuickNote(port(),storageKey);}catch{result={ok:false as const,message:'Quick Notes storage is unavailable. Copy your draft before refreshing.'};}
  note.current.ready=true;setReady(true);
  if(result.ok){note.current={text:result.text,raw:result.raw,dirty:false,ready:true,readable:true};setText(result.text);setError('');setStatus('Saved in this browser');setCopied('');}
  else{note.current.readable=false;setStatus('Not saved');setError(result.message);}
 },[port,storageKey]);
 useEffect(()=>{
  mounted.current=true;load();
  function changed(event:StorageEvent){if(event.key!==quickNotesKey(storageKey)&&event.key!==null)return;if(note.current.dirty){setStatus('Not saved');setError('This note changed in another tab. Copy your draft, then load the saved note. Neither version was overwritten.');}else load();}
  function leaving(event:BeforeUnloadEvent){if(!save()&&note.current.dirty){event.preventDefault();event.returnValue='';}}
  function hiding(){save();}
  window.addEventListener('storage',changed);window.addEventListener('beforeunload',leaving);window.addEventListener('pagehide',hiding);
  return()=>{mounted.current=false;save();window.removeEventListener('storage',changed);window.removeEventListener('beforeunload',leaving);window.removeEventListener('pagehide',hiding);};
 },[load,save,storageKey]);
 useEffect(()=>{if(!ready||!note.current.dirty)return;const timer=setTimeout(save,400);return()=>clearTimeout(timer);},[text,ready,save]);
 useEffect(()=>{if(confirmation)panel.current?.querySelector<HTMLButtonElement>('.quick-notes-confirm .text-button')?.focus();},[confirmation]);
 useEffect(()=>{
  function resized(){const visual=window.visualViewport;setCompact(window.innerWidth<1280);setViewport({height:visual?.height||window.innerHeight,bottom:visual?Math.max(0,window.innerHeight-visual.height-visual.offsetTop):0});}
  resized();window.addEventListener('resize',resized);window.visualViewport?.addEventListener('resize',resized);window.visualViewport?.addEventListener('scroll',resized);
  return()=>{window.removeEventListener('resize',resized);window.visualViewport?.removeEventListener('resize',resized);window.visualViewport?.removeEventListener('scroll',resized);};
 },[]);
 const minimize=useCallback(()=>{save();restoreFocus.current=true;setOpen(false);setConfirmation(null);},[save]);
 useEffect(()=>{
  if(!open)return;
  textarea.current?.focus();
  const siblings=compact?Array.from(root.current?.parentElement?.children||[]).filter(element=>element!==root.current&&!element.hasAttribute('inert')):[];
  siblings.forEach(element=>element.setAttribute('inert',''));
  const previousOverflow=document.body.style.overflow;if(compact)document.body.style.overflow='hidden';
  function keys(event:KeyboardEvent){
   const inside=panel.current?.contains(document.activeElement);
   if(!compact&&!inside)return;
   if(event.key==='Escape'){event.preventDefault();event.stopPropagation();minimize();}
   if(event.key==='Tab'&&compact){const controls=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]),textarea:not([disabled])')||[]);const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
  }
  document.addEventListener('keydown',keys,true);
  return()=>{siblings.forEach(element=>element.removeAttribute('inert'));if(compact)document.body.style.overflow=previousOverflow;document.removeEventListener('keydown',keys,true);};
 },[open,compact,minimize]);
 useEffect(()=>{if(!open&&restoreFocus.current){restoreFocus.current=false;launcher.current?.focus();}},[open]);
 function edit(value:string){note.current.text=value;note.current.dirty=true;setText(value);setStatus(note.current.readable?'Saving…':'Not saved');setCopied('');}
 async function copy(){try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(note.current.text);setCopied('Note copied.');}catch{setCopied('Copy was unavailable. Select the note text and copy it manually.');textarea.current?.focus();textarea.current?.select();}}
 return <div ref={root} className="quick-notes" data-open={open} data-modal={open&&compact} style={{'--notes-visual-height':viewport.height?viewport.height+'px':'100dvh','--notes-keyboard-bottom':viewport.bottom+'px'} as CSSProperties}>
  <button ref={launcher} className="quick-notes-launcher" aria-label={open?'Minimize Quick Notes':'Open Quick Notes'} aria-expanded={open} aria-controls="quick-notes-panel" onClick={()=>open?minimize():setOpen(true)}><NotebookPen size={21}/><span>Quick Notes</span>{error&&<span className="quick-notes-unsaved" aria-label="Unsaved note"/>}</button>
  {open&&<>{compact&&<div className="quick-notes-backdrop" aria-hidden="true" onClick={minimize}/>}<section ref={panel} id="quick-notes-panel" className="quick-notes-panel" role="dialog" aria-modal={compact||undefined} aria-labelledby="quick-notes-title" aria-describedby="quick-notes-description">
   <div className="quick-notes-heading"><div><small>A LITTLE PAPER, ALWAYS HERE</small><h2 id="quick-notes-title">Quick Notes</h2></div><button className="quick-notes-minimize" aria-label="Minimize Quick Notes" onClick={minimize}><Minus size={20}/></button></div>
   <div className="quick-notes-body"><p id="quick-notes-description">A scratchpad for passing thoughts. Separate from assignment notes.</p>
   <label className="quick-notes-label" htmlFor="quick-notes-text">Your scratchpad</label><textarea ref={textarea} id="quick-notes-text" aria-describedby="quick-notes-limit" disabled={!ready} value={text} maxLength={QUICK_NOTES_LIMIT} onChange={event=>edit(event.target.value)} placeholder="A thought to come back to…" spellCheck/>
   <div className="quick-notes-save"><span role="status">{status==='Saved in this browser'&&<Check size={13}/>} {status}</span><small id="quick-notes-limit">{text.length.toLocaleString()} / 20,000</small></div>
   {error&&<div className="quick-notes-error" role="alert"><p>{error}</p><div><button onClick={save}><RotateCcw size={14}/>Retry save</button><button onClick={()=>setConfirmation('reload')}>Load saved note</button></div></div>}
   {confirmation?<div className="quick-notes-confirm"><p>{confirmation==='clear'?'Clear this scratchpad? Assignment research notes will stay unchanged.':'Replace this draft with the saved note? Copy any unsaved text first.'}</p><div><button className="outline" onClick={()=>{if(confirmation==='clear'){edit('');save();}else load();setConfirmation(null);textarea.current?.focus();}}>{confirmation==='clear'?'Clear scratchpad':'Load saved note and replace draft'}</button><button className="text-button" onClick={()=>{setConfirmation(null);textarea.current?.focus();}}>Keep note</button></div></div>:<div className="quick-notes-actions"><button className="outline" disabled={!text} onClick={copy}><Copy size={15}/>Copy note</button><button className="text-button" disabled={!text} onClick={()=>setConfirmation('clear')}><Trash2 size={15}/>Clear note</button></div>}
   {copied&&<p className="quick-notes-copy-status" role="status">{copied}</p>}
   <small className="quick-notes-footnote">Local to this browser. Copy important ideas into your research or a file; scratchpad text is not in research backups.</small></div>
  </section></>}
 </div>;
}
