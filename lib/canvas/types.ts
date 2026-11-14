/** Browser-safe Canvas data. Credentials never belong in these types. */
export type CanvasCriterion={id:string;description:string;detail:string;points:number|null};
export type CanvasCourse={id:string;name:string;code:string;url:string;timeZone:string};
export const CANVAS_SUBMISSION_STATES=['unsubmitted','submitted','pending_review','graded'] as const;
export type CanvasSubmissionStatus=typeof CANVAS_SUBMISSION_STATES[number];
export type CanvasAssignment={id:string;courseId:string;name:string;url:string;description:string;dueAt:string|null;rubric:CanvasCriterion[];submissionStatus?:CanvasSubmissionStatus};
export type CanvasSnapshot={version:1;origin:string;refreshedAt:string;courses:CanvasCourse[];assignments:CanvasAssignment[]};
export type CanvasCourseReference={origin:string;courseId:string;url:string};
export type CanvasAssignmentReference=CanvasAssignment&{origin:string;timeZone:string;syncedAt:string;localClassId:string};
export type CanvasStatus={storageKey:string;available:boolean;reason?:'account_required'|'setup_required';institutions:{origin:string;name:string}[];connected:boolean;origin?:string;lastSyncAt?:string;error?:string;snapshot:CanvasSnapshot|null};
export function canvasOrigin(value:string):string{
 const url=new URL(value.includes('://')?value:'https://'+value);
 const host=url.hostname.toLowerCase();
 if(url.protocol!=='https:'||url.username||url.password||url.port||url.search||url.hash||url.pathname!=='/'||!host.includes('.')||/^[\d.]+$/.test(host)||host.includes(':')||/(^|\.)(localhost|local|internal|invalid|test)$/.test(host))throw Error('Enter your institution’s public HTTPS Canvas domain, without a path.');
 return url.origin;
}
export function canvasDate(dueAt:string|null,timeZone='UTC'):string|undefined{
 if(!dueAt)return undefined;
 const parts=new Intl.DateTimeFormat('en',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(dueAt));
 return ['year','month','day'].map(type=>parts.find(p=>p.type===type)!.value).join('-');
}
export function validCanvasId(value:unknown):value is string{return typeof value==='string'&&/^[1-9]\d{0,19}$/.test(value);}
export function validCanvasTimestamp(value:unknown):value is string{
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)||!Number.isFinite(Date.parse(value)))return false;
 // Date.parse normalizes impossible dates (for example February 31); reject them.
 return new Date(value.slice(0,10)+'T12:00:00Z').toISOString().slice(0,10)===value.slice(0,10);
}
export function validCanvasReference(value:unknown):value is CanvasCourseReference{
 if(!value||typeof value!=='object')return false;const v=value as CanvasCourseReference;
 try{return canvasOrigin(v.origin)===v.origin&&validCanvasId(v.courseId)&&v.url===`${v.origin}/courses/${v.courseId}`;}catch{return false;}
}
export function validCanvasAssignmentReference(value:unknown):value is CanvasAssignmentReference{
 if(!value||typeof value!=='object')return false;const v=value as CanvasAssignmentReference;
 try{return canvasOrigin(v.origin)===v.origin&&validCanvasId(v.id)&&validCanvasId(v.courseId)&&v.url===`${v.origin}/courses/${v.courseId}/assignments/${v.id}`&&typeof v.name==='string'&&typeof v.description==='string'&&typeof v.localClassId==='string'&&validCanvasTimestamp(v.syncedAt)&&typeof v.timeZone==='string'&&!!new Intl.DateTimeFormat('en',{timeZone:v.timeZone})&&(v.submissionStatus===undefined||CANVAS_SUBMISSION_STATES.includes(v.submissionStatus))&&(v.dueAt===null||validCanvasTimestamp(v.dueAt))&&Array.isArray(v.rubric)&&v.rubric.every(r=>r&&typeof r.id==='string'&&typeof r.description==='string'&&typeof r.detail==='string'&&(r.points===null||typeof r.points==='number'&&Number.isFinite(r.points)));}catch{return false;}
}
