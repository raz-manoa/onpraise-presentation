"use client";

import { ChevronLeft, ChevronRight, Pointer } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "onpraise-quick-preview-onboarding";

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) !== "1";
}

function getServerSnapshot() {
  return false;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export function PreviewOnboardingOverlay() {
  const shouldShowFromStorage = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [dismissed, setDismissed] = useState(false);
  const visible = shouldShowFromStorage && !dismissed;

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  }

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={handleDismiss}
      aria-label="Balayez vers la gauche ou la droite pour changer de chant"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black/70 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 text-white">
        <ChevronLeft
          className="size-8 opacity-60 motion-safe:animate-[swipe-hint-left_1.4s_ease-in-out_infinite]"
          aria-hidden
        />
        <Pointer
          className="size-14 motion-safe:animate-[swipe-hand_1.4s_ease-in-out_infinite]"
          aria-hidden
        />
        <ChevronRight
          className="size-8 opacity-60 motion-safe:animate-[swipe-hint-right_1.4s_ease-in-out_infinite]"
          aria-hidden
        />
      </div>
      <p className="text-sm font-medium text-white/80">
        Balayez pour naviguer
      </p>
    </button>
  );
}
