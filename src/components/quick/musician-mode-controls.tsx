"use client";

import { Guitar, Minus, Plus, SkipForward } from "lucide-react";
import { useSyncExternalStore, type ComponentProps } from "react";

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
const SPEED_STEP = 10;

type MusicianModeControlsProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
};

export function MusicianModeControls({
  enabled,
  onEnabledChange,
}: MusicianModeControlsProps) {
  return (
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
  );
}

type MusicianModeOverlayProps = {
  speed: number;
  onSpeedChange: (speed: number) => void;
  autoNext: boolean;
  onAutoNextChange: (autoNext: boolean) => void;
};

export function MusicianModeOverlay({
  speed,
  onSpeedChange,
  autoNext,
  onAutoNextChange,
}: MusicianModeOverlayProps) {
  return (
    <div className="pointer-events-none absolute right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 grid grid-cols-2 gap-2">
      <OverlayButton
        aria-label="Ralentir le défilement"
        disabled={speed <= MIN_SCROLL_SPEED}
        onClick={() =>
          onSpeedChange(Math.max(MIN_SCROLL_SPEED, speed - SPEED_STEP))
        }
      >
        <Minus className="size-5" />
      </OverlayButton>

      <OverlayButton
        aria-label="Accélérer le défilement"
        disabled={speed >= MAX_SCROLL_SPEED}
        onClick={() =>
          onSpeedChange(Math.min(MAX_SCROLL_SPEED, speed + SPEED_STEP))
        }
      >
        <Plus className="size-5" />
      </OverlayButton>

      <div
        className="flex size-12 items-center justify-center rounded-full bg-foreground/10 text-xs tabular-nums text-foreground/40 backdrop-blur-[2px]"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Vitesse de défilement ${speed}`}
      >
        {speed}
      </div>

      <OverlayButton
        pressed={autoNext}
        aria-label={
          autoNext
            ? "Désactiver le passage automatique au chant suivant"
            : "Activer le passage automatique au chant suivant"
        }
        onClick={() => onAutoNextChange(!autoNext)}
      >
        <SkipForward className="size-5" />
      </OverlayButton>
    </div>
  );
}

function OverlayButton({
  pressed = false,
  className,
  ...props
}: ComponentProps<typeof Button> & { pressed?: boolean }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      aria-pressed={pressed}
      className={cn(
        "pointer-events-auto size-12 rounded-full border-0 bg-foreground/10 text-foreground/40 shadow-none backdrop-blur-[2px]",
        "hover:bg-foreground/18 hover:text-foreground/65",
        pressed && "bg-foreground/18 text-foreground/65",
        className,
      )}
      {...props}
    />
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
