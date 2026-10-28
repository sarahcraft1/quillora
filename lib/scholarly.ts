import { decodeHTML } from 'entities';
import { articleUrl, doiKey, type Article, type Author } from './work';
function object(v:unknown):v is Record<string,unknown>{return !!v&&typeof v==='object'&&!Array.isArray(v)}
function text(v:unknown):string{return typeof v==='string'?decodeHTML(v.replace(/<\/?(?:p|div|jats:p)\b[^>]*>/gi,' ').replace(/<[^>]*>/g,'')).replace(/\s+/g,' ').trim():''}
function firstText(v:unknown):string{return text(Array.isArray(v)?v.find(x=>typeof x==='string'&&x.trim()):v)}
function scalar(v:unknown){return typeof v==='number'&&Number.isFinite(v)?String(v):text(v)||undefined}
function year(v:unknown):number|undefined{if(!object(v)||!Array.isArray(v['date-parts']))return;const parts=v['date-parts'][0];const n=Array.isArray(parts)?parts[0]:undefined;return typeof n==='number'&&Number.isInteger(n)&&n>=1000&&n<=3000?n:undefined}
/** Normalize publisher-deposited metadata. No access, credibility or review claim is inferred. */
export function normalizeCrossref(input:unknown):Article|null{
 if(!object(input)||typeof input.DOI!=='string')return null;
 const id=doiKey(input.DOI);if(!/^10\.\d{4,9}\/\S+$/i.test(id))return null;
 const authorDetails:Author[]=(Array.isArray(input.author)?input.author:[]).filter(object).map(a=>Object.fromEntries(['given','family','name','suffix'].map(k=>[k,text(a[k])]).filter(([,v])=>v))).filter(a=>Object.keys(a).length);
 const authors=authorDetails.map(a=>[a.given,a.family,a.suffix].filter(Boolean).join(' ')||a.name||'').filter(Boolean);
 const articleNumber=scalar(input['article-number']),pages=scalar(input.page);
 return {id,title:firstText(input.title)||'Untitled record',authors,authorDetails,
  year:year(input['published-print'])||year(input.published)||year(input['published-online']),journal:firstText(input['container-title'])||'Journal not listed',
  url:articleUrl(id),abstract:text(input.abstract),volume:scalar(input.volume),issue:scalar(input.issue),pages:pages===articleNumber?undefined:pages,articleNumber,free:false};
}
