"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { playlistSongs, playlists, songs } from "@/db/schema";
import { generateShareCode, getPublicUrl } from "@/lib/share";

const playlistSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
});

export type PlaylistWithSongs = NonNullable<
  Awaited<ReturnType<typeof getPlaylistWithSongs>>
>;

export async function getPlaylists() {
  return db.select().from(playlists).orderBy(asc(playlists.createdAt));
}

export async function getPlaylist(id: string) {
  const [playlist] = await db
    .select()
    .from(playlists)
    .where(eq(playlists.id, id))
    .limit(1);

  return playlist ?? null;
}

export async function getPlaylistWithSongs(id: string) {
  const playlist = await getPlaylist(id);
  if (!playlist) return null;

  const items = await db
    .select({
      id: playlistSongs.id,
      position: playlistSongs.position,
      keyOverride: playlistSongs.keyOverride,
      song: songs,
    })
    .from(playlistSongs)
    .innerJoin(songs, eq(playlistSongs.songId, songs.id))
    .where(eq(playlistSongs.playlistId, id))
    .orderBy(asc(playlistSongs.position));

  return { ...playlist, items };
}

export async function getPublicPlaylist(shareCode: string) {
  const [playlist] = await db
    .select()
    .from(playlists)
    .where(eq(playlists.shareCode, shareCode))
    .limit(1);

  if (!playlist || !playlist.isPublic) return null;

  const items = await db
    .select({
      id: playlistSongs.id,
      position: playlistSongs.position,
      keyOverride: playlistSongs.keyOverride,
      song: songs,
    })
    .from(playlistSongs)
    .innerJoin(songs, eq(playlistSongs.songId, songs.id))
    .where(eq(playlistSongs.playlistId, playlist.id))
    .orderBy(asc(playlistSongs.position));

  return { ...playlist, items };
}

export async function createPlaylist(input: z.infer<typeof playlistSchema>) {
  const data = playlistSchema.parse(input);

  const [playlist] = await db
    .insert(playlists)
    .values({ title: data.title })
    .returning();

  revalidatePath("/");
  revalidatePath("/playlists");
  return playlist;
}

export async function updatePlaylistTitle(id: string, title: string) {
  const data = playlistSchema.parse({ title });

  const [playlist] = await db
    .update(playlists)
    .set({ title: data.title })
    .where(eq(playlists.id, id))
    .returning();

  revalidatePath("/playlists");
  revalidatePath(`/playlists/${id}`);
  return playlist;
}

export async function deletePlaylist(id: string) {
  await db.delete(playlists).where(eq(playlists.id, id));
  revalidatePath("/");
  revalidatePath("/playlists");
}

export async function addSongToPlaylist(playlistId: string, songId: string) {
  const existing = await db
    .select({ position: playlistSongs.position })
    .from(playlistSongs)
    .where(eq(playlistSongs.playlistId, playlistId))
    .orderBy(asc(playlistSongs.position));

  const nextPosition =
    existing.length > 0 ? existing[existing.length - 1].position + 1 : 0;

  await db.insert(playlistSongs).values({
    playlistId,
    songId,
    position: nextPosition,
  });

  revalidatePath(`/playlists/${playlistId}`);
}

export async function removeSongFromPlaylist(
  playlistId: string,
  playlistSongId: string,
) {
  await db
    .delete(playlistSongs)
    .where(eq(playlistSongs.id, playlistSongId));

  revalidatePath(`/playlists/${playlistId}`);
}

export async function reorderPlaylistSongs(
  playlistId: string,
  orderedIds: string[],
) {
  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(playlistSongs)
        .set({ position: index })
        .where(eq(playlistSongs.id, id)),
    ),
  );

  revalidatePath(`/playlists/${playlistId}`);
}

export async function enablePublicShare(playlistId: string) {
  const playlist = await getPlaylist(playlistId);
  if (!playlist) throw new Error("Playlist introuvable");

  const shareCode = playlist.shareCode ?? generateShareCode();

  const [updated] = await db
    .update(playlists)
    .set({ shareCode, isPublic: true })
    .where(eq(playlists.id, playlistId))
    .returning();

  revalidatePath(`/playlists/${playlistId}`);

  return {
    shareCode: updated.shareCode!,
    publicUrl: getPublicUrl(updated.shareCode!),
  };
}

export async function disablePublicShare(playlistId: string) {
  await db
    .update(playlists)
    .set({ isPublic: false })
    .where(eq(playlists.id, playlistId));

  revalidatePath(`/playlists/${playlistId}`);
}
