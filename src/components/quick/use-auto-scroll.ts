"use client";

import { useEffect, useRef, type RefObject } from "react";

const END_THRESHOLD = 8;

function resetScrollTop(element: HTMLElement) {
  element.scrollTop = 0;
}

function scrollDown(element: HTMLElement, deltaPixels: number) {
  element.scrollTop += deltaPixels;
}

function isAtScrollEnd(element: HTMLElement) {
  const maxScroll = element.scrollHeight - element.clientHeight;
  return (
    maxScroll <= 0 ||
    element.scrollTop + element.clientHeight >= element.scrollHeight - END_THRESHOLD
  );
}

function snapToScrollEnd(element: HTMLElement) {
  element.scrollTop = element.scrollHeight - element.clientHeight;
}

type UseAutoScrollOptions = {
  enabled: boolean;
  speed: number;
  autoNext: boolean;
  activeIndex: number;
  songCount: number;
  sectionRefs: RefObject<(HTMLElement | null)[]>;
  horizontalContainerRef: RefObject<HTMLDivElement | null>;
};

export function useAutoScroll({
  enabled,
  speed,
  autoNext,
  activeIndex,
  songCount,
  sectionRefs,
  horizontalContainerRef,
}: UseAutoScrollOptions) {
  const pausedRef = useRef(false);
  const advancingRef = useRef(false);
  const prevActiveIndexRef = useRef(activeIndex);
  const prevEnabledRef = useRef(enabled);

  useEffect(() => {
    if (prevActiveIndexRef.current !== activeIndex) {
      const section = sectionRefs.current?.[activeIndex];
      if (section) resetScrollTop(section);
      pausedRef.current = false;
      advancingRef.current = false;
      prevActiveIndexRef.current = activeIndex;
    }
  }, [activeIndex, sectionRefs]);

  useEffect(() => {
    if (enabled && !prevEnabledRef.current) {
      const section = sectionRefs.current?.[activeIndex];
      if (section) resetScrollTop(section);
      pausedRef.current = false;
      advancingRef.current = false;
    }
    prevEnabledRef.current = enabled;
  }, [enabled, activeIndex, sectionRefs]);

  useEffect(() => {
    if (!enabled) return;

    const section = sectionRefs.current?.[activeIndex];
    if (!section) return;

    function pause() {
      pausedRef.current = true;
    }

    section.addEventListener("wheel", pause, { passive: true });
    section.addEventListener("touchstart", pause, { passive: true });

    return () => {
      section.removeEventListener("wheel", pause);
      section.removeEventListener("touchstart", pause);
    };
  }, [enabled, activeIndex, sectionRefs]);

  useEffect(() => {
    if (!enabled) return;

    let rafId = 0;
    let lastTime = 0;

    function advanceToNextSong() {
      const horizontal = horizontalContainerRef.current;
      if (!horizontal || activeIndex >= songCount - 1 || advancingRef.current) {
        pausedRef.current = true;
        return;
      }

      advancingRef.current = true;
      horizontal.scrollTo({
        left: (activeIndex + 1) * horizontal.clientWidth,
        behavior: "smooth",
      });
    }

    function handleEndOfSong(section: HTMLElement) {
      const maxScroll = section.scrollHeight - section.clientHeight;

      if (maxScroll <= 0) {
        if (autoNext) {
          advanceToNextSong();
        } else {
          pausedRef.current = true;
        }
        return;
      }

      if (isAtScrollEnd(section)) {
        if (autoNext) {
          advanceToNextSong();
        } else {
          snapToScrollEnd(section);
          pausedRef.current = true;
        }
      }
    }

    function tick(timestamp: number) {
      if (document.hidden) {
        lastTime = timestamp;
        rafId = requestAnimationFrame(tick);
        return;
      }

      const section = sectionRefs.current?.[activeIndex];
      if (!section || pausedRef.current || advancingRef.current) {
        lastTime = timestamp;
        rafId = requestAnimationFrame(tick);
        return;
      }

      const deltaSeconds = lastTime ? (timestamp - lastTime) / 1000 : 0;
      lastTime = timestamp;

      if (deltaSeconds > 0) {
        scrollDown(section, speed * deltaSeconds);
      }

      handleEndOfSong(section);
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [
    enabled,
    speed,
    autoNext,
    activeIndex,
    songCount,
    sectionRefs,
    horizontalContainerRef,
  ]);
}
