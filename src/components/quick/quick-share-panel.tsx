"use client";

import { Check, Copy, Link2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type QuickSharePanelProps = {
  url: string;
};

export function QuickSharePanel({ url }: QuickSharePanelProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Link2 className="size-4" />
        <h2 className="font-medium">Lien de preview</h2>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        Partagez ce lien lisible pour afficher les paroles en mode swipe.
      </p>

      <div className="flex gap-2">
        <Input value={url} readOnly />
        <Button variant="outline" onClick={handleCopy} aria-label="Copier le lien">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
