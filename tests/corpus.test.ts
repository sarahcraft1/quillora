import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {normalizeCrossref} from '../lib/scholarly';
import {formatCitation,citationParts} from '../lib/citations';
import {parseWork,doiKey} from '../lib/work';
const corpus=JSON.parse(readFileSync(new URL('./fixtures/scholarly/crossref-records.json',import.meta.url),'utf8'));
test('frozen corpus contains at least 40 distinct real journal records with provenance and edge coverage',()=>{assert.ok(corpus.records.length>=40);assert.equal(new Set(corpus.records.map((r:any)=>r.doi)).size,corpus.records.length);assert.ok(corpus.records.some((r:any)=>!r.metadata.author?.length));assert.ok(corpus.records.some((r:any)=>r.metadata['article-number']));assert.ok(corpus.records.some((r:any)=>!r.metadata.issue));assert.ok(corpus.records.some((r:any)=>r.metadata.author?.length>20));});
for(const record of corpus.records)test('corpus round trip and APA/MLA invariants: '+record.doi,()=>{assert.equal(createHash('sha256').update(JSON.stringify(record.metadata)).digest('hex'),record.sha256);assert.equal(doiKey(record.metadata.DOI),record.doi);const a=normalizeCrossref(record.metadata)!;assert.ok(a);assert.equal(a.free,false);const restored=parseWork(JSON.parse(JSON.stringify({saved:[a],assignments:[]}))).saved[0];for(const style of ['APA','MLA']){assert.equal(formatCitation(restored,style),formatCitation(a,style));const c=formatCitation(a,style);assert.ok(!c.includes('undefined'));assert.ok(!c.includes('https://doi.org/https://'));assert.ok(c.includes('https://doi.org/'+record.doi));assert.equal(citationParts(a,style).italic.includes('undefined'),false);}});
const get=(doi:string)=>normalizeCrossref(corpus.records.find((r:any)=>r.doi===doi).metadata)!;
test('APA7 independently checked official example: Grady et al. 2019',()=>assert.equal(formatCitation(get('10.1037/ppm0000185'),'APA'),'Grady, J. S., Her, M., Moreno, G., Perez, C., & Yelinek, J. (2019). Emotions in storybooks: A comparison of storybooks that represent ethnic and racial groups in the United States. Psychology of Popular Media Culture, 8(3), 207–217. https://doi.org/10.1037/ppm0000185'));
test('APA7 official PLOS e-locator deposited only as page is labeled Article and title quotes punctuated',()=>assert.equal(formatCitation(get('10.1371/journal.pone.0193972'),'APA'),'Jerrentrup, A., Mueller, T., Glowalla, U., Herder, M., Henrichs, N., Neubauer, A., & Schaefer, J. R. (2018). Teaching medicine with the help of “Dr. House.” PLOS ONE, 13(3), Article e0193972. https://doi.org/10.1371/journal.pone.0193972'));
test('APA7 official missing-issue example with explicitly reviewed sentence capitalization',()=>assert.equal(formatCitation({...get('10.3389/fpsyg.2018.00072'),title:'Environmental physiology and diving medicine'},'APA'),'Bosco, G., Rizzato, A., Moon, R. E., & Camporesi, E. M. (2018). Environmental physiology and diving medicine. Frontiers in Psychology, 9, Article 72. https://doi.org/10.3389/fpsyg.2018.00072'));

// Expected facts/format checked against APA's journal-article references page,
// https://apastyle.apa.org/style-grammar-guidelines/references/examples/journal-article-references
// The lowercase DOI is the existing canonical identifier, not invented metadata.
test('APA7 official two-author example preserves British spelling and final issue year over online-first year',()=>assert.equal(formatCitation(get('10.1017/s0144686x20001932'),'APA'),'Rybaczewska, M., & Sparks, L. (2022). Ageing consumers and e-commerce activities. Ageing and Society, 42(8), 1879–1898. https://doi.org/10.1017/s0144686x20001932'));

test('APA7 official missing-issue example preserves a question within the title and three deposited initials',()=>assert.equal(formatCitation(get('10.1016/j.chb.2017.02.038'),'APA'),'Sanchiz, M., Chevalier, A., & Amadieu, F. (2017). How do older and young adults start searching for information? Impact of age, domain knowledge and problem complexity on the different steps of information searching. Computers in Human Behavior, 72, 67–78. https://doi.org/10.1016/j.chb.2017.02.038'));

// An application of MLA's public core-element template to frozen real metadata;
// not an official MLA example or independent full-handbook certification.
test('MLA two-author real-record template preserves names and exposes unreviewed page-range abbreviation',()=>{
 const a={...get('10.1017/s0144686x20001932'),title:'Ageing Consumers and E-Commerce Activities'};
 assert.equal(formatCitation(a,'MLA'),'Rybaczewska, Maria, and Leigh Sparks. “Ageing Consumers and E-Commerce Activities.” Ageing and Society, vol. 42, no. 8, 2022, pp. 1879–1898, https://doi.org/10.1017/s0144686x20001932.');
});
test('MLA9 core-element order on real Su/Yang record with reviewed title case',()=>assert.equal(formatCitation({...get('10.1016/j.caeai.2022.100049'),title:'Artificial Intelligence in Early Childhood Education: A Scoping Review'},'MLA'),'Su, Jiahong, and Weipeng Yang. “Artificial Intelligence in Early Childhood Education: A Scoping Review.” Computers and Education: Artificial Intelligence, vol. 3, 2022, https://doi.org/10.1016/j.caeai.2022.100049.'));
test('missing metadata perturbations are clearly synthetic omissions of a real source, not extra corpus records',()=>{const a=get('10.1037/ppm0000185');const stripped={...a,authors:[],authorDetails:[],year:undefined,journal:'',volume:undefined,issue:undefined,pages:undefined};assert.ok(formatCitation(stripped,'APA').includes('(n.d.)'));assert.ok(!formatCitation(stripped,'MLA').includes('n.d.'));assert.ok(!formatCitation(stripped,'APA').includes('Anonymous'));});
test('MLA nested quotation punctuation uses single inner quotes on a real title',()=>{const a=get('10.1371/journal.pone.0193972');assert.ok(formatCitation({...a,title:'Teaching Medicine with the Help of “Dr. House”'},'MLA').includes('“Teaching Medicine with the Help of ‘Dr. House.’”'));});
