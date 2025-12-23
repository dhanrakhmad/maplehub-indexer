import { readCursor } from "@/cursor/cursor";
import { getSafeHead } from "@/runtime/safe-head";
import { getNextBlock } from "@/runtime/next-block";
import { processBlock } from "@/runtime/process-block";
import { sleep } from "@/runtime/sleep";

export async function runLoop() {
  while (true) {
    const cursor = await readCursor();
    const safeHead = await getSafeHead();
    const nextBlock = getNextBlock(cursor, safeHead);

    if (nextBlock === null) {
      console.log(
        "[indexer] idle | cursor =",
        cursor.toString(),
        "| safeHead =",
        safeHead.toString()
      );
      await sleep(5000);
      continue;
    }

    console.log("[indexer] processing block", nextBlock.toString());

    // ⬇️ BARU DITAMBAHKAN
    await processBlock(nextBlock);

    // ⛔ BELUM advance cursor
    await sleep(1000);
  }
}
