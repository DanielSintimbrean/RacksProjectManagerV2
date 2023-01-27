import * as hre from "hardhat";
import {
  deployMrCryptoMock,
  deployRacksProjectManager,
  deployProxy,
  deployERC20Mock,
} from "../deploy";

async function main() {
  await hre.run("compile");

  const { MrCryptoNFT } = await deployMrCryptoMock();
  const { ERC20Mock } = await deployERC20Mock();
  const { RacksProjectManager } = await deployRacksProjectManager(
    MrCryptoNFT.address,
  );
  await deployProxy(RacksProjectManager.address, ERC20Mock.address);

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
