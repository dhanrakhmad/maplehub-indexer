import { publicClient } from "@/fetcher/client";

export async function fetchLogsForBlock(blockNumber: bigint) {
  // IMPORTANT:
  // - fromBlock = toBlock = blockNumber
  // - no window
  // - no pagination
  return publicClient.getLogs({
    fromBlock: blockNumber,
    toBlock: blockNumber,
  });
}
