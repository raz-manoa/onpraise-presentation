"use server";

import { asc, desc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { songs } from "@/db/schema";

const songSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  author: z.string().optional(),
  ccli: z.string().optional(),
  originalKey: z.string().optional(),
  content: z.string().min(1, "Le contenu ChordPro est requis"),
});

export async function getSongs(query?: string) {
  if (query?.trim()) {
    const pattern = `%${query.trim()}%`;
    return db
      .select()
      .from(songs)
      .where(or(ilike(songs.title, pattern), ilike(songs.author, pattern)))
      .orderBy(asc(songs.title));
  }

  return db.select().from(songs).orderBy(asc(songs.title));
}

export async function getSong(id: string) {
  const [song] = await db.select().from(songs).where(eq(songs.id, id)).limit(1);
  return song ?? null;
}

export async function createSong(input: z.infer<typeof songSchema>) {
  const data = songSchema.parse(input);

  const [song] = await db
    .insert(songs)
    .values({
      title: data.title,
      author: data.author || null,
      ccli: data.ccli || null,
      originalKey: data.originalKey || null,
      content: data.content,
    })
    .returning();

  revalidatePath("/songs");
  return song;
}

export async function updateSong(
  id: string,
  input: z.infer<typeof songSchema>,
) {
  const data = songSchema.parse(input);

  const [song] = await db
    .update(songs)
    .set({
      title: data.title,
      author: data.author || null,
      ccli: data.ccli || null,
      originalKey: data.originalKey || null,
      content: data.content,
      updatedAt: new Date(),
    })
    .where(eq(songs.id, id))
    .returning();

  revalidatePath("/songs");
  revalidatePath(`/songs/${id}/edit`);
  return song;
}

export async function deleteSong(id: string) {
  await db.delete(songs).where(eq(songs.id, id));
  revalidatePath("/songs");
}

export async function getRecentSongs(limit = 5) {
  return db
    .select()
    .from(songs)
    .orderBy(desc(songs.updatedAt))
    .limit(limit);
}
