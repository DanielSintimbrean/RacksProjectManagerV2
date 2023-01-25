import { ethers, network, setNetworkMapping, env } from "hardhat";
import { verify } from "../utils/verify";

export const deployMrCryptoMock = async () => {
  const MrCryptoNFT_Factory = await ethers.getContractFactory("MrCryptoNFT");

  const args: Parameters<typeof MrCryptoNFT_Factory.deploy> = [
    "Mr. Crypto",
    "MRC",
    "https://apinft.racksmafia.com/api/",
    "https://apinft.racksmafia.com/api/hidden.json",
  ];

  const MrCryptoNFT = await MrCryptoNFT_Factory.deploy(...args);

  await MrCryptoNFT.deployed();

  setNetworkMapping(network.name, "MrCryptoMock", MrCryptoNFT.address);

  console.log(
    `\n MrCryptoMock ==> deployed to ${MrCryptoNFT.address} on ${network.name}\n`,
  );

  if (
    env.ETHERSCAN_API_KEY &&
    network.name !== "hardhat" &&
    network.name !== "localhost"
  ) {
    await verify(MrCryptoNFT.address, args);
  }

  return { MrCryptoNFT };
};
