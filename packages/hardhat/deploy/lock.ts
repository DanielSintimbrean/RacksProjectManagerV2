import { ethers, network, setNetworkMapping, env } from "hardhat";
import { verify } from "../utils/verify";

export async function deployLock() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  const lockedAmount = ethers.utils.parseEther("0.0001");

  const Lock = await ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  await lock.deployed();

  console.log(`\nLock ==> deployed to ${lock.address} on ${network.name}\n`);

  if (
    env.ETHERSCAN_API_KEY &&
    network.name !== "hardhat" &&
    network.name !== "localhost"
  ) {
    await verify(lock.address, [unlockTime]);
  }

  setNetworkMapping(network.name, "Lock", lock.address);
}
