import {inflateRawSync} from 'node:zlib';
// ZIP sizes are untrusted. Bound actual inflated bytes before mammoth parses XML.
export function checkDocx(b){
 const maxTotal=20_000_000,maxEntry=5_000_000;let end=-1;
 for(let i=b.length-22;i>=Math.max(0,b.length-65557);i--)if(b.readUInt32LE(i)===0x06054b50){end=i;break;}
 if(end<0||b.readUInt16LE(end+4)||b.readUInt16LE(end+6)||end+22+b.readUInt16LE(end+20)!==b.length)throw Error();
 const count=b.readUInt16LE(end+10),size=b.readUInt32LE(end+12),start=b.readUInt32LE(end+16);
 if(!count||count>512||count!==b.readUInt16LE(end+8)||start+size!==end)throw Error();
 let p=start,total=0;const names=new Set(),ranges=[];
 for(let i=0;i<count;i++){
  if(p+46>end||b.readUInt32LE(p)!==0x02014b50)throw Error();
  const flags=b.readUInt16LE(p+8),method=b.readUInt16LE(p+10),compressed=b.readUInt32LE(p+20),expanded=b.readUInt32LE(p+24),n=b.readUInt16LE(p+28),extra=b.readUInt16LE(p+30),comment=b.readUInt16LE(p+32),local=b.readUInt32LE(p+42);
  if(p+46+n+extra+comment>end||flags&1||![0,8].includes(method)||expanded>maxEntry||compressed>10000000)throw Error();
  const name=b.subarray(p+46,p+46+n).toString('utf8');if(names.has(name)||name.includes('..')||name.includes('\\')||name.startsWith('/'))throw Error();names.add(name);
  if(local+30>start||b.readUInt32LE(local)!==0x04034b50||b.readUInt16LE(local+8)!==method||b.readUInt16LE(local+6)!==flags)throw Error();
  const ln=b.readUInt16LE(local+26),le=b.readUInt16LE(local+28),data=local+30+ln+le,last=data+compressed;
  if(last>start||b.subarray(local+30,local+30+ln).toString('utf8')!==name||ranges.some(([a,z])=>local<z&&last>a))throw Error();ranges.push([local,last]);
  const raw=b.subarray(data,last),out=method===8?inflateRawSync(raw,{maxOutputLength:maxEntry}):raw;
  total+=out.length;if(out.length!==expanded||total>maxTotal)throw Error();p+=46+n+extra+comment;
 }
 if(p!==end||!names.has('[Content_Types].xml')||!names.has('word/document.xml'))throw Error();
}
export async function extract(data,kind){
 if(data.length>10000000)throw Error();let text;
 if(kind==='docx'){checkDocx(data);const mammoth=await import('mammoth');text=(await mammoth.extractRawText({buffer:data})).value;}
 else if(kind==='pdf'){
  if(data.subarray(0,5).toString()!=='%PDF-')throw Error();
  const {PDFParse}=await import('pdf-parse');const parser=new PDFParse({data:new Uint8Array(data)});
  try{const info=await parser.getInfo();if(info.total>60)throw Error();text=(await parser.getText()).text;}finally{await parser.destroy();}
 }else throw Error();
 if(!text?.trim()||text.length>200000)throw Error();return text;
}
if(process.send)process.once('message',async({kind,data})=>{try{const text=await extract(Buffer.from(data,'base64'),kind);process.send({text});}catch{process.send({error:true});}});
