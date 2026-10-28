import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Quillora — A little clarity for your next big idea', description: 'Find scholarly sources that fit your topic—and your assignment.' };
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
