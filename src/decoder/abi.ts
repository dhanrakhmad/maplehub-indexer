export function decodeAddress(topic: string): `0x${string}` {
  // topic = 32 bytes hex, address = last 20 bytes
  return `0x${topic.slice(26)}` as `0x${string}`;
}

export function decodeUint256(topic: string): bigint {
  return BigInt(topic);
}
