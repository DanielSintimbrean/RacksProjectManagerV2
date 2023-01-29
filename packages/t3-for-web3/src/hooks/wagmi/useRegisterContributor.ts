import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { racksProjectManager } from "@smart-contracts";
import { RacksProjectManager__factory } from "my-hardhat";
import { trpc } from "../../utils/trpc";

export const useRegisterContributor = () => {
  const trpcUtils = trpc.useContext();

  const { config, error } = usePrepareContractWrite({
    address: racksProjectManager.address as `0x${string}`,
    abi: RacksProjectManager__factory.abi,
    functionName: "registerMember",
    onSuccess: () => {
      // Refresh session
      trpcUtils.auth.invalidate();
    },
  });

  const { write } = useContractWrite(config);

  return { registerContributor: write, error };
};
