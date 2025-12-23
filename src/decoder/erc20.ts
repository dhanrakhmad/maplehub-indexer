import type { Log } from "viem";
import { TOPIC_ERC20_TRANSFER } from "@/decoder/topics";
import { decodeAddress } from "@/decoder/abi";

export type DecodedErc20Transfer = {
  from: `0x${string}`;
  to: `0x${string}`;
  amount: bigint;
};

export function decodeErc20Transfer(log: Log): DecodedErc20Transfer | null {
  const topics = log.topics;
  if (!topics) return null;

  const [topic0, fromTopic, toTopic] = topics;
  if (topic0 !== TOPIC_ERC20_TRANSFER || !fromTopic || !toTopic) {
    return null;
  }

  // ERC20 amount berada di data (non-indexed)
  const data = log.data;
  if (!data || data === "0x") return null;

  const from = decodeAddress(fromTopic);
  const to = decodeAddress(toTopic);
  const amount = BigInt(data);

  return { from, to, amount };
}
