"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { ChordSheet } from "@/components/song/chord-sheet";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSong, updateSong } from "@/lib/actions/songs";

const defaultContent = `{title: Mon chant}
{key: G}
{start_of_verse}
[G]Paroles avec [C]accords [G]ici
{end_of_verse}`;

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
  const [content, setContent] = useState(initialValues?.content ?? defaultContent);

  function handleTitleChange(nextTitle: string) {
    setTitle(nextTitle);

    if (mode === "create" && nextTitle) {
      setContent((current) =>
        current.includes("{title:")
          ? current.replace(/\{title:[^}]*\}/, `{title: ${nextTitle}}`)
          : `{title: ${nextTitle}}\n${current}`,
      );
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

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
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            required
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
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
        </div>

        <div className="grid gap-2">
          <Label htmlFor="ccli">CCLI (optionnel)</Label>
          <Input
            id="ccli"
            value={ccli}
            onChange={(event) => setCcli(event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="content">Partition ChordPro</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="min-h-[360px] font-mono text-sm"
            required
          />
        </div>

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
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">
          Aperçu
        </h2>
        <ChordSheet content={content} />
      </div>
    </form>
  );
}
