import { ethers, network, setNetworkMapping, env } from "hardhat";
import { verify } from "../utils/verify";

export const deployERC20Mock = async () => {
  const ERC20Mock_Factory = await ethers.getContractFactory("ERC20Mock");

  const args: Parameters<typeof ERC20Mock_Factory.deploy> = [
    "ERC20Mock",
    "USDC",
  ];

  const ERC20Mock = await ERC20Mock_Factory.deploy(...args);

  await ERC20Mock.deployed();

  setNetworkMapping(network.name, "ERC20Mock", ERC20Mock.address);

  console.log(
    `\n ERC20Mock ==> deployed to ${ERC20Mock.address} on ${network.name}\n`,
  );

  if (
    env.ETHERSCAN_API_KEY &&
    network.name !== "hardhat" &&
    network.name !== "localhost"
  ) {
    await verify(ERC20Mock.address, args);
  }

  return { ERC20Mock };
};
