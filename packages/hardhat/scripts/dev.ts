import * as hre from "hardhat";
import { ethers } from "hardhat";
import { networkMapping } from "../constants/network-mapping";

const { localhost: localhostContracts } = networkMapping;
/**
 * This script starts a Hardhat node and deploys the contracts to it.
 * Used to test the contracts locally.
 */
async function main() {
  await hre.run("compile");

  hre.run("node");

  // wait for the node to start
  await new Promise((resolve) => setTimeout(resolve, 2000));

  hre.hardhatArguments.network = "localhost";

  await hre.run("run", {
    script: "./scripts/deployAll.ts",
  });

  const [deployer] = await ethers.getSigners();
  const MrCryptoContract = await ethers.getContractAt(
    "MrCryptoNFT",
    localhostContracts.MrCryptoMock,
  );

  await MrCryptoContract.connect(deployer).mint(1);

  console.log("\n==========================");
  console.log("== Hardhat node started ==");
  console.log("==========================\n");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
