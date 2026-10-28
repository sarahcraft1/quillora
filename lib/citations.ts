import type { Article, Author } from './work';
const period = (s: string) => /[.!?]$/.test(s) ? s : s + '.';
const clean = (s?: string) => s?.trim() || '';
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
export function citationParts(a: Article, style: string) {
  const authors = citationAuthors(a);
  const missingTitle = !a.title.trim() || a.title === 'Untitled record';
  // A label describes the missing field; it is not an invented article title.
  const title = missingTitle ? '[Journal article; title unavailable]' : a.title.trim();
  const journal = a.journal === 'Journal not listed' ? '' : a.journal.trim();
  const doi = 'https://doi.org/' + a.id;
  // Some deposits put an e-locator in both fields. It must never become a page.
  const number = clean(a.articleNumber);
  const pages = clean(a.pages) === number ? '' : clean(a.pages);
  if (style === 'APA') {
    const names = authors.map(apaName);
    const author = names.length > 20 ? names.slice(0, 19).join(', ') + ', … ' + names[names.length - 1]
      : names.length > 1 ? names.slice(0, -1).join(', ') + ', & ' + names[names.length - 1] : names[0];
    const before = author ? `${period(author)} (${a.year || 'n.d.'}). ${period(title)} ` : `${period(title)} (${a.year || 'n.d.'}). `;
    const location = number ? 'Article ' + number : pages.replace(/(?<=\d)-(?=\d)/g, '–');
    return { before, italic: [journal, a.volume].filter(Boolean).join(', '), after:
      (a.issue ? (journal && !a.volume ? ', ' : '') + '(' + a.issue + ')' : '') +
      (location ? ((journal || a.volume || a.issue) ? ', ' : '') + location : '') +
      ((journal || a.volume || a.issue || location) ? '. ' : '') + doi };
  }
  const author = authors.length >= 3 ? full(authors[0], true) + ', et al.'
    : authors.length === 2 ? full(authors[0], true) + ', and ' + full(authors[1]) : authors.length === 1 ? full(authors[0], true) : '';
  const before = (author ? period(author) + ' ' : '') + (missingTitle ? title + '. ' : '“' + (/[!?]$/.test(title) ? title : title.replace(/[.]$/, '') + '.') + '” ');
  const details = [a.volume ? 'vol. ' + a.volume : '', a.issue ? 'no. ' + a.issue : '', a.year ? String(a.year) : '',
    !number && pages ? (/[–-]/.test(pages) ? 'pp. ' : 'p. ') + pages.replace(/(?<=\d)-(?=\d)/g, '–') : ''].filter(Boolean);
  return { before, italic: journal, after: (journal && details.length ? ', ' : '') + details.join(', ') + (journal || details.length ? ', ' : '') + doi + '.' };
}
export function formatCitation(a: Article, style: string) { const p = citationParts(a, style); return p.before + p.italic + p.after; }
export function citationWarnings(a: Article, style = 'APA') {
  const authors = citationAuthors(a);
  return [authors.some(n => !clean(n.family) && !clean(n.name)) ? 'Some author metadata is incomplete; verify the names against the original record.' : '',
    a.authors.length && (!a.authorDetails?.length || a.authorDetails.filter(n => clean(n.family) || clean(n.name) || clean(n.given)).length < a.authors.length) ? 'Legacy author names lack family/given fields; verify their order and initials.' : '',
    !authors.length ? 'Author missing; title is used first.' : '', !a.year ? 'Publication date missing.' : '',
    !a.title.trim() || a.title === 'Untitled record' ? 'Title missing; a bracketed description is used. Check the original record.' : '',
    !a.journal.trim() || a.journal === 'Journal not listed' ? 'Journal missing.' : '',
    `Title capitalization is preserved to protect proper nouns and acronyms. Review ${style === 'APA' ? 'APA sentence case' : 'MLA title case'} before submitting.`,
    style === 'MLA' && clean(a.articleNumber) ? 'MLA omits the article identifier and article-local page numbers; the DOI locates the original record.' : '',
    'Plain-text copying does not preserve italics.'].filter(Boolean);
}
