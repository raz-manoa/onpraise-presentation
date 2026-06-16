"use client";

import { useEffect, useRef, useState } from "react";

import { ChordSheet } from "@/components/song/chord-sheet";
import { KeySelector } from "@/components/song/key-selector";
import { normalizeKey, semitonesBetween, type MajorKey } from "@/lib/keys";
import { cn } from "@/lib/utils";

type PublicSong = {
  id: string;
  title: string;
  author?: string | null;
  originalKey?: string | null;
  keyOverride?: string | null;
  content: string;
};

type SongSwiperProps = {
  playlistTitle: string;
  songs: PublicSong[];
};

function getSongBaseKey(song: PublicSong): MajorKey {
  return (
    normalizeKey(song.keyOverride) ??
    normalizeKey(song.originalKey) ??
    "C"
  );
}

export function SongSwiper({ playlistTitle, songs }: SongSwiperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<MajorKey>(() =>
    songs[0] ? getSongBaseKey(songs[0]) : "C",
  );

  const activeSong = songs[activeIndex];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleScroll() {
      const width = container!.clientWidth;
      const index = Math.round(container!.scrollLeft / width);
      setActiveIndex(index);
    }

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const container = containerRef.current;
      if (!container) return;

      if (event.key === "ArrowRight") {
        container.scrollBy({ left: container.clientWidth, behavior: "smooth" });
      }

      if (event.key === "ArrowLeft") {
        container.scrollBy({ left: -container.clientWidth, behavior: "smooth" });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (songs.length === 0) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-center text-muted-foreground">
        Cette playlist ne contient aucun chant.
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {playlistTitle}
            </p>
            <p className="text-sm font-medium">
              Chant {activeIndex + 1} / {songs.length}
            </p>
          </div>
          <KeySelector
            originalKey={
              activeSong.keyOverride ?? activeSong.originalKey ?? undefined
            }
            value={selectedKey}
            onChange={(key) => setSelectedKey(key as MajorKey)}
          />
        </div>
        <div className="mx-auto mt-3 flex max-w-3xl justify-center gap-1.5">
          {songs.map((song, index) => (
            <button
              key={song.id}
              type="button"
              aria-label={`Aller au chant ${index + 1}`}
              className={cn(
                "size-2 rounded-full transition-colors",
                index === activeIndex ? "bg-primary" : "bg-muted",
              )}
              onClick={() => {
                containerRef.current?.scrollTo({
                  left: index * containerRef.current.clientWidth,
                  behavior: "smooth",
                });
              }}
            />
          ))}
        </div>
      </header>

      <div
        ref={containerRef}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
        style={{ touchAction: "pan-x pan-y" }}
      >
        {songs.map((song) => {
          const semitones = semitonesBetween(getSongBaseKey(song), selectedKey);

          return (
            <section
              key={song.id}
              className="h-[calc(100dvh-7.5rem)] w-full shrink-0 snap-start overflow-y-auto px-4 py-6"
            >
              <div className="mx-auto max-w-3xl">
                <h1 className="mb-1 text-2xl font-bold">{song.title}</h1>
                {song.author && (
                  <p className="mb-6 text-sm text-muted-foreground">
                    {song.author}
                  </p>
                )}
                <ChordSheet
                  content={song.content}
                  semitones={semitones}
                  className="text-base sm:text-lg"
                />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
