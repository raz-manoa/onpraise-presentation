"use client";

import { Guitar } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const MUSICIAN_MODE_STORAGE_KEYS = {
  enabled: "onpraise-musician-mode-enabled",
  speed: "onpraise-musician-scroll-speed",
  autoNext: "onpraise-musician-auto-next",
} as const;

export const DEFAULT_SCROLL_SPEED = 40;
export const MIN_SCROLL_SPEED = 20;
export const MAX_SCROLL_SPEED = 120;

type MusicianModeControlsProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  autoNext: boolean;
  onAutoNextChange: (autoNext: boolean) => void;
};

export function MusicianModeControls({
  enabled,
  onEnabledChange,
  speed,
  onSpeedChange,
  autoNext,
  onAutoNextChange,
}: MusicianModeControlsProps) {
  return (
    <>
      <Button
        type="button"
        variant={enabled ? "default" : "outline"}
        size="icon-sm"
        aria-pressed={enabled}
        aria-label={
          enabled ? "Désactiver le mode musicien" : "Activer le mode musicien"
        }
        onClick={() => onEnabledChange(!enabled)}
      >
        <Guitar />
      </Button>

      {enabled && (
        <div className="col-span-2 flex flex-wrap items-center gap-3 sm:justify-end">
          <label className="flex min-h-11 min-w-44 items-center gap-2 text-xs text-muted-foreground">
            <span className="shrink-0">Vitesse</span>
            <input
              type="range"
              min={MIN_SCROLL_SPEED}
              max={MAX_SCROLL_SPEED}
              step={1}
              value={speed}
              aria-label="Vitesse de défilement"
              className={cn(
                "h-2 w-full min-w-24 cursor-pointer accent-primary",
              )}
              onChange={(event) => onSpeedChange(Number(event.target.value))}
            />
            <span className="w-8 shrink-0 tabular-nums">{speed}</span>
          </label>

          <Button
            type="button"
            variant={autoNext ? "default" : "outline"}
            size="sm"
            className="min-h-11"
            aria-pressed={autoNext}
            aria-label={
              autoNext
                ? "Désactiver le passage automatique au chant suivant"
                : "Activer le passage automatique au chant suivant"
            }
            onClick={() => onAutoNextChange(!autoNext)}
          >
            Chant suivant auto
          </Button>
        </div>
      )}
    </>
  );
}

type MusicianModePreferences = {
  enabled: boolean;
  speed: number;
  autoNext: boolean;
};

const SERVER_SNAPSHOT: MusicianModePreferences = {
  enabled: false,
  speed: DEFAULT_SCROLL_SPEED,
  autoNext: false,
};

let clientSnapshot: MusicianModePreferences = SERVER_SNAPSHOT;

const preferenceListeners = new Set<() => void>();

function emitPreferenceChange() {
  for (const listener of preferenceListeners) {
    listener();
  }
}

function subscribeToMusicianModePreferences(onStoreChange: () => void) {
  preferenceListeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    preferenceListeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getMusicianModeServerSnapshot(): MusicianModePreferences {
  return SERVER_SNAPSHOT;
}

export function readMusicianModePreferences(): MusicianModePreferences {
  if (typeof window === "undefined") {
    return SERVER_SNAPSHOT;
  }

  const enabled =
    localStorage.getItem(MUSICIAN_MODE_STORAGE_KEYS.enabled) === "1";
  const storedSpeed = Number(
    localStorage.getItem(MUSICIAN_MODE_STORAGE_KEYS.speed),
  );
  const speed = Number.isFinite(storedSpeed)
    ? Math.min(MAX_SCROLL_SPEED, Math.max(MIN_SCROLL_SPEED, storedSpeed))
    : DEFAULT_SCROLL_SPEED;
  const autoNext =
    localStorage.getItem(MUSICIAN_MODE_STORAGE_KEYS.autoNext) === "1";

  if (
    clientSnapshot.enabled === enabled &&
    clientSnapshot.speed === speed &&
    clientSnapshot.autoNext === autoNext
  ) {
    return clientSnapshot;
  }

  clientSnapshot = { enabled, speed, autoNext };
  return clientSnapshot;
}

export function useMusicianModePreferences() {
  const prefs = useSyncExternalStore(
    subscribeToMusicianModePreferences,
    readMusicianModePreferences,
    getMusicianModeServerSnapshot,
  );

  function setEnabled(enabled: boolean) {
    localStorage.setItem(
      MUSICIAN_MODE_STORAGE_KEYS.enabled,
      enabled ? "1" : "0",
    );
    emitPreferenceChange();
  }

  function setSpeed(speed: number) {
    localStorage.setItem(MUSICIAN_MODE_STORAGE_KEYS.speed, String(speed));
    emitPreferenceChange();
  }

  function setAutoNext(autoNext: boolean) {
    localStorage.setItem(
      MUSICIAN_MODE_STORAGE_KEYS.autoNext,
      autoNext ? "1" : "0",
    );
    emitPreferenceChange();
  }

  return {
    ...prefs,
    setEnabled,
    setSpeed,
    setAutoNext,
  };
}
