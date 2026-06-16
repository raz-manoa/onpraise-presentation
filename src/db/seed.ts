import { db } from "./index";
import { playlistSongs, playlists, songs } from "./schema";

const sampleSongs = [
  {
    title: "Amazing Grace",
    author: "John Newton",
    originalKey: "G",
    content: `{title: Amazing Grace}
{key: G}
{start_of_verse}
A[G]mazing [G]grace, how [C]sweet the [G]sound
That [G]saved a [D]wretch like [G]me
I [G]once was [G]lost, but [C]now am [G]found
Was [G]blind but [D]now I [G]see
{end_of_verse}
{start_of_chorus: Refrain}
[G]Amazing grace, how [C]sweet the [G]sound
{end_of_chorus}`,
  },
  {
    title: "How Great Thou Art",
    author: "Stuart K. Hine",
    originalKey: "Bb",
    content: `{title: How Great Thou Art}
{key: Bb}
{start_of_verse}
O [Bb]Lord my [Bb]God, when [Eb]I in awe[Bb]some wonder
Con[Bb]sider [F]all the [Bb]worlds Thy hands have made
{end_of_verse}`,
  },
  {
    title: "10,000 Reasons",
    author: "Matt Redman",
    originalKey: "G",
    content: `{title: 10,000 Reasons}
{key: G}
{start_of_verse}
[G]Bless the [G]Lord, O my [D]soul, O my [Em]soul
Worship His [C]holy [G]name
{end_of_verse}`,
  },
];

async function seed() {
  console.log("Seeding database...");

  const insertedSongs = await db.insert(songs).values(sampleSongs).returning();

  const [playlist] = await db
    .insert(playlists)
    .values({
      title: "Culte du dimanche",
      shareCode: "demo123456",
      isPublic: true,
    })
    .returning();

  await db.insert(playlistSongs).values(
    insertedSongs.map((song, index) => ({
      playlistId: playlist.id,
      songId: song.id,
      position: index,
    })),
  );

  console.log(`Seeded ${insertedSongs.length} songs and 1 playlist.`);
  console.log(`Public demo URL: /p/${playlist.shareCode}`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
