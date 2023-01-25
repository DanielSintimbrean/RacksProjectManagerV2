import { z } from "zod";

export const envSchema = z.object({
  PRIVATE_KEY: z.string().length(64).optional(),
  GOERLI_RPC_URL: z.preprocess((value) => {
    if (value) return value;
    return "https://endpoints.omniatech.io/v1/eth/goerli/public";
  }, z.string().url()),
  ETHERSCAN_API_KEY: z.string().length(34).optional(),
});
