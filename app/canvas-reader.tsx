'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {ExternalLink,RefreshCw} from 'lucide-react';
import {type Assignment,type Work} from '../lib/work';
import {type CanvasAssignment,type CanvasStatus} from '../lib/canvas/types';
import {CANVAS_MESSAGES,type CanvasErrorCode} from '../lib/canvas/errors';
import {canvasAssignmentKey,importCanvas,suggestCanvasClasses} from '../lib/canvas/import';

const connectionFailure='Canvas could not be reached. Your saved research is unchanged. Try again.';
function responseMessage(value:unknown){
 if(value&&typeof value==='object'){
  const item=value as {code?:unknown;error?:unknown};
  const code=typeof item.code==='string'?item.code:typeof item.error==='string'?item.error:'';
  if(Object.hasOwn(CANVAS_MESSAGES,code))return CANVAS_MESSAGES[code as CanvasErrorCode];
 }
 return connectionFailure;
}
function timestamp(value?:string){return value&&Number.isFinite(Date.parse(value))?new Intl.DateTimeFormat('en',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'Not yet refreshed';}
function dueLabel(item:CanvasAssignment,timeZone:string){return item.dueAt?'Due '+new Intl.DateTimeFormat('en',{dateStyle:'medium',timeStyle:'short',timeZone}).format(new Date(item.dueAt))+' ('+timeZone+')':'No deadline listed';}
const submissionLabels={unsubmitted:'Not submitted',submitted:'Submitted',pending_review:'Pending review',graded:'Graded'};

/** Canvas credentials live only in an in-flight request and the server vault. */
export function useCanvasReader(storageKey:string){
 const [status,setStatus]=useState<CanvasStatus|null>(null),[loading,setLoading]=useState(true),[pending,setPending]=useState<string|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const requestId=useRef(0),activeKey=useRef(storageKey),busy=useRef(false);
 activeKey.current=storageKey;
 const request=useCallback(async(method:'GET'|'POST'|'DELETE',path='/api/canvas',body?:Record<string,string>,action?:string)=>{
  if(method!=='GET'&&busy.current)return false;
  if(method!=='GET')busy.current=true;
  const id=++requestId.current,key=storageKey;
  if(method==='GET')setLoading(true);else setPending(action||'Working');
  setError('');setNotice('');
  try{
   const response=await fetch(path,{method,credentials:'same-origin',cache:'no-store',...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,storageKey:key})}:{})});
   const data:unknown=await response.json();
   if(id!==requestId.current||key!==activeKey.current)return false;
   if(!response.ok){setError(responseMessage(data));return false;}
   const next=data as CanvasStatus;
   if(!next||next.storageKey!==key||typeof next.available!=='boolean'||typeof next.connected!=='boolean'||!Array.isArray(next.institutions)){
    setStatus(null);setError('Your Quillora session changed. Reload the page before connecting Canvas.');return false;
   }
   setStatus(next);
   if(method!=='GET')setNotice(method==='DELETE'?'Canvas disconnected. Imported classes, workspaces and research are still here.':'Canvas refreshed. Review the courses and assignments on My Desk.');
   return true;
  }catch{if(id===requestId.current&&key===activeKey.current)setError(connectionFailure);return false;}
  finally{if(method!=='GET')busy.current=false;if(id===requestId.current&&key===activeKey.current){setLoading(false);setPending(null);}}
 },[storageKey]);
 const load=useCallback(()=>request('GET'),[request]);
 useEffect(()=>{setStatus(null);setPending(null);busy.current=false;void load();return()=>{requestId.current++;};},[load]);
 return {status:status?.storageKey===storageKey?status:null,loading,pending,error,notice,load,connect:(institutionUrl:string,token:string)=>request('POST','/api/canvas',{institutionUrl,token},'Connecting Canvas'),refresh:()=>request('POST','/api/canvas/refresh',{},'Refreshing Canvas'),disconnect:()=>request('DELETE','/api/canvas',{},'Disconnecting Canvas')};
}
export type CanvasReader=ReturnType<typeof useCanvasReader>;

