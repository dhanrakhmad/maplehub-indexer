import { publicClient } from "@/fetcher/client";

export async function fetchBlockMeta(blockNumber: bigint) {
  const block = await publicClient.getBlock({
    blockNumber,
  });

  if (!block.hash || !block.timestamp) {
    throw new Error(`Invalid block meta for ${blockNumber.toString()}`);
  }

  return {
    block_hash: block.hash,
    block_timestamp: new Date(Number(block.timestamp) * 1000),
  };
}
