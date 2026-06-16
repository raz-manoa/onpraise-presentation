import Link from "next/link";
import { Plus } from "lucide-react";

import { LinkButton } from "@/components/ui/link-button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPlaylists } from "@/lib/actions/playlists";

export const dynamic = "force-dynamic";

export default async function PlaylistsPage() {
  const playlists = await getPlaylists();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Playlists</h1>
          <p className="text-muted-foreground">
            Gérez vos setlists de culte.
          </p>
        </div>
        <LinkButton href="/playlists/new">
          <Plus className="size-4" />
          Nouvelle playlist
        </LinkButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {playlists.map((playlist) => (
          <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
            <Card className="transition-colors hover:bg-muted/40">
              <CardHeader>
                <CardTitle>{playlist.title}</CardTitle>
                <CardDescription>
                  {playlist.isPublic ? "Partagée publiquement" : "Privée"}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
