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

  const [deployer, account2, account3] = await ethers.getSigners();

  const MrCryptoContract = await ethers.getContractAt(
    "MrCryptoNFT",
    localhostContracts.MrCryptoMock,
  );

  const RacksProjectManagerContract = await ethers.getContractAt(
    "RacksProjectManager",
    localhostContracts.RacksProjectManager,
  );

  const ERC20Mock = await ethers.getContractAt(
    "ERC20Mock",
    localhostContracts.ERC20Mock,
  );

  await MrCryptoContract.connect(deployer).mint(6);
  await MrCryptoContract.connect(account2).mint(6);
  await MrCryptoContract.connect(account3).mint(6);

  await ERC20Mock.connect(deployer).mintMore();
  await ERC20Mock.connect(account2).mintMore();
  await ERC20Mock.connect(account3).mintMore();

  await MrCryptoContract.connect(deployer).reveal();

  await RacksProjectManagerContract.connect(deployer).registerMember();
  await RacksProjectManagerContract.connect(account2).registerMember();

  const createTx = await RacksProjectManagerContract.connect(
    deployer,
  ).createProject("Project 1", ethers.utils.parseEther("100"), 1, 5);

  await createTx.wait();

  const filter =
    RacksProjectManagerContract.filters.NewProjectCreated("Project 1");

  const events = await RacksProjectManagerContract.queryFilter(filter);

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
