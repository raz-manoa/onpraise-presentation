"use server";

import { and, asc, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { quickPlaylists, quickSongs } from "@/db/schema";
import { hasLyricsContent, sanitizeLyrics } from "@/lib/sanitize-lyrics";
import { slugify } from "@/lib/slug";

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

async function generateUniqueQuickSlug(title: string, excludeId?: string) {
  const base = slugify(title);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const conditions = excludeId
      ? and(eq(quickPlaylists.slug, candidate), ne(quickPlaylists.id, excludeId))
      : eq(quickPlaylists.slug, candidate);

    const [existing] = await db
      .select({ id: quickPlaylists.id })
      .from(quickPlaylists)
      .where(conditions)
      .limit(1);

    if (!existing) return candidate;

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function getQuickPlaylistSongs(playlistId: string) {
  return db
    .select()
    .from(quickSongs)
    .where(eq(quickSongs.quickPlaylistId, playlistId))
    .orderBy(asc(quickSongs.position));
}

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

  const songs = await getQuickPlaylistSongs(id);

  return { ...playlist, songs };
}

export async function getQuickPlaylistBySlug(slug: string) {
  const [playlist] = await db
    .select()
    .from(quickPlaylists)
    .where(eq(quickPlaylists.slug, slug))
    .limit(1);

  if (!playlist) return null;

  const songs = await getQuickPlaylistSongs(playlist.id);

  return { ...playlist, songs };
}

export async function ensureQuickPlaylistSlug(id: string) {
  const playlist = await getQuickPlaylist(id);
  if (!playlist) throw new Error("Playlist introuvable");

  if (playlist.slug) return playlist.slug;

  const slug = await generateUniqueQuickSlug(playlist.title, id);

  const [updated] = await db
    .update(quickPlaylists)
    .set({ slug })
    .where(eq(quickPlaylists.id, id))
    .returning();

  revalidatePath(`/quick/${id}`);
  revalidatePath(`/q/${slug}`);

  return updated.slug!;
}

export async function createQuickPlaylist(
  input: z.infer<typeof quickPlaylistSchema>,
) {
  const data = quickPlaylistSchema.parse(input);
  const slug = await generateUniqueQuickSlug(data.title);

  const [playlist] = await db
    .insert(quickPlaylists)
    .values({ title: data.title, slug })
    .returning();

  revalidatePath("/quick");
  return playlist;
}

export async function updateQuickPlaylistTitle(id: string, title: string) {
  const data = quickPlaylistSchema.parse({ title });
  const existing = await getQuickPlaylist(id);
  if (!existing) throw new Error("Playlist introuvable");

  const slug = await generateUniqueQuickSlug(data.title, id);

  const [playlist] = await db
    .update(quickPlaylists)
    .set({ title: data.title, slug })
    .where(eq(quickPlaylists.id, id))
    .returning();

  revalidatePath("/quick");
  revalidatePath(`/quick/${id}`);
  if (existing.slug) revalidatePath(`/q/${existing.slug}`);
  if (slug) revalidatePath(`/q/${slug}`);

  return playlist;
}

export async function deleteQuickPlaylist(id: string) {
  const playlist = await getQuickPlaylist(id);

  await db.delete(quickPlaylists).where(eq(quickPlaylists.id, id));

  revalidatePath("/quick");
  if (playlist?.slug) revalidatePath(`/q/${playlist.slug}`);
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
  const playlist = await getQuickPlaylist(playlistId);
  if (playlist?.slug) revalidatePath(`/q/${playlist.slug}`);

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
    const playlist = await getQuickPlaylist(song.quickPlaylistId);
    if (playlist?.slug) revalidatePath(`/q/${playlist.slug}`);
  }

  return song;
}

export async function removeQuickSong(playlistId: string, songId: string) {
  await db.delete(quickSongs).where(eq(quickSongs.id, songId));
  revalidatePath(`/quick/${playlistId}`);
  const playlist = await getQuickPlaylist(playlistId);
  if (playlist?.slug) revalidatePath(`/q/${playlist.slug}`);
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
  const playlist = await getQuickPlaylist(playlistId);
  if (playlist?.slug) revalidatePath(`/q/${playlist.slug}`);
}
