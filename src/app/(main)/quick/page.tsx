import Link from "next/link";
import { Plus } from "lucide-react";

import { LinkButton } from "@/components/ui/link-button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getQuickPlaylists } from "@/lib/actions/quick-playlists";

export const dynamic = "force-dynamic";

export default async function QuickPlaylistsPage() {
  const playlists = await getQuickPlaylists();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Playlists rapides</h1>
          <p className="text-muted-foreground">
            Collez vos paroles et prévisualisez-les en swipe.
          </p>
        </div>
        <LinkButton href="/quick/new">
          <Plus className="size-4" />
          Nouvelle playlist rapide
        </LinkButton>
      </div>

      {playlists.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="mb-4 text-muted-foreground">
            Aucune playlist rapide pour l&apos;instant.
          </p>
          <LinkButton href="/quick/new">Créer la première playlist</LinkButton>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {playlists.map((playlist) => (
            <Link key={playlist.id} href={`/quick/${playlist.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardHeader>
                  <CardTitle>{playlist.title}</CardTitle>
                  <CardDescription>
                    Créée le{" "}
                    {playlist.createdAt.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
