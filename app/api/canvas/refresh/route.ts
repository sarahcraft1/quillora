import {canvasRoute} from '../../../../lib/canvas/runtime';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export function POST(req:Request){return canvasRoute(req,'refresh');}
