const MAJOR_KEYS = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export type MajorKey = (typeof MAJOR_KEYS)[number];

const ENHARMONIC: Record<string, MajorKey> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
};

export const KEY_OPTIONS = MAJOR_KEYS;

export function normalizeKey(key: string | null | undefined): MajorKey | null {
  if (!key) return null;

  const trimmed = key.trim();
  const root = trimmed.replace(/m$|min$/i, "");
  const normalized = ENHARMONIC[root] ?? root;

  if (MAJOR_KEYS.includes(normalized as MajorKey)) {
    return normalized as MajorKey;
  }

  return null;
}

export function keyToSemitone(key: string | null | undefined): number {
  const normalized = normalizeKey(key);
  if (!normalized) return 0;
  return MAJOR_KEYS.indexOf(normalized);
}

export function semitonesBetween(
  fromKey: string | null | undefined,
  toKey: string,
): number {
  const from = keyToSemitone(fromKey);
  const to = keyToSemitone(toKey);
  return (to - from + 12) % 12;
}
