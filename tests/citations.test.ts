import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatCitation, citationWarnings } from '../lib/citations';
import type { Article } from '../lib/work';
const a: Article = { id: '10.1234/test', title: 'NASA and iPhone Research in New York: COVID-19 and eBay', authors: ['Ai-Jun Xu'], authorDetails: [{ given: 'Ai-Jun', family: 'Xu' }], year: 2024, journal: 'Journal of NASA Research', url: 'https://doi.org/10.1234/test', abstract: '', free: false, volume: '3', articleNumber: 'e123', pages: 'e123' };
test('both citation styles preserve proper nouns, acronyms, and mixed-case names', () => { for (const style of ['APA', 'MLA']) { const result = formatCitation(a, style); assert.ok(result.includes(a.title)); assert.ok(result.includes(a.journal)); assert.match(citationWarnings(a, style).join(' '), new RegExp(style === 'APA' ? 'sentence case' : 'title case')); } });
test('APA hyphenated initials retain hyphen and lowercase second element is not a second initial', () => { assert.match(formatCitation(a, 'APA'), /^Xu, A\.-J\./); assert.match(formatCitation({...a, authorDetails:[{family:'Raboso',given:'Lee-ann'}]}, 'APA'), /^Raboso, L\./); });
test('MLA suffix survives inverted and natural-name formatting', () => { const result = formatCitation({...a,authors:['A','B'],authorDetails:[{given:'James',family:'Smith',suffix:'Jr.'},{given:'Robin',family:'Lee',suffix:'III'}]},'MLA'); assert.match(result,/^Smith, James, Jr\., and Robin Lee, III\./); });
test('empty author details do not displace real author names or introduce empty et al.', () => { const m={...a,authorDetails:[{}, {}, {}]}; assert.match(formatCitation(m,'MLA'),/^Ai-Jun Xu\./); assert.ok(!formatCitation(m,'MLA').includes('et al.')); assert.ok(!citationWarnings(m).includes('Author missing; title is used first.')); });
test('incomplete structured lists do not silently drop legacy coauthors', () => { const m={...a,authors:['Ai-Jun Xu','Jane Doe'],authorDetails:a.authorDetails}; assert.match(formatCitation(m,'APA'),/Ai-Jun Xu, & Jane Doe/); assert.ok(citationWarnings(m).some(w=>w.includes('Legacy'))); });
test('APA 21-author ellipsis has no trailing comma before last author', () => { const c=formatCitation({...a,authorDetails:Array.from({length:21},(_,i)=>({given:'A',family:'Author'+i}))},'APA'); assert.match(c,/, … Author20, A\./); assert.ok(!c.includes('…, ')); });
test('article numbers take precedence over duplicate or PDF-local page metadata', () => { for(const style of ['APA','MLA']) { const c=formatCitation({...a,pages:'1-12'},style);assert.ok(!c.includes('1–12'));if(style==='APA')assert.match(c,/Article e123/);else assert.ok(!c.includes('e123'));assert.ok(!c.includes('p. e123'));  } });
test('en dash page ranges are plural in MLA', () => assert.match(formatCitation({...a,articleNumber:undefined,pages:'12–18'},'MLA'),/pp\. 12–18/));
test('missing title is disclosed and MLA description is unquoted', () => { const m={...a,title:'',authors:[],authorDetails:[],year:undefined,journal:''}; assert.ok(formatCitation(m,'MLA').startsWith('[Journal article; title unavailable].')); assert.ok(!formatCitation(m,'MLA').includes('“')); assert.ok(citationWarnings(m).some(w=>w.includes('Title missing')));assert.ok(!formatCitation(m,'APA').includes('undefined')); });
test('compact dotted given-name initials are not dropped',()=>assert.match(formatCitation({...a,authorDetails:[{given:'J.P.',family:'de Vries'}]},'APA'),/^de Vries, J\. P\./));

test('APA missing-author title ending in quotes puts terminal punctuation inside quotes',()=>{const source={...a,title:'Research on “NASA”',authors:[],authorDetails:[]};assert.ok(formatCitation(source,'APA').startsWith('Research on “NASA.” (2024).'));});
test('APA missing date/author/title follows disclosed bracketed-description template',()=>assert.equal(formatCitation({...a,title:'',authors:[],authorDetails:[],year:undefined,journal:'',volume:undefined,articleNumber:undefined,pages:undefined},'APA'),'[Journal article; title unavailable]. (n.d.). https://doi.org/10.1234/test'));
test('APA suffix after initials and group author remain distinguishable without inferred names',()=>{assert.ok(formatCitation({...a,authorDetails:[{family:'Smith',given:'James',suffix:'Jr.'}]},'APA').startsWith('Smith, J., Jr. (2024).'));assert.ok(formatCitation({...a,authors:['NASA Research Group'],authorDetails:[{name:'NASA Research Group'}]},'APA').startsWith('NASA Research Group. (2024).'));});
test('MLA e-locator in page field has the same review warning as explicit article number',()=>assert.ok(citationWarnings({...a,articleNumber:undefined,pages:'e123'},'MLA').some(w=>w.includes('article identifier'))));

// MLA Style Center: punctuation-and-quotation-marks (cites MLA Handbook 9).
// This is a synthetic punctuation variant, not a new scholarly source.
test('MLA nests paired straight quotation marks as single marks without changing APA metadata',()=>{
 const title='Research on "NASA" and "iPhone"';
 assert.ok(formatCitation({...a,title},'MLA').includes('“Research on ‘NASA’ and ‘iPhone.’”'));
 assert.ok(formatCitation({...a,title},'APA').includes('Research on "NASA" and "iPhone."'));
 assert.equal(title,'Research on "NASA" and "iPhone"');
});

test('MLA leaves unpaired inch symbols alone and preserves question punctuation inside nested quotes',()=>{
 assert.ok(formatCitation({...a,title:'A 6" Screen'},'MLA').includes('“A 6" Screen.”'));
 assert.ok(formatCitation({...a,title:'Research on "Why NASA?"'},'MLA').includes('“Research on ‘Why NASA?’”'));
});
