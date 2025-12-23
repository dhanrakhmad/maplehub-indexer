import { fetchLogsForBlock } from "@/fetcher/logs";
import { fetchBlockMeta } from "@/fetcher/block";
import { decodeErc721Transfer } from "@/decoder/erc721";
import { decodeErc20Transfer } from "@/decoder/erc20";
import { decodeErc1155 } from "@/decoder/erc1155";
import { writeBlockAtomically, type TransferRow } from "@/writer/write-block";
import { CHAIN_ID } from "@/config/env";

export async function processBlock(blockNumber: bigint) {
  const logs = await fetchLogsForBlock(blockNumber);
  const blockMeta = await fetchBlockMeta(blockNumber);

  logs.sort((a, b) => {
    const ai = a.logIndex ?? 0;
    const bi = b.logIndex ?? 0;
    return ai - bi;
  });

  const rows: TransferRow[] = [];

  for (const log of logs) {
    const blockHash = log.blockHash;
    const txHash = log.transactionHash;
    const logIndex = log.logIndex ?? 0;
    const address = log.address;

    // Skip log tanpa hash penting (defensive, deterministik)
    if (!blockHash || !txHash) continue;

    /* =========================
       ERC721
    ========================= */
    const erc721 = decodeErc721Transfer(log);
    if (erc721) {
      rows.push(
        {
          chain_id: CHAIN_ID,
          block_number: blockNumber,
          block_hash: blockHash,
          tx_hash: txHash,
          log_index: logIndex,
          address,
          standard: "erc721",
          wallet_address: erc721.from,
          direction: "out",
          amount_raw: null,
          token_id: erc721.tokenId.toString(),
        },
        {
          chain_id: CHAIN_ID,
          block_number: blockNumber,
          block_hash: blockHash,
          tx_hash: txHash,
          log_index: logIndex,
          address,
          standard: "erc721",
          wallet_address: erc721.to,
          direction: "in",
          amount_raw: null,
          token_id: erc721.tokenId.toString(),
        }
      );
      continue;
    }

    /* =========================
       ERC20
    ========================= */
    const erc20 = decodeErc20Transfer(log);
    if (erc20) {
      rows.push(
        {
          chain_id: CHAIN_ID,
          block_number: blockNumber,
          block_hash: blockHash,
          tx_hash: txHash,
          log_index: logIndex,
          address,
          standard: "erc20",
          wallet_address: erc20.from,
          direction: "out",
          amount_raw: erc20.amount.toString(),
          token_id: null,
        },
        {
          chain_id: CHAIN_ID,
          block_number: blockNumber,
          block_hash: blockHash,
          tx_hash: txHash,
          log_index: logIndex,
          address,
          standard: "erc20",
          wallet_address: erc20.to,
          direction: "in",
          amount_raw: erc20.amount.toString(),
          token_id: null,
        }
      );
      continue;
    }

    /* =========================
       ERC1155
    ========================= */
    const erc1155 = decodeErc1155(log);
    if (erc1155) {
      if (erc1155.kind === "single") {
        rows.push(
          {
            chain_id: CHAIN_ID,
            block_number: blockNumber,
            block_hash: blockHash,
            tx_hash: txHash,
            log_index: logIndex,
            address,
            standard: "erc1155",
            wallet_address: erc1155.from,
            direction: "out",
            amount_raw: erc1155.value.toString(),
            token_id: erc1155.id.toString(),
          },
          {
            chain_id: CHAIN_ID,
            block_number: blockNumber,
            block_hash: blockHash,
            tx_hash: txHash,
            log_index: logIndex,
            address,
            standard: "erc1155",
            wallet_address: erc1155.to,
            direction: "in",
            amount_raw: erc1155.value.toString(),
            token_id: erc1155.id.toString(),
          }
        );
      } else {
        const { ids, values } = erc1155;
        const len = Math.min(ids.length, values.length);
        for (let i = 0; i < len; i++) {
          const value = values[i];
          const id = ids[i];

          if (value === undefined || id === undefined) {
            continue; // defensive, deterministic
          }

          rows.push(
            {
              chain_id: CHAIN_ID,
              block_number: blockNumber,
              block_hash: blockHash,
              tx_hash: txHash,
              log_index: logIndex,
              address,
              standard: "erc1155",
              wallet_address: erc1155.from,
              direction: "out",
              amount_raw: value.toString(),
              token_id: id.toString(),
            },
            {
              chain_id: CHAIN_ID,
              block_number: blockNumber,
              block_hash: blockHash,
              tx_hash: txHash,
              log_index: logIndex,
              address,
              standard: "erc1155",
              wallet_address: erc1155.to,
              direction: "in",
              amount_raw: value.toString(),
              token_id: id.toString(),
            }
          );
        }
      }
    }
  }

  await writeBlockAtomically(blockNumber, rows, blockMeta);

  console.log(
    `[indexer] committed block ${blockNumber.toString()} | rows=${rows.length}`
  );
}
