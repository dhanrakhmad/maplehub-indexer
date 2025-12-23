import { sql } from "../src/db/sql";

console.log("[migrate] running schema migration");

await sql.file("sql/schema.sql");

console.log("[migrate] done");
