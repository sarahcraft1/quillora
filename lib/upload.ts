export const MAX_UPLOAD=10_000_000;
export const MAX_BODY=10_100_000;
export class UploadError extends Error{constructor(message:string,public status=422){super(message);}}
export async function boundedBody(req:Request,limit=MAX_BODY,timeout=15000){
 const length=req.headers.get('content-length');if(length&&(!/^\d+$/.test(length)||Number(length)>limit))throw new UploadError('Choose a file smaller than 10 MB.',413);
 if(!req.body)throw new UploadError('Choose a PDF or DOCX file, or paste your rubric.',400);
 const reader=req.body.getReader(),chunks:Uint8Array[]=[];let total=0;const deadline=Date.now()+timeout;
 try{while(true){const remaining=deadline-Date.now();if(remaining<=0)throw new UploadError('Upload took too long. Try a smaller file or paste the instructions.',408);let timer:ReturnType<typeof setTimeout>|undefined;const result=await Promise.race([reader.read(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new UploadError('Upload took too long. Try a smaller file or paste the instructions.',408)),remaining);})]).finally(()=>clearTimeout(timer));if(result.done)break;total+=result.value.byteLength;if(total>limit)throw new UploadError('Choose a file smaller than 10 MB.',413);chunks.push(result.value);}}
 catch(e){void reader.cancel().catch(()=>{});throw e;}finally{reader.releaseLock();}
 const body=new Uint8Array(total);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}return body;
}
// One request at a time, including body buffering. Single-process pilot only.
let active=false;
export async function singleUpload<T>(run:()=>Promise<T>):Promise<T>{if(active)throw new UploadError('Another rubric is being processed. Wait a moment, then retry or paste your instructions.',429);active=true;try{return await run();}finally{active=false;}}
