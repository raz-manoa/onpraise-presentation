import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LyricsSwiper } from "@/components/quick/lyrics-swiper";
import { getQuickPlaylist } from "@/lib/actions/quick-playlists";

export const dynamic = "force-dynamic";

type QuickPreviewPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: QuickPreviewPageProps): Promise<Metadata> {
  const { id } = await params;
  const playlist = await getQuickPlaylist(id);

  return {
    title: playlist
      ? `${playlist.title} — Preview — OnPraise`
      : "Preview — OnPraise",
    robots: { index: false, follow: false },
  };
}

export default async function QuickPreviewPage({
  params,
}: QuickPreviewPageProps) {
  const { id } = await params;
  const playlist = await getQuickPlaylist(id);

  if (!playlist) notFound();

  return (
    <LyricsSwiper
      playlistTitle={playlist.title}
      songs={playlist.songs.map((song) => ({
        id: song.id,
        title: song.title,
        lyrics: song.lyrics,
      }))}
    />
  );
}
