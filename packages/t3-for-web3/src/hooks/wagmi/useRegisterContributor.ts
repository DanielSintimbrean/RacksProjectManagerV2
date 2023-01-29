import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { racksProjectManager } from "@smart-contracts";
import { RacksProjectManager__factory } from "my-hardhat";

export const useRegisterContributor = () => {
  const { config, error } = usePrepareContractWrite({
    address: racksProjectManager.address as `0x${string}`,
    abi: RacksProjectManager__factory.abi,
    functionName: "registerMember",
  });

  const { write } = useContractWrite(config);

  return { registerContributor: write, error };
};
