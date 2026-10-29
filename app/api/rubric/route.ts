import {NextResponse} from 'next/server';
import {boundedBody,MAX_UPLOAD,singleUpload,UploadError} from '../../../lib/upload';
import {extractInWorker} from '../../../lib/extraction';
import {allowRequest} from '../../../lib/rate-limit';
import {operationalLog} from '../../../lib/privacy-log';
export const runtime='nodejs';
export async function POST(req:Request){
 try{return await singleUpload(async()=>{
 if(!allowRequest('rubric:'+ (req.headers.get('x-quillora-storage-key')||'local'),6))throw new UploadError('Too many rubric uploads. Wait a minute, or paste the instructions.',429);
 if(!req.headers.get('content-type')?.startsWith('multipart/form-data;'))throw new UploadError('Choose a PDF or DOCX file, or paste your rubric.',400);
 const bytes=await boundedBody(req);let form:FormData;try{form=await new Request('http://local.invalid',{method:'POST',headers:{'Content-Type':req.headers.get('content-type')!},body:bytes}).formData();}catch{throw new UploadError('The upload was malformed. Choose the file again or paste your instructions.',400);}
 const files=form.getAll('file'),file=files[0];if(files.length!==1||!(file instanceof File))throw new UploadError('Choose one PDF or DOCX file, or paste your rubric.',400);
 if(!file.size||file.size>MAX_UPLOAD)throw new UploadError('Choose a nonempty file smaller than 10 MB.',413);
 const name=file.name.toLowerCase(),kind=name.endsWith('.pdf')?'pdf':name.endsWith('.docx')?'docx':null;
 if(!kind)throw new UploadError('Choose a PDF or DOCX file, or paste your rubric.',400);
 const text=await extractInWorker(Buffer.from(await file.arrayBuffer()),kind);return NextResponse.json({text},{headers:{'Cache-Control':'no-store'}});
 });}catch(e){const known=e instanceof UploadError;operationalLog(known?'rubric_rejected':'rubric_unavailable');return NextResponse.json({error:known?e.message:'We could not safely read this file. Paste your assignment instructions instead.'},{status:known?e.status:422,headers:{'Cache-Control':'no-store',...(known&&e.status===429?{'Retry-After':'60'}:{})}});}
}
