import Link from "next/link";
import { Music2, Plus } from "lucide-react";

import { LinkButton } from "@/components/ui/link-button";

export function SiteHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Music2 className="size-5" />
          OnPraise
        </Link>
        <nav className="flex items-center gap-2">
          <LinkButton variant="ghost" href="/songs">
            Chants
          </LinkButton>
          <LinkButton variant="ghost" href="/playlists">
            Playlists
          </LinkButton>
          <LinkButton href="/playlists/new" size="sm">
            <Plus className="size-4" />
            Nouvelle playlist
          </LinkButton>
        </nav>
      </div>
    </header>
  );
}
