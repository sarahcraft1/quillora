import {canvasRoute} from '../../../lib/canvas/runtime';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export function GET(req:Request){return canvasRoute(req,'status');}
export function POST(req:Request){return canvasRoute(req,'connect');}
export function DELETE(req:Request){return canvasRoute(req,'disconnect');}
