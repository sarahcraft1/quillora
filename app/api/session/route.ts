import {NextResponse} from 'next/server';
export async function GET(req:Request){const storageKey=req.headers.get('x-quillora-storage-key');return NextResponse.json(storageKey?{storageKey}:{error:'Access required.'},{status:storageKey?200:401,headers:{'Cache-Control':'private, no-store'}});}
