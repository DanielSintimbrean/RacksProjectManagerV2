import { extendEnvironment, HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";
import { env } from "./env";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
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
  const { setNetworkMapping } = require("./constants/network-mapping/index.ts");
  hre.setNetworkMapping = setNetworkMapping;
  hre.env = env;
});

export default config;
