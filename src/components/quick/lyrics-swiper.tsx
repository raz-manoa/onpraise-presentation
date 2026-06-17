"use client";

import { useEffect, useRef, useState } from "react";

type QuickSong = {
  id: string;
  title: string;
  lyrics: string;
};

type LyricsSwiperProps = {
  playlistTitle: string;
  songs: QuickSong[];
};

export function LyricsSwiper({ playlistTitle, songs }: LyricsSwiperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const progress =
    songs.length > 0 ? ((activeIndex + 1) / songs.length) * 100 : 0;

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
      <div className="fixed inset-x-0 top-0 z-20 h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <header className="sticky top-1 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {playlistTitle}
          </p>
          <p className="text-sm font-medium">
            Chant {activeIndex + 1} / {songs.length}
          </p>
        </div>
      </header>

      <div
        ref={containerRef}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
        style={{ touchAction: "pan-x pan-y" }}
      >
        {songs.map((song) => (
          <section
            key={song.id}
            className="h-[calc(100dvh-4.5rem)] w-full shrink-0 snap-start overflow-y-auto px-4 py-6"
          >
            <div className="mx-auto max-w-3xl">
              <h1 className="mb-6 text-2xl font-bold">{song.title}</h1>
              <p className="whitespace-pre-wrap text-base leading-relaxed sm:text-lg">
                {song.lyrics}
              </p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
