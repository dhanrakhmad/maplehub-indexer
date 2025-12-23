import { sql } from "@/db/sql";

export async function readCursor(): Promise<bigint> {
  const rows = await sql`
    select cursor_block
    from indexer_cursors
    where id = 'main'
  `;

  if (rows.length === 0) {
    throw new Error("Cursor row not found");
  }

  return BigInt(rows[0].cursor_block);
}
