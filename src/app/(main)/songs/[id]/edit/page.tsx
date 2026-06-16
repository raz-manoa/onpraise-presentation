import { notFound } from "next/navigation";

import { SongForm } from "@/components/song/song-form";
import { getSong } from "@/lib/actions/songs";

export const dynamic = "force-dynamic";

type EditSongPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSongPage({ params }: EditSongPageProps) {
  const { id } = await params;
  const song = await getSong(id);

  if (!song) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Modifier le chant</h1>
      <SongForm
        mode="edit"
        initialValues={{
          id: song.id,
          title: song.title,
          author: song.author,
          ccli: song.ccli,
          originalKey: song.originalKey,
          content: song.content,
        }}
      />
    </div>
  );
}
