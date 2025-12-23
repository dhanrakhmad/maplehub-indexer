import { sql } from "@/db/sql";
import { getSafeHead } from "@/runtime/safe-head";

export async function readHealth() {
  const rows = await sql<{ cursor_block: unknown }[]>`
    select cursor_block
    from indexer_cursors
    where id = 'main'
  `;

  const [row] = rows;
  if (!row) {
    throw new Error("cursor row not found");
  }

  // 🚨 WAJIB: paksa ke BigInt
  const cursorBlock = BigInt(row.cursor_block as any);

  const safeHeadRaw = await getSafeHead();
  const safeHead =
    typeof safeHeadRaw === "bigint" ? safeHeadRaw : BigInt(safeHeadRaw);

  const lag = safeHead - cursorBlock;

  return {
    cursor_block: cursorBlock.toString(),
    safe_head: safeHead.toString(),
    lag: lag.toString(),
    healthy: lag <= 100n,
  };
}
