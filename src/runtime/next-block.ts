export function getNextBlock(cursor: bigint, safeHead: bigint): bigint | null {
  const next = cursor + 1n;

  if (next > safeHead) {
    return null;
  }

  return next;
}
