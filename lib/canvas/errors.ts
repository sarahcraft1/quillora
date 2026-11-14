export type CanvasErrorCode='account_required'|'setup_required'|'institution_unsupported'|'invalid_request'|'authorization_expired'|'permission_denied'|'unavailable'|'invalid_response'|'limit_exceeded'|'operation_in_progress'|'connection_required'|'conflict';
export const CANVAS_MESSAGES:Record<CanvasErrorCode,string>={
 account_required:'Canvas needs a verified Quillora account. Sign-in is not available in this local preview.',
 setup_required:'Canvas connections are not enabled on this Quillora server yet.',
 institution_unsupported:'This institution is not enabled for personal-token connections on this Quillora server. Check with your institution and the Quillora organizer.',
 invalid_request:'Check the Canvas institution URL and personal access token, then try again.',authorization_expired:'Canvas authorization expired or the token was rejected. Reconnect to continue; your imported research is safe.',
 permission_denied:'Canvas did not permit this request. Your institution may restrict personal tokens or access to this course.',
 unavailable:'Canvas could not be reached. Your last successful refresh and research are unchanged. Try again later.',
 invalid_response:'Canvas returned incomplete or unexpected data. Nothing from this refresh was imported.',
 limit_exceeded:'This Canvas account exceeds the current refresh limit. Your earlier data is unchanged.',
 operation_in_progress:'A Canvas refresh is already running. Wait a moment before trying again.',connection_required:'Connect Canvas before refreshing.',
 conflict:'The Canvas connection changed during this request. Reload its status before continuing.'
};
export class CanvasError extends Error{constructor(public code:CanvasErrorCode,public status=400){super(CANVAS_MESSAGES[code]);}}
