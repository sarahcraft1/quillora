import {NextRequest} from 'next/server';
import {requestGate} from './lib/access-gate';
export async function middleware(req:NextRequest){return requestGate(req);}
// Cover every page/API, including alternate spellings; framework assets carry no student data.
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
