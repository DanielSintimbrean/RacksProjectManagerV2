import { extendEnvironment, HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";
import { env } from "./env";

const config: HardhatUserConfig = {
  //solidity: "0.8.17",
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  typechain: {
    outDir: "types/contracts",
    alwaysGenerateOverloads: true,
    dontOverrideCompile: false,
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    ...(env.PRIVATE_KEY &&
      env.GOERLI_RPC_URL && {
        goerli: {
          url: env.GOERLI_RPC_URL,
          accounts: [env.PRIVATE_KEY],
          chainId: 5,
        },
      }),
  },
  etherscan: {
    apiKey: env.ETHERSCAN_API_KEY,
  },
};

extendEnvironment(async (hre) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { setNetworkMapping } = require("./utils/network-mapping.ts");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { networkMapping } = require("./constants/network-mapping/index.ts");

  hre.setNetworkMapping = setNetworkMapping;
  hre.env = env;
  hre.localChains = ["hardhat", "localhost"];
  hre.networkMapping = networkMapping;
});

export default config;
