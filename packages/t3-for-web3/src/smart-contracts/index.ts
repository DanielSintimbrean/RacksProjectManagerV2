import { ethers } from "ethers";
import {
  RacksProjectManager__factory,
  HolderValidation__factory,
  Project__factory,
} from "my-hardhat";
import { localhost } from "my-hardhat/constants/network-mapping.json";

const provider = new ethers.providers.JsonRpcProvider(
  "http://127.0.0.1:8545/",
  {
    chainId: 1337,
    name: "localhost",
  }
);

export const racksProjectManager = RacksProjectManager__factory.connect(
  localhost.RacksProjectManager,
  provider
);

export const holderValidation = HolderValidation__factory.connect(
  localhost.HolderValidation,
  provider
);

export const Project = (address: string) => {
  return Project__factory.connect(address, provider);
};

console.log("RacksProjectManager", racksProjectManager.address);
console.log("HolderValidation", holderValidation.address);
