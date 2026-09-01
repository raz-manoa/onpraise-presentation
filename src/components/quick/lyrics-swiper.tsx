"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  MusicianModeControls,
  useMusicianModePreferences,
} from "@/components/quick/musician-mode-controls";
import { PreviewOnboardingOverlay } from "@/components/quick/preview-onboarding-overlay";
import { useAutoScroll } from "@/components/quick/use-auto-scroll";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const {
    enabled: musicianMode,
    speed: scrollSpeed,
    autoNext,
    setEnabled: setMusicianMode,
    setSpeed: setScrollSpeed,
    setAutoNext,
  } = useMusicianModePreferences();

  const progress =
    songs.length > 0 ? ((activeIndex + 1) / songs.length) * 100 : 0;

  useAutoScroll({
    enabled: musicianMode,
    speed: scrollSpeed,
    autoNext,
    activeIndex,
    songCount: songs.length,
    sectionRefs,
    horizontalContainerRef: containerRef,
  });

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

  function scrollBySong(direction: -1 | 1) {
    const container = containerRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction * container.clientWidth,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        scrollBySong(1);
      }

      if (event.key === "ArrowLeft") {
        scrollBySong(-1);
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
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <div className="fixed inset-x-0 top-0 z-20 h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <header className="sticky top-1 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {playlistTitle}
            </p>
            <p
              className="text-sm font-medium"
              aria-live="polite"
              aria-atomic="true"
            >
              Chant {activeIndex + 1} / {songs.length}
            </p>
          </div>

          <MusicianModeControls
            enabled={musicianMode}
            onEnabledChange={setMusicianMode}
            speed={scrollSpeed}
            onSpeedChange={setScrollSpeed}
            autoNext={autoNext}
            onAutoNextChange={setAutoNext}
          />
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          ref={containerRef}
          className="flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ touchAction: "pan-x pan-y" }}
        >
          {songs.map((song, index) => (
            <section
              key={song.id}
              ref={(element) => {
                sectionRefs.current[index] = element;
              }}
              className={cn(
                "h-full min-h-0 w-full min-w-full shrink-0 snap-start overflow-y-auto px-4 py-6 pointer-fine:px-16",
                musicianMode && "overscroll-y-none",
              )}
            >
              <div className="mx-auto max-w-3xl">
                <h1 className="mb-6 text-2xl font-bold">{song.title}</h1>
                <div
                  className="whitespace-pre-wrap text-base sm:text-lg [&_strong]:font-bold"
                  dangerouslySetInnerHTML={{
                    __html: song.lyrics.includes("<br")
                      ? song.lyrics
                      : song.lyrics.replace(/\n/g, "<br>"),
                  }}
                />
              </div>
            </section>
          ))}
        </div>

        {songs.length > 1 ? (
          <>
            {activeIndex > 0 ? (
              <DesktopSongArrow
                direction="prev"
                onClick={() => scrollBySong(-1)}
              />
            ) : null}
            {activeIndex < songs.length - 1 ? (
              <DesktopSongArrow
                direction="next"
                onClick={() => scrollBySong(1)}
              />
            ) : null}
          </>
        ) : null}
      </div>

      <PreviewOnboardingOverlay />
    </div>
  );
}

function DesktopSongArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const isPrev = direction === "prev";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      onClick={onClick}
      aria-label={isPrev ? "Chant précédent" : "Chant suivant"}
      className={cn(
        "absolute top-1/2 z-10 hidden size-12 -translate-y-1/2 rounded-full border-0 bg-background/35 text-muted-foreground/45 shadow-none backdrop-blur-[2px] pointer-fine:flex",
        "hover:bg-background/70 hover:text-foreground/75",
        isPrev ? "left-2" : "right-2",
      )}
    >
      {isPrev ? (
        <ChevronLeft className="size-6" />
      ) : (
        <ChevronRight className="size-6" />
      )}
    </Button>
  );
}