export function CanvasSettings({reader}:{reader:CanvasReader}){
 const [institution,setInstitution]=useState(''),[token,setToken]=useState(''),[reconnecting,setReconnecting]=useState(false),[confirmDisconnect,setConfirmDisconnect]=useState(false);
 const settingsRoot=useRef<HTMLElement>(null);
 const {status,pending,loading,error,notice}=reader;
 const disabled=!!pending||loading;
 useEffect(()=>{setToken('');setConfirmDisconnect(false);setReconnecting(false);setInstitution(status?.origin||'');},[status?.storageKey,status?.origin,status?.connected]);
 useEffect(()=>{const panel=settingsRoot.current?.closest('details');function clear(){if(panel&&!panel.open)setToken('');}panel?.addEventListener('toggle',clear);return()=>panel?.removeEventListener('toggle',clear);},[]);
 return <section ref={settingsRoot} className="canvas-settings" aria-labelledby="canvas-settings-title">
  <div className="eyebrow">OPTIONAL / READ ONLY</div><h2 id="canvas-settings-title">Connect Canvas</h2>
  <p>Bring your courses and upcoming assignments to My Desk. Canvas remains the place to submit your work.</p>
  {loading&&<p role="status">Checking Canvas connection…</p>}
  {error&&<p className="canvas-feedback" role="alert">{error}</p>}
  {notice&&<p className="canvas-feedback" role="status">{notice}</p>}
  {status&&!status.available&&<div className="canvas-unavailable"><p>{status.reason==='account_required'?CANVAS_MESSAGES.account_required:CANVAS_MESSAGES.setup_required}</p><p className="muted">Your existing research remains available. A verified account and secure server storage are required before credentials can be accepted.</p></div>}
  {status?.connected&&<div className="canvas-connection"><strong>Connected to {status.institutions.find(i=>i.origin===status.origin)?.name||status.origin}</strong><p className="canvas-origin">{status.origin}</p><p>Last successful sync: <time dateTime={status.lastSyncAt}>{timestamp(status.lastSyncAt)}</time></p>{status.error&&<p role="alert">{Object.hasOwn(CANVAS_MESSAGES,status.error)?CANVAS_MESSAGES[status.error as CanvasErrorCode]:'The last Canvas refresh failed. Your earlier data is still available.'}</p>}<div className="canvas-actions"><button className="outline" disabled={disabled} onClick={()=>void reader.refresh()}><RefreshCw size={14}/> Refresh Canvas</button><button className="text-button" disabled={disabled} onClick={()=>{setReconnecting(v=>!v);setToken('');}}>Reconnect Canvas</button><button className="text-button" disabled={disabled} onClick={()=>setConfirmDisconnect(true)}>Disconnect Canvas</button></div></div>}
  {status?.available&&(!status.connected||reconnecting)&&<form className="canvas-connect-form" onSubmit={async e=>{e.preventDefault();const supplied=token;setToken('');if(await reader.connect(institution.trim(),supplied))setReconnecting(false);}}>
   <label htmlFor="canvas-institution">Canvas institution URL<input id="canvas-institution" type="url" required placeholder="https://canvas.your-institution.edu" autoComplete="url" list="canvas-institutions" maxLength={500} value={institution} disabled={disabled} onChange={e=>setInstitution(e.target.value)}/></label>
   <datalist id="canvas-institutions">{status.institutions.map(item=><option key={item.origin} value={item.origin}>{item.name}</option>)}</datalist>
   <label htmlFor="canvas-token">Personal access token<input id="canvas-token" type="password" required autoComplete="off" spellCheck={false} maxLength={4096} value={token} disabled={disabled} onChange={e=>setToken(e.target.value)} aria-describedby="canvas-token-help"/></label>
   <p id="canvas-token-help" className="muted">Use a token only for your own permitted testing. Canvas requires OAuth for applications used by multiple people. The token is sent securely to this server and stored encrypted, separate from browser research and backups. Quillora only reads courses and assignments. A personal token may have broader permissions in Canvas.</p>
   <p className="muted">Supported institutions: {status.institutions.map(item=>item.name).join(', ')||'No institutions configured'}.</p>
   <div className="canvas-actions"><button className="primary" disabled={disabled||!token.trim()}>{status.connected?'Validate and reconnect':'Validate and connect'}</button>{reconnecting&&<button type="button" className="text-button" disabled={disabled} onClick={()=>{setReconnecting(false);setToken('');}}>Cancel reconnect</button>}</div>
  </form>}
  {confirmDisconnect&&<div className="canvas-confirm" role="group" aria-label="Confirm Canvas disconnect"><p>Disconnect this Canvas account? Your imported classes, assignments, notes and research will stay in Quillora. This removes the server’s saved token; you can revoke the personal token in Canvas settings.</p><div className="canvas-actions"><button className="outline" disabled={disabled} onClick={async()=>{if(await reader.disconnect())setConfirmDisconnect(false);}}>Confirm disconnect</button><button className="text-button" disabled={disabled} onClick={()=>setConfirmDisconnect(false)}>Keep connection</button></div></div>}
  {pending&&<p role="status">{pending}…</p>}
  {!loading&&!status&&<button className="outline" onClick={()=>void reader.load()}>Retry Canvas status</button>}
 </section>;
}

