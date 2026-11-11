import { doiKey, type Article, type Author } from './work';
const period = (s: string) => /[.!?]$/.test(s) ? s : s + '.';
function titlePeriod(s:string){const match=s.match(/([”’"]+)$/);if(!match)return period(s);const body=s.slice(0,-match[0].length);return period(body)+match[0];}
const clean = (s?: string) => s?.trim() || '';
/** MLA 9 numeric ranges (2.139 / 5.89) and nonconsecutive periodical pages (5.92).
 * Only unambiguous full decimal ranges/lists are abbreviated; roman numerals,
 * letter-prefixed pages and already-shortened ranges retain supplied wording. */
function mlaPages(pages:string) {
  if (/^\d+(?:[-\u2013]\d+)?(?:,\s*\d+(?:[-\u2013]\d+)?)+$/.test(pages)) return pages.match(/^\d+/)![0]+'+';
  const match=pages.match(/^(\d+)[-\u2013](\d+)$/);
  if (!match) return pages.replace(/(?<=\d)-(?=\d)/g,'\u2013');
  const [,start,end]=match;
  if (start.length!==end.length || Number(end)<=Number(start) || Number(end)<100) return start+'\u2013'+end;
  let shared=0;while(shared<end.length-2 && start[shared]===end[shared])shared++;
  return start+'\u2013'+end.slice(shared);
}
export function citationAuthors(a: Article): Author[] {
  const details = (a.authorDetails || []).filter(n => clean(n.family) || clean(n.name) || clean(n.given));
  // Do not guess family names from an unstructured name, or discard legacy
  // authors when only part of the structured author list is available.
  return details.length >= a.authors.filter(n => n.trim()).length && details.length
    ? details : a.authors.filter(n => n.trim()).map(name => ({ name: name.trim() }));
}
function initials(given: string) {
  return given.replace(/\.(?=\p{L})/gu, '. ').split(/\s+/).filter(Boolean).map(part =>
    part.split(/[-‐‑]/).filter(Boolean).filter((n, i) => i === 0 || !/^\p{Ll}/u.test(n))
      .map(n => Array.from(n)[0] + '.').join('-')
  ).join(' ');
}
function apaName(a: Author) {
  if (!clean(a.family)) return clean(a.name) || clean(a.given);
  const first = initials(clean(a.given));
  return clean(a.family) + (first ? ', ' + first : '') + (clean(a.suffix) ? ', ' + clean(a.suffix) : '');
}
function full(a: Author, invert = false) {
  if (!clean(a.family)) return clean(a.name) || clean(a.given);
  return (invert ? clean(a.family) + (clean(a.given) ? ', ' + clean(a.given) : '')
    : [clean(a.given), clean(a.family)].filter(Boolean).join(' ')) + (clean(a.suffix) ? ', ' + clean(a.suffix) : '');
}
// Compatibility text fields. Use citationRuns for formatting: APA has two
// separate italic spans with an upright separator, not one continuous span.
export function citationParts(a: Article, style: string) {
  const authors = citationAuthors(a);
  const missingTitle = !a.title.trim() || a.title === 'Untitled record';
  // A label describes the missing field; it is not an invented article title.
  const title = missingTitle ? '[Journal article; title unavailable]' : a.title.trim();
  const journal = a.journal === 'Journal not listed' ? '' : a.journal.trim();
  const volume = clean(a.volume), issue = clean(a.issue);
  const doi = 'https://doi.org/' + doiKey(a.id);
  // Some deposits put an e-locator in both fields. It must never become a page.
  const number = clean(a.articleNumber) || (/^e\d+$/i.test(clean(a.pages)) ? clean(a.pages) : '');
  const pages = clean(a.pages) === number ? '' : clean(a.pages);
  if (style === 'APA') {
    const names = authors.map(apaName);
    const author = names.length > 20 ? names.slice(0, 19).join(', ') + ', … ' + names[names.length - 1]
      : names.length > 1 ? names.slice(0, -1).join(', ') + ', & ' + names[names.length - 1] : names[0];
    const before = author ? `${period(author)} (${a.year || 'n.d.'}). ${titlePeriod(title)} ` : `${titlePeriod(title)} (${a.year || 'n.d.'}). `;
    const location = number ? 'Article ' + number : pages.replace(/(?<=\d)-(?=\d)/g, '–');
    return { before, italic: [journal, volume].filter(Boolean).join(', '), after:
      (issue ? (journal && !volume ? ', ' : '') + '(' + issue + ')' : '') +
      (location ? ((journal || volume || issue) ? ', ' : '') + location : '') +
      ((journal || volume || issue || location) ? '. ' : '') + doi };
  }
  const author = authors.length >= 3 ? full(authors[0], true) + ', et al.'
    : authors.length === 2 ? full(authors[0], true) + ', and ' + full(authors[1]) : authors.length === 1 ? full(authors[0], true) : '';
  const before = (author ? period(author) + ' ' : '') + (missingTitle ? title + '. ' : '“' + titlePeriod(title.replace(/(^|[\s([{:\u2014\u2013])"([^"\r\n]+)"/g,'$1‘$2’').replace(/“/g,'‘').replace(/”/g,'’')) + '” ');
  const details = [volume ? 'vol. ' + volume : '', issue ? 'no. ' + issue : '', a.year ? String(a.year) : '',
    !number && pages ? (/[–+,\-]/.test(pages) ? 'pp. ' : 'p. ') + mlaPages(pages) : ''].filter(Boolean);
  return { before, italic: journal, after: (journal && details.length ? ', ' : '') + details.join(', ') + (journal || details.length ? ', ' : '') + doi + '.' };
}
export function formatCitation(a: Article, style: string) { const p = citationParts(a, style); return p.before + p.italic + p.after; }
export type CitationRun = { text: string; italic?: boolean };
/** Shared display/export spans. APA's journal-volume separator is upright. */
export function citationRuns(a: Article, style: string): CitationRun[] {
  const p = citationParts(a, style);
  const journal = a.journal === 'Journal not listed' ? '' : clean(a.journal);
  const volume = clean(a.volume);
  const middle: CitationRun[] = style === 'APA'
    ? [...(journal ? [{ text: journal, italic: true }] : []),
       ...(journal && volume ? [{ text: ', ' }] : []),
       ...(volume ? [{ text: volume, italic: true }] : [])]
    : [{ text: p.italic, italic: true }];
  return [{ text: p.before }, ...middle, { text: p.after }].filter(run => run.text);
}
const escapeHtml = (text: string) => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
export function citationHtml(a: Article, style: string) {
  return citationRuns(a, style).map(run => run.italic ? '<i>' + escapeHtml(run.text) + '</i>' : escapeHtml(run.text)).join('');
}
export function citationWarnings(a: Article, style = 'APA') {
  const authors = citationAuthors(a);
  return [authors.some(n => !clean(n.family) && !clean(n.name)) ? 'Some author metadata is incomplete; verify the names against the original record.' : '',
    a.authors.length && (!a.authorDetails?.length || a.authorDetails.filter(n => clean(n.family) || clean(n.name) || clean(n.given)).length < a.authors.length) ? 'Legacy author names lack family/given fields; verify their order and initials.' : '',
    !authors.length ? 'Author missing; title is used first.' : '', !a.year ? 'Publication date missing.' : '',
    !a.title.trim() || a.title === 'Untitled record' ? 'Title missing; a bracketed description is used. Check the original record.' : '',
    /\uFFFD|^\?\p{Ll}/u.test(a.title) ? 'Title metadata may contain a character-encoding error; verify it against the publisher.' : '',
    authors.length > 20 ? 'Long author list: verify whether the publisher byline credits individuals or a consortium.' : '',
    !a.journal.trim() || a.journal === 'Journal not listed' ? 'Journal missing.' : '',
    `Title capitalization is preserved to protect proper nouns and acronyms. Review ${style === 'APA' ? 'APA sentence case' : 'MLA title case'} before submitting.`,
    style === 'MLA' && (clean(a.articleNumber)||/^e\d+$/i.test(clean(a.pages))) ? 'This draft omits the article identifier and article-local page numbers. Verify their treatment against MLA 9; the DOI locates the original record.' : '',
    /\uFFFD/.test([a.journal,...a.authors,...authors.map(n=>[n.given,n.family,n.name].filter(Boolean).join(' '))].join(' ')) ? 'Journal or author metadata may contain a character-encoding error; verify it against the publisher.' : '',
    authors.some(n=>clean(n.name)) && authors.some(n=>clean(n.family)||clean(n.given)) ? 'Mixed group and individual author metadata: verify the credited byline before using this draft; contributor lists may differ from citation authors.' : '',
    style === 'MLA' ? 'This draft stores only the publication year. Check the original issue for a month or season, and check any italics within article titles; those details are not reconstructed from Crossref plain text.' : '',
    'Formatted copying preserves italics where supported. Plain-text destinations require italics to be reapplied.'].filter(Boolean);
}
