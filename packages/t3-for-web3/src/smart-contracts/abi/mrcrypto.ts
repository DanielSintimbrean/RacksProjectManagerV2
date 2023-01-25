import { ethers } from "ethers";
import { Mrcrypto__factory } from "../types";

const provider = new ethers.providers.JsonRpcProvider(
  "https://polygon.llamarpc.com"
);

export const address = "0xeF453154766505FEB9dBF0a58E6990fd6eB66969" as const;
export const MrCryptoContract = Mrcrypto__factory.connect(address, provider);

/**
 * NOTE: Needed the for type inference in Wagmi
 * @see https://wagmi.sh/react/typescript
 */
export const abi = Mrcrypto__factory.abi;
