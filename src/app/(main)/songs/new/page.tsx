import { SongForm } from "@/components/song/song-form";

export default function NewSongPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Nouveau chant</h1>
      <SongForm mode="create" />
    </div>
  );
}
