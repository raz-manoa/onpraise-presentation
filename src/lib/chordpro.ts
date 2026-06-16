import {
  ChordProParser,
  HtmlDivFormatter,
  type Song,
} from "chordsheetjs";

const parser = new ChordProParser();
const formatter = new HtmlDivFormatter();

export function parseSong(source: string): Song {
  return parser.parse(source);
}

export function renderHtml(song: Song): string {
  return formatter.format(song);
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
