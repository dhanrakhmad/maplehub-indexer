import { sql } from "@/db/sql";
import { CHAIN_ID } from "@/config/env";

export type TransferRow = {
  chain_id: number;
  block_number: bigint;
  block_hash: string;
  tx_hash: string;
  log_index: number;
  address: string;
  standard: "erc20" | "erc721" | "erc1155";
  wallet_address: string;
  direction: "in" | "out";
  amount_raw: string | null;
  token_id: string | null;
};

export async function writeBlockAtomically(
  blockNumber: bigint,
  rows: TransferRow[],
  blockMeta: {
    block_hash: string;
    block_timestamp: Date;
  }
) {
  await sql.begin(async (tx) => {
    /* -------------------------------------------------
       1) BULK INSERT transfers (CORRECT Bun.SQL way)
    ------------------------------------------------- */
    if (rows.length > 0) {
      await tx`
        insert into asset_transfer_events
        ${tx(rows)}
        on conflict do nothing
      `;
    }

    /* -------------------------------------------------
       2) indexed_blocks (single row)
    ------------------------------------------------- */
    await tx`
      insert into indexed_blocks (
        chain_id,
        block_number,
        block_hash,
        block_timestamp
      )
      values (
        ${CHAIN_ID},
        ${blockNumber},
        ${blockMeta.block_hash},
        ${blockMeta.block_timestamp}
      )
      on conflict do nothing
    `;

    /* -------------------------------------------------
       3) advance cursor
    ------------------------------------------------- */
    await tx`
      update indexer_cursors
      set cursor_block = ${blockNumber},
          updated_at = now()
      where id = 'main'
    `;
  });
}
