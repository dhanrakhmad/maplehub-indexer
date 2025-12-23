// scripts/run-backfill.ts
//
// Cross-platform, deterministic backfill runner for MapleHub Indexer.
// - NO implicit .env loading
// - NO credential in code
// - Explicit env file only
//
// Usage:
//   bun run scripts/run-backfill.ts env/backfill.a.env

import { readFileSync } from "fs";
import { resolve } from "path";
import { spawn } from "bun";

function loadEnv(filePath: string) {
  const absPath = resolve(filePath);
  const content = readFileSync(absPath, "utf8");

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const idx = line.indexOf("=");
    if (idx === -1) continue;

    const key = line.slice(0, idx);
    const value = line.slice(idx + 1);

    process.env[key] = value;
  }
}

const envFile = process.argv[2];
if (!envFile) {
  console.error("Usage: bun run scripts/run-backfill.ts <env-file>");
  process.exit(1);
}

loadEnv(envFile);

// ─────────────────────────────────────────────
// HARD GUARDS (LOCKED)
// ─────────────────────────────────────────────

const REQUIRED = [
  "DATABASE_URL",
  "RPC_URL",
  "CHAIN_ID",
  "CONFIRMATION_DEPTH",
  "START_BLOCK",
  "STOP_BLOCK",
];

for (const key of REQUIRED) {
  if (!process.env[key]) {
    throw new Error(`Missing required env: ${key}`);
  }
}

// Prevent accidental main DB usage
if (process.env.DATABASE_URL?.includes("postgres-main")) {
  throw new Error("Refusing to run backfill on postgres-main");
}

// Audit log (NO secrets)
console.log("[backfill] starting with config:", {
  db_host: process.env.DATABASE_URL?.split("@")[1]?.split("/")[0],
  start_block: process.env.START_BLOCK,
  stop_block: process.env.STOP_BLOCK,
  chain_id: process.env.CHAIN_ID,
});

// ─────────────────────────────────────────────
// RUN INDEXER
// ─────────────────────────────────────────────

const proc = spawn({
  cmd: ["bun", "run", "src/index.ts"],
  stdout: "inherit",
  stderr: "inherit",
  env: {
    ...process.env,
  },
});

const exitCode = await proc.exited;
process.exit(exitCode);
