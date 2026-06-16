import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SongSwiper } from "@/components/public/song-swiper";
import { getPublicPlaylist } from "@/lib/actions/playlists";

export const dynamic = "force-dynamic";

type PublicPresentationPageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({
  params,
}: PublicPresentationPageProps): Promise<Metadata> {
  const { code } = await params;
  const playlist = await getPublicPlaylist(code);

  return {
    title: playlist ? `${playlist.title} — OnPraise` : "Présentation — OnPraise",
    robots: { index: false, follow: false },
  };
}

export default async function PublicPresentationPage({
  params,
}: PublicPresentationPageProps) {
  const { code } = await params;
  const playlist = await getPublicPlaylist(code);

  if (!playlist) notFound();

  return (
    <SongSwiper
      playlistTitle={playlist.title}
      songs={playlist.items.map((item) => ({
        id: item.song.id,
        title: item.song.title,
        author: item.song.author,
        originalKey: item.song.originalKey,
        keyOverride: item.keyOverride,
        content: item.song.content,
      }))}
    />
  );
}
