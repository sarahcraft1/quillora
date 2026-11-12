import {test} from 'node:test';
import assert from 'node:assert/strict';
import {formatCitation,citationRuns,citationWarnings} from '../lib/citations';
import type {Article} from '../lib/work';
import {normalizeCrossref} from '../lib/scholarly';
const source:Article={id:'10.1234/synthetic',title:'A Reviewed Article Title',journal:'Synthetic Journal',authors:['Ada Example'],authorDetails:[{given:'Ada',family:'Example'}],year:2024,volume:'8',issue:'2',pages:'207-217',url:'',abstract:'',free:false};
// MLA 9 number ranges: CSU Channel Islands MLA 9 guide (5.89–92),
// corroborated by MLA's current core examples and section 2.139 pointer.
test('MLA abbreviates unambiguous numeric page ranges with at least two final digits; APA is unchanged',()=>{
 for(const [input,expected] of [['2-3','2-3'],['89-99','89-99'],['96-101','96-101'],['103-104','103-04'],['207-217','207-17'],['255-275','255-75'],['395-401','395-401'],['923-1003','923-1003'],['1003-1005','1003-05'],['1608-1674','1608-74'],['1054–1062','1054-62'],['172-198','172-98'],['1879-1898','1879-98'],['207-17','207-17'],['iii-xii','iii-xii'],['S123-S129','S123-S129']]){
  assert.ok(formatCitation({...source,pages:input},'MLA').includes('pp. '+expected.replace(/(?<=\d)-(?=\d)/g,'\u2013')+','),input);
  assert.ok(formatCitation({...source,pages:input},'APA').includes(input.replace(/(?<=\d)-(?=\d)/g,'\u2013')),'APA retains '+input);
 }
});
// MLA's ninth-edition Closer Look, 5.92: first page + plus for nonconsecutive periodical pages.
test('MLA nonconsecutive numeric periodical pages use first page plus; single pages remain singular',()=>{
 assert.ok(formatCitation({...source,pages:'12-14, 18-19'},'MLA').includes('pp. 12+,'));
 assert.ok(formatCitation({...source,pages:'49'},'MLA').includes('p. 49,'));
 assert.ok(formatCitation({...source,pages:'12+'},'MLA').includes('pp. 12+,'));
});
test('MLA one, two, three and many authors preserve supplied order without APA-style initials',()=>{
 const names=[{given:'Ada',family:'Example'},{given:'Béa',family:'Second'},{given:'C.',family:'Third'}];
 for(const [count,prefix] of [[1,'Example, Ada.'],[2,'Example, Ada, and Béa Second.'],[3,'Example, Ada, et al.'],[21,'Example, Ada, et al.']] as const){const details=Array.from({length:count},(_,i)=>names[i%3]);assert.ok(formatCitation({...source,authors:details.map(x=>x.given+' '+x.family),authorDetails:details},'MLA').startsWith(prefix));}
 assert.deepEqual(citationRuns(source,'MLA').filter(x=>x.italic).map(x=>x.text),['Synthetic Journal']);
});
test('unreliable metadata and lost date/title typography are explicitly disclosed, not invented',()=>{
 assert.ok(citationWarnings({...source,title:'Valid title',journal:'Zeitschrift f\uFFFDr Physik'},'MLA').some(w=>w.includes('character-encoding')));
 assert.ok(citationWarnings({...source,authors:['Research Consortium','Ada Example'],authorDetails:[{name:'Research Consortium'},source.authorDetails![0]]},'MLA').some(w=>w.includes('group and individual')));
 assert.ok(citationWarnings(source,'MLA').some(w=>w.includes('month or season')));
});
test('Crossref separate subtitles are retained once, with question punctuation preserved',()=>{
 for(const [title,subtitle,expected] of [['Main Title','A Subtitle','Main Title: A Subtitle'],['Why Research?','A Study','Why Research? A Study'],['Main Title: A Subtitle','A Subtitle','Main Title: A Subtitle'],['A Study of Hope','Hope','A Study of Hope: Hope'],['Research in the U.S.','A Study','Research in the U.S.: A Study']]){
  const normalized=normalizeCrossref({DOI:source.id,title:[title],subtitle:[subtitle],author:[{given:'Ada',family:'Example'}],'container-title':['Synthetic Journal']})!;
  assert.equal(normalized.title,expected);assert.ok(formatCitation(normalized,'MLA').includes(expected));
 }
});
