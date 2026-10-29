import {headers} from 'next/headers';
import Home from './home';
export const dynamic='force-dynamic';
export default async function Page(){const key=(await headers()).get('x-quillora-storage-key');if(!key)return <p>Private access could not be verified. Please reopen your invitation link.</p>;return <Home key={key} storageKey={key} verifySession/>;}
