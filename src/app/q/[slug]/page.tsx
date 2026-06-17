import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LyricsSwiper } from "@/components/quick/lyrics-swiper";
import { getQuickPlaylistBySlug } from "@/lib/actions/quick-playlists";

export const dynamic = "force-dynamic";

type QuickSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: QuickSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const playlist = await getQuickPlaylistBySlug(slug);

  return {
    title: playlist ? `${playlist.title} — OnPraise` : "Preview — OnPraise",
    robots: { index: false, follow: false },
  };
}

export default async function QuickSlugPage({ params }: QuickSlugPageProps) {
  const { slug } = await params;
  const playlist = await getQuickPlaylistBySlug(slug);

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
