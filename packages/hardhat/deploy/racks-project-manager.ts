import { ethers, network, setNetworkMapping, env, localChains } from "hardhat";
import { verify } from "../utils/verify";

export const deployRacksProjectManager = async (mrCryptoAddress: string) => {
  const RacksProjectManager_Factory = await ethers.getContractFactory(
    "RacksProjectManager",
  );
  const HolderValidation_Factory = await ethers.getContractFactory(
    "HolderValidation",
  );

  const argsHolderValidation: Parameters<
    typeof HolderValidation_Factory.deploy
  > = [mrCryptoAddress];

  const HolderValidation = await HolderValidation_Factory.deploy(
    ...argsHolderValidation,
  );

  const argsRacksPM: Parameters<typeof RacksProjectManager_Factory.deploy> = [
    HolderValidation.address,
  ];

  const RacksProjectManager = await RacksProjectManager_Factory.deploy(
    ...argsRacksPM,
  );

  setNetworkMapping(
    network.name,
    "RacksProjectManager",
    RacksProjectManager.address,
  );
  setNetworkMapping(network.name, "HolderValidation", HolderValidation.address);

  console.log(
    `\n HolderValidation ==> deployed to ${HolderValidation.address} on ${network.name}\n`,
  );

  console.log(
    `\n RacksProjectManager ==> deployed to ${RacksProjectManager.address} on ${network.name}\n`,
  );

  if (env.ETHERSCAN_API_KEY && !localChains.includes(network.name)) {
    await verify(HolderValidation.address, argsHolderValidation);
    await verify(RacksProjectManager.address, argsRacksPM);
  }

  return { RacksProjectManager, HolderValidation };
};
