import { notFound } from "next/navigation";

import { PlaylistTitleEditor } from "@/components/playlist/playlist-title-editor";
import { SharePanel } from "@/components/playlist/share-panel";
import { SongPicker } from "@/components/playlist/song-picker";
import { SortablePlaylist } from "@/components/playlist/sortable-playlist";
import { getPlaylistWithSongs } from "@/lib/actions/playlists";
import { getPublicUrl } from "@/lib/share";

export const dynamic = "force-dynamic";

type PlaylistPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { id } = await params;
  const playlist = await getPlaylistWithSongs(id);

  if (!playlist) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <PlaylistTitleEditor playlistId={playlist.id} initialTitle={playlist.title} />

      <div className="flex flex-wrap gap-2">
        <SongPicker
          playlistId={playlist.id}
          existingSongIds={playlist.items.map((item) => item.song.id)}
        />
      </div>

      <SortablePlaylist
        key={playlist.items.map((item) => `${item.id}-${item.position}`).join("-")}
        playlistId={playlist.id}
        items={playlist.items}
      />

      <SharePanel
        playlistId={playlist.id}
        isPublic={playlist.isPublic}
        shareCode={playlist.shareCode}
        publicUrl={
          playlist.shareCode && playlist.isPublic
            ? getPublicUrl(playlist.shareCode)
            : undefined
        }
      />
    </div>
  );
}
