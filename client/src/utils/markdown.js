export function renderMarkdown(text) {
  if (!text) return "";

  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    // Links [text](url)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="md-link">$1</a>')

    // Bare URLs
    .replace(/(^|[\s(])(https?:\/\/[^\s)<]+)/gm, '$1<a href="$2" target="_blank" rel="noopener" class="md-link">$2</a>')

    // Headers
    .replace(/^### (.+)$/gm, '<h4 class="md-h4">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="md-h2">$1</h2>')

    // Horizontal rules
    .replace(/^---$/gm, '<hr class="md-hr"/>')

    // Remove table syntax (pipes) — convert to readable format
    .replace(/^\|(.+)\|$/gm, (match, content) => {
      // Skip separator rows
      if (/^[\s\-:|]+$/.test(content)) return '';
      const cells = content.split('|').map(c => c.trim()).filter(Boolean);
      return cells.join(' · ');
    })

    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')

    // Inline code
    .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')

    // Unordered lists
    .replace(/^[•\-\*] (.+)$/gm, '<li>$1</li>')

    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="md-ol">$1</li>')

    // Double newlines = paragraph break
    .replace(/\n\n/g, '</p><p>')

    // Single newlines
    .replace(/\n/g, '<br/>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*?<\/li>\s*(?:<br\/>)?\s*)+)/g, '<ul class="md-ul">$1</ul>');
  html = html.replace(/((?:<li class="md-ol">.*?<\/li>\s*(?:<br\/>)?\s*)+)/g, '<ol class="md-ol-list">$1</ol>');
  html = html.replace(/class="md-ol"/g, '');

  // Clean <br/> inside lists
  html = html.replace(/<ul class="md-ul">([\s\S]*?)<\/ul>/g, (match, inner) => {
    return '<ul class="md-ul">' + inner.replace(/<br\/>/g, '') + '</ul>';
  });
  html = html.replace(/<ol class="md-ol-list">([\s\S]*?)<\/ol>/g, (match, inner) => {
    return '<ol class="md-ol-list">' + inner.replace(/<br\/>/g, '') + '</ol>';
  });

  html = `<p>${html}</p>`;

  // Clean empty elements
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>\s*(<h[234])/g, '$1');
  html = html.replace(/(<\/h[234]>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<hr)/g, '$1');
  html = html.replace(/<p>\s*(<ul)/g, '$1');
  html = html.replace(/(<\/ul>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<ol)/g, '$1');
  html = html.replace(/(<\/ol>)\s*<\/p>/g, '$1');
  html = html.replace(/<br\/>\s*<br\/>/g, '<br/>');

  return html;
}