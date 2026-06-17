import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["strong", "b"],
  allowedAttributes: {},
  disallowedTagsMode: "discard",
};

function normalizeBlockStructure(html: string): string {
  return html
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li|tr|h[1-6]|o:p)[^>]*>\s*<(div|p|li|tr|h[1-6]|o:p)[^>]*>/gi, "\n")
    .replace(/<\/?(div|p|li|tr|h[1-6]|o:p)[^>]*>/gi, "\n");
}

function newlinesToBreaks(text: string): string {
  return text.replace(/\n/g, "<br>");
}

export function plainTextToStorageHtml(plain: string): string {
  const normalized = plain.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const escaped = normalized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return newlinesToBreaks(escaped);
}

export function stripLyricsTags(html: string): string {
  const withNewlines = html.replace(/<br\s*\/?>/gi, "\n");

  return sanitizeHtml(normalizeBlockStructure(withNewlines), {
    allowedTags: [],
    allowedAttributes: {},
  });
}

export function sanitizeLyrics(html: string): string {
  const normalized = normalizeBlockStructure(html);
  const sanitized = sanitizeHtml(normalized, SANITIZE_OPTIONS)
    .replace(/<b>/gi, "<strong>")
    .replace(/<\/b>/gi, "</strong>");

  return newlinesToBreaks(sanitized);
}

export function lyricsHtmlToEditorHtml(html: string): string {
  return sanitizeLyrics(html);
}

export function hasLyricsContent(html: string): boolean {
  return stripLyricsTags(html).trim().length > 0;
}

export function htmlHasBoldMarkup(html: string): boolean {
  return (
    /<(b|strong)\b/i.test(html) ||
    /font-weight:\s*(bold|bolder|[6-9]\d{2})/i.test(html)
  );
}
