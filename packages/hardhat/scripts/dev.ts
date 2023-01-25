import * as hre from "hardhat";

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
