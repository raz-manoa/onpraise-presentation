"use client";

import { useMemo } from "react";

import { ChordSheet } from "@/components/song/chord-sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contentFromText } from "@/lib/chordpro";

type ChordSheetEditorProps = {
  value: string;
  onChange: (value: string) => void;
  metadata?: { title?: string; key?: string };
};

export function ChordSheetEditor({
  value,
  onChange,
  metadata,
}: ChordSheetEditorProps) {
  const previewContent = useMemo(() => {
    if (!value.trim()) {
      return "";
    }

    try {
      return contentFromText(value, metadata);
    } catch {
      return "";
    }
  }, [value, metadata]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="partition">Partition</Label>
        <Textarea
          id="partition"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`Collez ou tapez votre partition ici.

     G    D
Bless the Lord, O my soul

Verse 1:
    Em          C
Worship His holy name`}
          className="min-h-[480px] font-mono text-sm leading-relaxed"
        />
        <p className="text-xs text-muted-foreground">
          Accords sur une ligne, paroles en dessous. Copier/coller directement
          depuis vos partitions habituelles.
        </p>
      </div>

      <div className="grid gap-2">
        <Label>Aperçu</Label>
        <div className="min-h-[480px] rounded-lg border bg-muted/30 p-4">
          {previewContent ? (
            <ChordSheet content={previewContent} />
          ) : (
            <p className="text-sm text-muted-foreground">
              L&apos;aperçu s&apos;affiche ici au fur et à mesure de la saisie.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
