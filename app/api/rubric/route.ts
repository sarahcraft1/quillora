import { NextResponse } from 'next/server';
export const runtime='nodejs';
export async function POST(req:Request){
 try{
 const length=Number(req.headers.get('content-length'));if(length>10_100_000)return NextResponse.json({error:'Choose a file smaller than 10 MB.'},{status:413});
 const form=await req.formData();const file=form.get('file');
 if(!(file instanceof File))return NextResponse.json({error:'Choose a PDF or DOCX file, or paste your rubric.'},{status:400});
 if(!file.size||file.size>10_000_000)return NextResponse.json({error:'Choose a nonempty file smaller than 10 MB.'},{status:400});
 const buffer=Buffer.from(await file.arrayBuffer());let text='';
 if(file.name.toLowerCase().endsWith('.docx')){const mammoth=await import('mammoth');text=(await mammoth.extractRawText({buffer})).value;}
 else if(file.name.toLowerCase().endsWith('.pdf')){const {PDFParse}=await import('pdf-parse');const parser=new PDFParse({data:new Uint8Array(buffer)});try{text=(await parser.getText()).text;}finally{await parser.destroy();}}
 else return NextResponse.json({error:'Choose a PDF or DOCX file, or paste your rubric.'},{status:400});
 if(!text.trim())throw Error();if(text.length>200_000)return NextResponse.json({error:'This rubric is too long. Paste only the assignment instructions (up to 200,000 characters).'},{status:422});
 return NextResponse.json({text});
 }catch{return NextResponse.json({error:'We could not read this file. Scanned or protected files may need text pasted instead.'},{status:422});}
}
