// src/config/env.ts
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

export const CHAIN_ID = Number(requireEnv("CHAIN_ID"));
export const CONFIRMATION_DEPTH = BigInt(requireEnv("CONFIRMATION_DEPTH"));
export const RPC_URL = requireEnv("RPC_URL");
