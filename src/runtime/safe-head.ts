import { publicClient } from "@/fetcher/client";
import { CONFIRMATION_DEPTH } from "@/config/env";

export async function getSafeHead(): Promise<bigint> {
  const latest = await publicClient.getBlockNumber();

  if (latest <= CONFIRMATION_DEPTH) {
    return -1n;
  }

  return latest - CONFIRMATION_DEPTH;
}
