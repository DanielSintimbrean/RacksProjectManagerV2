import * as hre from "hardhat";
import {
  deployLock,
  deployMrCryptoMock,
  deployRacksProjectManager,
} from "../deploy";

async function main() {
  await hre.run("compile");

  await deployLock();
  const { MrCryptoNFT } = await deployMrCryptoMock();
  await deployRacksProjectManager(MrCryptoNFT.address);

  const network = hre.network.name;

  console.log(`\n================================================`);
  console.log(`=== Contracts deployed to ${network} network ===`);
  console.log(`================================================\n`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
