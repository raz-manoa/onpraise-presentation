import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

declare global {
  var __dbClient: ReturnType<typeof postgres> | undefined;
}

function getClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!global.__dbClient) {
    global.__dbClient = postgres(connectionString, { prepare: false });
  }

  return global.__dbClient;
}

export const db = drizzle(getClient(), { schema });
