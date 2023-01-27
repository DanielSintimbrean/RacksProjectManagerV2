import { ethers, network, setNetworkMapping, env } from "hardhat";
import { verify } from "../utils/verify";

export const deployProxy = async (
  racksProjectManagerAddress: string,
  erc20Address: string,
) => {
  const ProxyAdmin_Factory = await ethers.getContractFactory("ProxyAdmin");

  const ProxyAdmin = await ProxyAdmin_Factory.deploy();

  await ProxyAdmin.deployed();

  const TransparentUpgradeableProxy_Factory = await ethers.getContractFactory(
    "TransparentUpgradeableProxy",
  );

  const args: Parameters<typeof TransparentUpgradeableProxy_Factory.deploy> = [
    racksProjectManagerAddress,
    ProxyAdmin.address,
    [],
  ];

  const TransparentUpgradeableProxy =
    await TransparentUpgradeableProxy_Factory.deploy(...args);

  const RacksProjectManager = await ethers.getContractAt(
    "RacksProjectManager",
    racksProjectManagerAddress,
  );

  const owner = await RacksProjectManager.getRacksPMOwner();

  if (owner == ethers.constants.AddressZero)
    await RacksProjectManager.initialize(erc20Address);

  setNetworkMapping(
    network.name,
    "TransparentUpgradeableProxy",
    TransparentUpgradeableProxy.address,
  );

  setNetworkMapping(network.name, "ProxyAdmin", ProxyAdmin.address);

  if (
    env.ETHERSCAN_API_KEY &&
    network.name !== "hardhat" &&
    network.name !== "localhost"
  ) {
    await verify(TransparentUpgradeableProxy.address, args);
    await verify(ProxyAdmin.address, []);
  }

  return {
    TransparentUpgradeableProxy,
    RacksProjectManagerProxy: RacksProjectManager,
    ProxyAdmin,
  };
};
