import * as hre from "hardhat";
import { ethers, networkMapping } from "hardhat";

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

  const localhostContracts = networkMapping.localhost;

  const [deployer] = await ethers.getSigners();

  const MrCryptoContract = await ethers.getContractAt(
    "MrCryptoNFT",
    localhostContracts.MrCryptoMock,
  );

  const RacksProjectManagerContract = await ethers.getContractAt(
    "RacksProjectManager",
    localhostContracts.RacksProjectManager,
  );

  await MrCryptoContract.connect(deployer).mint(6);
  await MrCryptoContract.connect(deployer).reveal();

  await RacksProjectManagerContract.connect(deployer).registerMember();

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
