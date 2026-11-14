import { test } from 'node:test';
import assert from 'node:assert/strict';
import { citationRuns, citationHtml, formatCitation, citationWarnings } from '../lib/citations';
import { copyCitation } from '../lib/citation-copy';
import type { Article } from '../lib/work';
const article: Article = { id: '10.1234/example', title: 'NASA & <research>', journal: 'Journal & Review', authors: ['Ai-Jun Xu'], authorDetails: [{ given: 'Ai-Jun', family: 'Xu' }], volume: '8', issue: '3', pages: '207-217', year: 2024, url: '', abstract: '', free: false };

// APA basic-principles: punctuation between reference elements is not italic.
test('APA journal and volume have separate italic spans and upright separator/issue/pages', () => {
  assert.deepEqual(citationRuns(article, 'APA').filter(r => r.italic).map(r => r.text), ['Journal & Review', '8']);
  assert.match(citationHtml(article, 'APA'), /<i>Journal &amp; Review<\/i>, <i>8<\/i>\(3\), 207–217/);
});
test('rendered spans and plain export agree in both styles, including missing fields', () => {
  for (const style of ['APA','MLA']) for (const source of [article, {...article, journal:'', volume:undefined}, {...article, volume:' ', issue:' '}]) {
    assert.equal(citationRuns(source,style).map(r=>r.text).join(''),formatCitation(source,style));
    assert.ok(!formatCitation({...source,volume:' ',issue:' '},style).includes('( )'));
    assert.ok(!formatCitation({...source,volume:' ',issue:' '},style).includes('vol.'));
  }
});
test('HTML export escapes metadata and preserves Unicode names and scientific capitalization', () => {
  const html=citationHtml({...article,title:'RNA-Seq & <img src=x onerror="bad()">',authors:['Þóra'],authorDetails:[{family:'Þórsdóttir',given:'Ása'}]},'MLA');
  assert.ok(html.includes('Þórsdóttir, Ása'));
  assert.ok(html.includes('RNA-Seq &amp; &lt;img'));
  assert.ok(!html.includes('<img'));
});
test('damaged title metadata and long-byline ambiguity are flagged without rewriting facts', () => {
  const damaged={...article,title:'?ber den anschaulichen Inhalt',authorDetails:Array.from({length:21},(_,i)=>({family:'Author'+i,given:'A'}))};
  assert.ok(citationWarnings(damaged).some(w=>w.includes('character-encoding')));
  assert.ok(citationWarnings(damaged).some(w=>w.includes('consortium')));
  assert.ok(formatCitation(damaged,'MLA').includes(damaged.title));
  assert.ok(!citationWarnings({...article,title:'Why NASA?'}).some(w=>w.includes('character-encoding')));
});
test('clipboard rich/plain fallback and rejection accurately report the format', async t => {
  const nav=Object.getOwnPropertyDescriptor(globalThis,'navigator');
  const item=Object.getOwnPropertyDescriptor(globalThis,'ClipboardItem');
  t.after(()=>{if(nav)Object.defineProperty(globalThis,'navigator',nav);else Reflect.deleteProperty(globalThis,'navigator');if(item)Object.defineProperty(globalThis,'ClipboardItem',item);else Reflect.deleteProperty(globalThis,'ClipboardItem');});
  class Item { data:Record<string,Blob>; constructor(data:Record<string,Blob>){this.data=data;} }
  Object.defineProperty(globalThis,'ClipboardItem',{value:Item,configurable:true});
  let rich:Item[]=[];let plain='';
  const clipboard={write:async(items:Item[])=>{rich=items},writeText:async(text:string)=>{plain=text}};
  Object.defineProperty(globalThis,'navigator',{value:{clipboard},configurable:true});
  assert.equal(await copyCitation(article,'APA'),'rich');
  assert.equal(await rich[0].data['text/plain'].text(),formatCitation(article,'APA'));
  assert.equal(await rich[0].data['text/html'].text(),citationHtml(article,'APA'));
  assert.equal(plain,'');
  clipboard.write=async()=>{throw Error('HTML denied')};
  assert.equal(await copyCitation(article,'APA'),'plain');
  assert.equal(plain,formatCitation(article,'APA'));
  Reflect.deleteProperty(globalThis,'ClipboardItem');
  assert.equal(await copyCitation(article,'MLA'),'plain');
  clipboard.writeText=async()=>{throw Error('Denied')};
  await assert.rejects(copyCitation(article,'APA'),/Denied/);
  Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
  await assert.rejects(copyCitation(article,'APA'),/Clipboard unavailable/);
});