export function CanvasDesk({reader,work,onCommit,onOpen}:{reader:CanvasReader;work:Work;onCommit:(next:Work)=>Promise<boolean>;onOpen:(assignment:Assignment)=>void}){
 const {status,pending,loading,error}=reader,snapshot=status?.snapshot;
 const [review,setReview]=useState(false),[mapping,setMapping]=useState<Record<string,string>>({}),[assignmentMapping,setAssignmentMapping]=useState<Record<string,string>>({}),[saving,setSaving]=useState(false),[feedback,setFeedback]=useState(''),[importError,setImportError]=useState('');
 const reviewTitle=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{setReview(false);setFeedback('');setImportError('');},[snapshot?.origin,snapshot?.refreshedAt]);
 useEffect(()=>{if(review)reviewTitle.current?.focus();},[review]);
 function beginReview(){if(!snapshot)return;setMapping(suggestCanvasClasses(work,snapshot));setAssignmentMapping({});setFeedback('');setImportError('');setReview(true);}
 const linked=(item:CanvasAssignment)=>work.assignments.find(a=>a.canvas?.origin===snapshot?.origin&&a.canvas.courseId===item.courseId&&a.canvas.id===item.id);
 async function saveImport(){
  if(!snapshot||saving)return;setSaving(true);setImportError('');
  try{const result=importCanvas(work,snapshot,mapping,assignmentMapping);if(await onCommit(result.work)){setReview(false);setFeedback(`Canvas saved to your desk. ${result.added} new ${result.added===1?'workspace':'workspaces'}; ${result.updated} refreshed. Your existing research is preserved.`);}else setImportError('Canvas was not imported. Resolve the workspace save warning and try again; your course matches are still here.');}
  catch(error){setImportError(error instanceof Error?error.message:'Review the course matches and try again.');}finally{setSaving(false);}
 }
 return <section className="canvas-desk" aria-labelledby="canvas-desk-title">
  <div className="desk-section-head"><div><span className="eyebrow">FROM YOUR CLASSROOM</span><h2 id="canvas-desk-title">Canvas assignments</h2></div>{status?.connected&&<button className="outline" disabled={!!pending||saving} onClick={()=>void reader.refresh()}><RefreshCw size={14}/> Refresh Canvas</button>}</div>
  {loading&&!snapshot&&<p role="status">Checking Canvas connection…</p>}
  {error&&<p role="alert" className="canvas-feedback">{error}</p>}
  {status?.lastSyncAt&&<p className="canvas-sync">Last successful sync: <time dateTime={status.lastSyncAt}>{timestamp(status.lastSyncAt)}</time>{!status.connected?' · Disconnected':''}</p>}
  {status?.error&&<p className="canvas-feedback" role="alert">{Object.hasOwn(CANVAS_MESSAGES,status.error)?CANVAS_MESSAGES[status.error as CanvasErrorCode]:'The last refresh failed. Showing your last successful Canvas data.'}</p>}
  {!snapshot&&!loading&&<p className="canvas-empty">{status?.connected?'No Canvas data has been refreshed yet. Choose Refresh Canvas to try again.':'Connect Canvas under Workspace settings to bring courses and upcoming assignments here. Imported research stays on your desk after disconnecting.'}</p>}
  {snapshot&&<>
   <div className="canvas-import-heading"><p>{snapshot.courses.length} active {snapshot.courses.length===1?'course':'courses'} · {snapshot.assignments.length} upcoming or undated {snapshot.assignments.length===1?'assignment':'assignments'}</p><button className="outline" disabled={saving||!!pending} onClick={beginReview}>Review courses & workspaces</button></div>
   {!snapshot.courses.length&&<p className="canvas-empty">No active enrolled courses were returned by Canvas. Try refreshing after your institution makes your courses available.</p>}
   {!!snapshot.courses.length&&!snapshot.assignments.length&&<p className="canvas-empty">No upcoming or undated assignments were returned. You can still add your courses to Classes using Review courses & workspaces.</p>}
   {review&&<div className="canvas-import-review"><h3 ref={reviewTitle} tabIndex={-1}>Review courses & workspaces</h3><p>Match courses to your classes and choose a workspace for each assignment. Saving keeps your existing sources, notes, checklists and edited details.</p>
    <fieldset disabled={saving||!!pending}><legend>Course matches</legend>{snapshot.courses.map(course=>{const existing=work.classes?.find(c=>c.canvas?.some(ref=>ref.origin===snapshot.origin&&ref.courseId===course.id));return existing?<p key={course.id}><strong>{course.code||course.name}</strong> → {existing.name} <span className="muted">(already linked)</span></p>:<label key={course.id}>{course.name}<select value={mapping[course.id]||''} onChange={e=>setMapping({...mapping,[course.id]:e.target.value})} aria-label={'Class for '+course.name}><option value="">Create a class for this course</option>{work.classes?.map(local=><option key={local.id} value={local.id}>{local.name}{local.code?' · '+local.code:''}</option>)}</select></label>;})}</fieldset>
    {!!snapshot.assignments.length&&<fieldset disabled={saving||!!pending}><legend>Research workspaces</legend>{snapshot.assignments.map(item=>{const existing=linked(item),key=canvasAssignmentKey(item);return existing?<p key={key}><strong>{item.name}</strong> → {existing.name} <span className="muted">(already linked)</span></p>:<label key={key}>{item.name}<select value={assignmentMapping[key]||''} onChange={e=>setAssignmentMapping({...assignmentMapping,[key]:e.target.value})} aria-label={'Workspace for '+item.name}><option value="">Create a research workspace</option>{work.assignments.filter(a=>!a.canvas).map(local=><option key={local.id} value={local.id} disabled={Object.entries(assignmentMapping).some(([k,v])=>k!==key&&v===local.id)}>{local.name}</option>)}</select></label>;})}</fieldset>}
    {importError&&<p className="canvas-feedback" role="alert">{importError}</p>}<div className="canvas-actions"><button className="primary" disabled={saving||!!pending} onClick={()=>void saveImport()}>{saving?'Saving to your desk…':'Save Canvas to my desk'}</button><button className="text-button" disabled={saving} onClick={()=>setReview(false)}>Cancel import review</button></div>
   </div>}
   {feedback&&<p className="canvas-feedback" role="status">{feedback}</p>}
   <div className="canvas-assignment-grid">{snapshot.assignments.map(item=>{const course=snapshot.courses.find(c=>c.id===item.courseId),workspace=linked(item);return <article className="canvas-assignment" key={canvasAssignmentKey(item)}><div className="canvas-card-meta"><span>{course?.code||course?.name||'Canvas course'}</span>{item.submissionStatus&&<span>{submissionLabels[item.submissionStatus]}</span>}</div><h3>{item.name}</h3><p className="canvas-due">{dueLabel(item,course?.timeZone||'UTC')}</p>{item.description&&<details className="canvas-description"><summary>Assignment instructions</summary><p>{item.description}</p></details>}<div className="canvas-actions"><a className="text-button" href={item.url} target="_blank" rel="noreferrer">Open in Canvas <ExternalLink size={13}/></a>{workspace?<button className="text-button" onClick={()=>onOpen(workspace)} aria-label={'Open research workspace: '+workspace.name}>Open research workspace</button>:<button className="text-button" disabled={saving||!!pending} onClick={beginReview}>Create or link workspace</button>}</div></article>;})}</div>
  </>}
  {pending&&<p role="status">{pending}…</p>}
 </section>;
}
