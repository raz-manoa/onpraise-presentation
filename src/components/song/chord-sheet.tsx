"use client";

import { useMemo } from "react";

import { getChordSheetCss, renderSong } from "@/lib/chordpro";
import { cn } from "@/lib/utils";

const chordSheetCss = getChordSheetCss();

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
    <>
      <style dangerouslySetInnerHTML={{ __html: chordSheetCss }} />
      <div
        className={cn("chord-sheet max-w-none", className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
