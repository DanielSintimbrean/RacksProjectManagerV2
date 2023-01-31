import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { racksProjectManager } from "@smart-contracts";
import { RacksProjectManager__factory } from "my-hardhat";
import { trpc } from "../../utils/trpc";

export const useRegisterContributor = () => {
  const trpcUtils = trpc.useContext();

  const { config, error } = usePrepareContractWrite({
    address: racksProjectManager.address as `0x${string}`,
    abi: RacksProjectManager__factory.abi,
    functionName: "registerMember",
  });

  const { write, data } = useContractWrite(config);

  useWaitForTransaction({
    hash: data?.hash,
    confirmations: 6,
    onSuccess: () => {
      trpcUtils.auth.invalidate();
    },
  });

  return { registerContributor: write, error };
};
