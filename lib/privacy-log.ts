export type OperationalEvent='rubric_rejected'|'rubric_unavailable';
// Never accept request objects, exception text, queries, filenames, tokens or user identifiers.
export function operationalLog(event:OperationalEvent){if(event!=='rubric_rejected'&&event!=='rubric_unavailable')return;console.warn(JSON.stringify({event}));}
