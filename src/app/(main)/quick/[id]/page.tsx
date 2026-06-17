import { notFound } from "next/navigation";
import { Play } from "lucide-react";

import { QuickPlaylistTitleEditor } from "@/components/quick/quick-playlist-title-editor";
import { QuickSharePanel } from "@/components/quick/quick-share-panel";
import { QuickSongForm } from "@/components/quick/quick-song-form";
import { QuickSongList } from "@/components/quick/quick-song-list";
import { LinkButton } from "@/components/ui/link-button";
import {
  ensureQuickPlaylistSlug,
  getQuickPlaylist,
} from "@/lib/actions/quick-playlists";
import { getQuickPreviewUrl } from "@/lib/share";

export const dynamic = "force-dynamic";

type QuickPlaylistPageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuickPlaylistPage({
  params,
}: QuickPlaylistPageProps) {
  const { id } = await params;
  const playlist = await getQuickPlaylist(id);

  if (!playlist) notFound();

  const slug = playlist.slug ?? (await ensureQuickPlaylistSlug(playlist.id));

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <QuickPlaylistTitleEditor
          playlistId={playlist.id}
          initialTitle={playlist.title}
        />
        {playlist.songs.length > 0 && (
          <LinkButton href={`/quick/${playlist.id}/preview`}>
            <Play className="size-4" />
            Lancer la preview
          </LinkButton>
        )}
      </div>

      <QuickSongForm playlistId={playlist.id} />

      <QuickSongList
        key={playlist.songs.map((song) => `${song.id}-${song.position}`).join("-")}
        playlistId={playlist.id}
        songs={playlist.songs}
      />

      <QuickSharePanel url={getQuickPreviewUrl(slug)} />
    </div>
  );
}
