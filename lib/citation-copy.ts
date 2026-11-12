import { citationHtml, formatCitation } from './citations';
import type { Article } from './work';

/** Returns the actual clipboard format; a failed copy never reports success. */
export async function copyCitation(article: Article, style: string): Promise<'rich' | 'plain'> {
  const plain = formatCitation(article, style);
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new ClipboardItem({
        'text/plain': new Blob([plain], { type: 'text/plain' }),
        'text/html': new Blob([citationHtml(article, style)], { type: 'text/html' }),
      })]);
      return 'rich';
    } catch { /* A browser may allow text but reject HTML clipboard writes. */ }
  }
  if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
  await navigator.clipboard.writeText(plain);
  return 'plain';
}
