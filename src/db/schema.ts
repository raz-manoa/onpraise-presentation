import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const songs = pgTable("songs", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  author: text("author"),
  ccli: text("ccli"),
  originalKey: text("original_key"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const playlists = pgTable(
  "playlists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    shareCode: text("share_code"),
    isPublic: boolean("is_public").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("playlists_share_code_idx").on(table.shareCode)],
);

export const playlistSongs = pgTable(
  "playlist_songs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playlistId: uuid("playlist_id")
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),
    songId: uuid("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    keyOverride: text("key_override"),
  },
  (table) => [
    index("playlist_songs_playlist_position_idx").on(
      table.playlistId,
      table.position,
    ),
  ],
);

export const songsRelations = relations(songs, ({ many }) => ({
  playlistSongs: many(playlistSongs),
}));

export const playlistsRelations = relations(playlists, ({ many }) => ({
  playlistSongs: many(playlistSongs),
}));

export const playlistSongsRelations = relations(playlistSongs, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistSongs.playlistId],
    references: [playlists.id],
  }),
  song: one(songs, {
    fields: [playlistSongs.songId],
    references: [songs.id],
  }),
}));

export const quickPlaylists = pgTable("quick_playlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quickSongs = pgTable(
  "quick_songs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quickPlaylistId: uuid("quick_playlist_id")
      .notNull()
      .references(() => quickPlaylists.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    lyrics: text("lyrics").notNull(),
    position: integer("position").notNull(),
  },
  (table) => [
    index("quick_songs_playlist_position_idx").on(
      table.quickPlaylistId,
      table.position,
    ),
  ],
);

export const quickPlaylistsRelations = relations(quickPlaylists, ({ many }) => ({
  quickSongs: many(quickSongs),
}));

export const quickSongsRelations = relations(quickSongs, ({ one }) => ({
  quickPlaylist: one(quickPlaylists, {
    fields: [quickSongs.quickPlaylistId],
    references: [quickPlaylists.id],
  }),
}));
