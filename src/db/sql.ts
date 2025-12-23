// src/db/sql.ts
import { SQL } from "bun";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required");
}

export const sql = new SQL({
  url,
  max: 1,
  idleTimeout: 30,
  connectionTimeout: 10,
});
