import { stripLyricsTags } from "@/lib/sanitize-lyrics";

const SECTION_HEADER =
  /^(?:couplet|refrain|pont|chorus|verse|intro|outro|instrumental|tag|ending|bridge|pre-?chorus|pré-?refrain|interlude|vamp|break|solo|coda|fine|tourne)(?:\s*\d+)?\s*:?$/i;

const NO_CHORD = /^(?:n\.?c\.?|n\/c)$/i;

const CHORD_TOKEN =
  /^[A-G][#b♯♭]?(?:\+|°|ø|maj|min|dim|aug|sus|add|m|M)?\d*(?:[b#]\d+)?(?:\/[A-G][#b♯♭]?)?$/;

function unwrapToken(token: string): string {
  const withoutStar = token.replace(/\*+$/, "");
  const wrapped = withoutStar.match(/^\((.+)\)$|^\[(.+)\]$/);

  return wrapped?.[1] ?? wrapped?.[2] ?? withoutStar;
}

function isChordToken(token: string): boolean {
  const normalized = unwrapToken(token.trim());

  if (!normalized) return false;

  return NO_CHORD.test(normalized) || CHORD_TOKEN.test(normalized);
}

export function isChordLine(htmlOrText: string): boolean {
  const text = stripLyricsTags(htmlOrText).trim();

  if (!text || SECTION_HEADER.test(text)) {
    return false;
  }

  const tokens = text.split(/[\s|]+/).filter(Boolean);

  return tokens.length > 0 && tokens.every(isChordToken);
}

export function annotateChordLines(html: string): string {
  const withBreaks = html.includes("<br")
    ? html
    : html.replace(/\n/g, "<br>");
  const lines = withBreaks.split(/<br\s*\/?>/i);

  return lines
    .map((line, index) => {
      const isLast = index === lines.length - 1;
      const br = isLast ? "" : "<br>";

      if (isChordLine(line)) {
        return `<span class="chord-line">${line}${br}</span>`;
      }

      return `${line}${br}`;
    })
    .join("");
}
