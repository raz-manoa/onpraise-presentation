"use client";

import { useMemo } from "react";

import { renderSong } from "@/lib/chordpro";
import { cn } from "@/lib/utils";

type ChordSheetProps = {
  content: string;
  semitones?: number;
  className?: string;
};

export function ChordSheet({
  content,
  semitones = 0,
  className,
}: ChordSheetProps) {
  const html = useMemo(
    () => renderSong(content, semitones),
    [content, semitones],
  );

  return (
    <div
      className={cn("chord-sheet prose prose-sm max-w-none dark:prose-invert", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
