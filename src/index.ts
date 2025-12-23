import { runLoop } from "@/runtime/loop";
import { runHealthLoop } from "@/runtime/health-loop";

console.log("[indexer] starting");

await Promise.all([
  runLoop(),
  runHealthLoop(), // paralel, read-only
]);
