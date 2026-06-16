"use client";

import { Check, Copy, Link2, Share2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  disablePublicShare,
  enablePublicShare,
} from "@/lib/actions/playlists";

type SharePanelProps = {
  playlistId: string;
  isPublic: boolean;
  shareCode?: string | null;
  publicUrl?: string;
};

export function SharePanel({
  playlistId,
  isPublic: initialIsPublic,
  shareCode,
  publicUrl,
}: SharePanelProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [url, setUrl] = useState(publicUrl ?? "");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleEnableShare() {
    startTransition(async () => {
      const result = await enablePublicShare(playlistId);
      setIsPublic(true);
      setUrl(result.publicUrl);
    });
  }

  function handleDisableShare() {
    startTransition(async () => {
      await disablePublicShare(playlistId);
      setIsPublic(false);
    });
  }

  async function handleCopy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Share2 className="size-4" />
        <h2 className="font-medium">Lien de présentation public</h2>
      </div>

      {!isPublic ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Générez un lien consultable sans compte. Swipe horizontal entre les
            chants, scroll vertical pour les paroles.
          </p>
          <Button onClick={handleEnableShare} disabled={isPending}>
            <Link2 className="size-4" />
            Générer le lien public
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input value={url} readOnly />
            <Button variant="outline" onClick={handleCopy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
          {shareCode && (
            <p className="text-xs text-muted-foreground">Code : {shareCode}</p>
          )}
          <Button
            variant="outline"
            onClick={handleDisableShare}
            disabled={isPending}
          >
            Désactiver le partage
          </Button>
        </div>
      )}
    </div>
  );
}
