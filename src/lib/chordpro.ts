import {
  ChordProFormatter,
  ChordProParser,
  ChordsOverWordsFormatter,
  ChordsOverWordsParser,
  HtmlDivFormatter,
  UltimateGuitarParser,
  type Song,
} from "chordsheetjs";

const chordProParser = new ChordProParser();
const chordsOverWordsParser = new ChordsOverWordsParser();
const ultimateGuitarParser = new UltimateGuitarParser();
const chordProFormatter = new ChordProFormatter();
const chordsOverWordsFormatter = new ChordsOverWordsFormatter();
const htmlFormatter = new HtmlDivFormatter();

const META_DIRECTIVES = new Set([
  "title",
  "subtitle",
  "key",
  "artist",
  "composer",
  "lyricist",
  "copyright",
  "ccli",
  "capo",
  "tempo",
  "time",
  "duration",
  "meta",
]);

function stripMetadataDirectives(content: string): string {
  return content
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      const match = trimmed.match(/^\{([^:}]+)(?::[^}]*)?\}$/);
      if (match && META_DIRECTIVES.has(match[1].toLowerCase())) {
        return false;
      }
      return true;
    })
    .join("\n")
    .trim();
}

export function parseSong(source: string): Song {
  return chordProParser.parse(source);
}

export function songFromChordPro(source: string): Song {
  return chordProParser.parse(source);
}

export function songFromPaste(source: string): Song {
  try {
    return chordsOverWordsParser.parse(source);
  } catch {
    return ultimateGuitarParser.parse(source);
  }
}

export function songToChordPro(song: Song): string {
  return chordProFormatter.format(song);
}

export function textFromContent(content: string): string {
  const body = stripMetadataDirectives(content);
  const song = chordProParser.parse(body);
  return chordsOverWordsFormatter.format(song);
}

export function contentFromText(
  text: string,
  metadata?: { title?: string; key?: string },
): string {
  const song = songFromPaste(text);
  const body = stripMetadataDirectives(chordProFormatter.format(song));

  const parts: string[] = [];

  if (metadata?.title?.trim()) {
    parts.push(`{title: ${metadata.title.trim()}}`);
  }

  if (metadata?.key?.trim()) {
    parts.push(`{key: ${metadata.key.trim()}}`);
  }

  if (body) {
    parts.push(body);
  }

  return parts.join("\n");
}

export function renderHtml(song: Song): string {
  return htmlFormatter.format(song);
}

export function transpose(song: Song, semitones: number): Song {
  const copy = song.clone();
  if (semitones !== 0) {
    copy.transpose(semitones);
  }
  return copy;
}

export function renderSong(source: string, semitones = 0): string {
  const song = parseSong(source);
  return renderHtml(transpose(song, semitones));
}

export function getChordSheetCss(): string {
  return htmlFormatter.cssString(".chord-sheet");
}
