import { readHealth } from "@/health/read-health";
import { sleep } from "@/runtime/sleep";

export async function runHealthLoop() {
  while (true) {
    try {
      const h = await readHealth();
      console.log("[health]", h);
    } catch (err) {
      console.error("[health] error", err);
    }
    await sleep(30_000); // tiap 30 detik
  }
}
