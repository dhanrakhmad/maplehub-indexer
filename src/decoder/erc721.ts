import type { Log } from "viem";
import { TOPIC_ERC721_TRANSFER } from "@/decoder/topics";
import { decodeAddress, decodeUint256 } from "@/decoder/abi";

export type DecodedErc721Transfer = {
  from: `0x${string}`;
  to: `0x${string}`;
  tokenId: bigint;
};

export function decodeErc721Transfer(log: Log): DecodedErc721Transfer | null {
  const topics = log.topics;
  if (!topics) return null;

  // Destructure safely (TS understands this)
  const [topic0, fromTopic, toTopic, tokenIdTopic] = topics;

  if (
    topic0 !== TOPIC_ERC721_TRANSFER ||
    !fromTopic ||
    !toTopic ||
    !tokenIdTopic
  ) {
    return null;
  }

  const from = decodeAddress(fromTopic);
  const to = decodeAddress(toTopic);
  const tokenId = decodeUint256(tokenIdTopic);

  return { from, to, tokenId };
}
