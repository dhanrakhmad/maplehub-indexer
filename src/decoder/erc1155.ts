import type { Log } from "viem";
import {
  TOPIC_ERC1155_TRANSFER_SINGLE,
  TOPIC_ERC1155_TRANSFER_BATCH,
} from "@/decoder/topics";
import { decodeAddress } from "@/decoder/abi";

type Single = {
  kind: "single";
  from: `0x${string}`;
  to: `0x${string}`;
  id: bigint;
  value: bigint;
};

type Batch = {
  kind: "batch";
  from: `0x${string}`;
  to: `0x${string}`;
  ids: bigint[];
  values: bigint[];
};

export type DecodedErc1155 = Single | Batch;

function decodeUint256Array(hex: string): bigint[] {
  // ABI dynamic array: offset(32) | length(32) | items...
  // hex starts with 0x
  const data = hex.slice(2);
  const read = (i: number) => BigInt("0x" + data.slice(i * 64, i * 64 + 64));
  const offset = Number(read(0n as any)); // offset in bytes /32 handled by ABI; we read relative
  const start = offset / 32;
  const len = Number(read(start));
  const out: bigint[] = [];
  for (let i = 0; i < len; i++) {
    out.push(read(start + 1 + i));
  }
  return out;
}

export function decodeErc1155(log: Log): DecodedErc1155 | null {
  const topics = log.topics;
  if (!topics) return null;

  const [topic0, , fromTopic, toTopic] = topics;
  if (!fromTopic || !toTopic) return null;

  const from = decodeAddress(fromTopic);
  const to = decodeAddress(toTopic);

  if (topic0 === TOPIC_ERC1155_TRANSFER_SINGLE) {
    if (!log.data || log.data === "0x") return null;
    // data = id (32) | value (32)
    const id = BigInt(log.data.slice(0, 66));
    const value = BigInt("0x" + log.data.slice(66, 130));
    return { kind: "single", from, to, id, value };
  }

  if (topic0 === TOPIC_ERC1155_TRANSFER_BATCH) {
    if (!log.data || log.data === "0x") return null;
    const ids = decodeUint256Array(log.data);
    // values array follows ids array in ABI; decode again by slicing after first array
    // Simpler & safe approach: re-decode both arrays from full data
    // (ABI decoding kept explicit & deterministic)
    const values = decodeUint256Array(
      "0x" + log.data.slice(2 + 64 * (2 + Number(ids.length)))
    );
    return { kind: "batch", from, to, ids, values };
  }

  return null;
}
