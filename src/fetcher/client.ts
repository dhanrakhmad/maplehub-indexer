import { createPublicClient, http } from "viem";
import { RPC_URL } from "@/config/env";

export const publicClient = createPublicClient({
  transport: http(RPC_URL),
});
