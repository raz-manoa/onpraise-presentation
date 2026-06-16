"use client";

import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KEY_OPTIONS, semitonesBetween } from "@/lib/keys";

type KeySelectorProps = {
  originalKey?: string | null;
  value: string;
  onChange: (key: string) => void;
};

export function KeySelector({ originalKey, value, onChange }: KeySelectorProps) {
  const semitones = useMemo(
    () => semitonesBetween(originalKey, value),
    [originalKey, value],
  );

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value}
        onValueChange={(key) => key && onChange(key)}
      >
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Tonalité" />
        </SelectTrigger>
        <SelectContent>
          {KEY_OPTIONS.map((key) => (
            <SelectItem key={key} value={key}>
              {key}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {originalKey && semitones !== 0 && (
        <span className="text-xs text-muted-foreground">
          {semitones > 0 ? `+${semitones}` : semitones} depuis {originalKey}
        </span>
      )}
    </div>
  );
}

export function useTransposition(
  originalKey: string | null | undefined,
  selectedKey: string,
) {
  return useMemo(
    () => semitonesBetween(originalKey, selectedKey),
    [originalKey, selectedKey],
  );
}
