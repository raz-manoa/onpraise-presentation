"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { ChordSheetEditor } from "@/components/song/chord-sheet-editor/chord-sheet-editor";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSong, updateSong } from "@/lib/actions/songs";
import { contentFromText, textFromContent } from "@/lib/chordpro";

type SongFormProps = {
  mode: "create" | "edit";
  initialValues?: {
    id: string;
    title: string;
    author?: string | null;
    ccli?: string | null;
    originalKey?: string | null;
    content: string;
  };
};

export function SongForm({ mode, initialValues }: SongFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [author, setAuthor] = useState(initialValues?.author ?? "");
  const [ccli, setCcli] = useState(initialValues?.ccli ?? "");
  const [originalKey, setOriginalKey] = useState(initialValues?.originalKey ?? "G");
  const [text, setText] = useState(() =>
    initialValues?.content ? textFromContent(initialValues.content) : "",
  );

  const metadata = useMemo(
    () => ({ title, key: originalKey }),
    [title, originalKey],
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const content = contentFromText(text, metadata);

    startTransition(async () => {
      try {
        const payload = {
          title,
          author,
          ccli,
          originalKey,
          content,
        };

        if (mode === "create") {
          const song = await createSong(payload);
          router.push(`/songs/${song.id}/edit`);
          return;
        }

        await updateSong(initialValues!.id, payload);
        router.refresh();
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Une erreur est survenue",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="author">Auteur</Label>
          <Input
            id="author"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="originalKey">Tonalité d&apos;origine</Label>
          <Input
            id="originalKey"
            value={originalKey}
            onChange={(event) => setOriginalKey(event.target.value)}
            placeholder="G, Am, Bb..."
          />
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="ccli">CCLI (optionnel)</Label>
          <Input
            id="ccli"
            value={ccli}
            onChange={(event) => setCcli(event.target.value)}
          />
        </div>
      </div>

      <ChordSheetEditor
        value={text}
        onChange={setText}
        metadata={metadata}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Enregistrement..."
            : mode === "create"
              ? "Créer le chant"
              : "Enregistrer"}
        </Button>
        <LinkButton variant="outline" href="/songs">
          Retour
        </LinkButton>
      </div>
    </form>
  );
}
