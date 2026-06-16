import Link from "next/link";
import { Plus } from "lucide-react";

import { LinkButton } from "@/components/ui/link-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPlaylists } from "@/lib/actions/playlists";
import { getRecentSongs } from "@/lib/actions/songs";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [playlists, recentSongs] = await Promise.all([
    getPlaylists(),
    getRecentSongs(5),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Playlists</h1>
          <p className="text-muted-foreground">
            Préparez vos setlists et partagez-les en un lien public.
          </p>
        </div>
        <LinkButton href="/playlists/new">
          <Plus className="size-4" />
          Nouvelle playlist
        </LinkButton>
      </div>

      {playlists.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucune playlist</CardTitle>
            <CardDescription>
              Créez votre première playlist pour organiser un culte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LinkButton href="/playlists/new">Créer une playlist</LinkButton>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {playlists.map((playlist) => (
            <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardHeader>
                  <CardTitle>{playlist.title}</CardTitle>
                  <CardDescription>
                    {playlist.isPublic
                      ? "Lien public actif"
                      : "Non partagée"}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Chants récents</h2>
          <LinkButton variant="ghost" href="/songs">
            Voir la bibliothèque
          </LinkButton>
        </div>
        {recentSongs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun chant pour l&apos;instant.{" "}
            <Link href="/songs/new" className="underline">
              Créer un chant
            </Link>
          </p>
        ) : (
          <div className="space-y-2">
            {recentSongs.map((song) => (
              <Link
                key={song.id}
                href={`/songs/${song.id}/edit`}
                className="block rounded-lg border p-3 transition-colors hover:bg-muted/40"
              >
                <p className="font-medium">{song.title}</p>
                <p className="text-sm text-muted-foreground">
                  {[song.author, song.originalKey].filter(Boolean).join(" · ")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
