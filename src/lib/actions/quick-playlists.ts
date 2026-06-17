"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { quickPlaylists, quickSongs } from "@/db/schema";
import { hasLyricsContent, sanitizeLyrics } from "@/lib/sanitize-lyrics";

const quickPlaylistSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
});

const quickSongSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  lyrics: z.string().refine(hasLyricsContent, "Les paroles sont requises"),
});

export type QuickPlaylistWithSongs = NonNullable<
  Awaited<ReturnType<typeof getQuickPlaylist>>
>;

export async function getQuickPlaylists() {
  return db
    .select()
    .from(quickPlaylists)
    .orderBy(asc(quickPlaylists.createdAt));
}

export async function getQuickPlaylist(id: string) {
  const [playlist] = await db
    .select()
    .from(quickPlaylists)
    .where(eq(quickPlaylists.id, id))
    .limit(1);

  if (!playlist) return null;

  const songs = await db
    .select()
    .from(quickSongs)
    .where(eq(quickSongs.quickPlaylistId, id))
    .orderBy(asc(quickSongs.position));

  return { ...playlist, songs };
}

export async function createQuickPlaylist(
  input: z.infer<typeof quickPlaylistSchema>,
) {
  const data = quickPlaylistSchema.parse(input);

  const [playlist] = await db
    .insert(quickPlaylists)
    .values({ title: data.title })
    .returning();

  revalidatePath("/quick");
  return playlist;
}

export async function updateQuickPlaylistTitle(id: string, title: string) {
  const data = quickPlaylistSchema.parse({ title });

  const [playlist] = await db
    .update(quickPlaylists)
    .set({ title: data.title })
    .where(eq(quickPlaylists.id, id))
    .returning();

  revalidatePath("/quick");
  revalidatePath(`/quick/${id}`);
  return playlist;
}

export async function deleteQuickPlaylist(id: string) {
  await db.delete(quickPlaylists).where(eq(quickPlaylists.id, id));
  revalidatePath("/quick");
}

export async function addQuickSong(
  playlistId: string,
  input: z.infer<typeof quickSongSchema>,
) {
  const data = quickSongSchema.parse(input);
  const lyrics = sanitizeLyrics(data.lyrics);

  const existing = await db
    .select({ position: quickSongs.position })
    .from(quickSongs)
    .where(eq(quickSongs.quickPlaylistId, playlistId))
    .orderBy(asc(quickSongs.position));

  const nextPosition =
    existing.length > 0 ? existing[existing.length - 1].position + 1 : 0;

  const [song] = await db
    .insert(quickSongs)
    .values({
      quickPlaylistId: playlistId,
      title: data.title,
      lyrics,
      position: nextPosition,
    })
    .returning();

  revalidatePath(`/quick/${playlistId}`);
  return song;
}

export async function updateQuickSong(
  id: string,
  input: z.infer<typeof quickSongSchema>,
) {
  const data = quickSongSchema.parse(input);
  const lyrics = sanitizeLyrics(data.lyrics);

  const [song] = await db
    .update(quickSongs)
    .set({
      title: data.title,
      lyrics,
    })
    .where(eq(quickSongs.id, id))
    .returning();

  if (song) {
    revalidatePath(`/quick/${song.quickPlaylistId}`);
    revalidatePath(`/quick/${song.quickPlaylistId}/preview`);
  }

  return song;
}

export async function removeQuickSong(playlistId: string, songId: string) {
  await db.delete(quickSongs).where(eq(quickSongs.id, songId));
  revalidatePath(`/quick/${playlistId}`);
}

export async function reorderQuickSongs(
  playlistId: string,
  orderedIds: string[],
) {
  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(quickSongs)
        .set({ position: index })
        .where(eq(quickSongs.id, id)),
    ),
  );

  revalidatePath(`/quick/${playlistId}`);
}
