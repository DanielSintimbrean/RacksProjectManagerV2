import { ethers } from "ethers";
import { Lock__factory } from "my-hardhat";
import { hardhat } from "my-hardhat/constants/network-mapping.json";

const provider = new ethers.providers.JsonRpcProvider("localhost:8545");

export const address = hardhat.Lock as `0x${string}`;
export const LockContract = Lock__factory.connect(address, provider);

export const abi = Lock__factory.abi;
