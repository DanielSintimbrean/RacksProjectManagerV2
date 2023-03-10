// If your plugin extends types from another plugin, you should import the plugin here.

// To extend one of Hardhat's types, you need to import the module where it has been defined, and redeclare it.
import "hardhat/types/config";
import "hardhat/types/runtime";

import { setNetworkMapping } from "../../utils/network-mapping";
import { networkMapping } from "../../constants/network-mapping";
import { env } from "./../../env";

declare module "hardhat/types/runtime" {
  // This is an example of an extension to the Hardhat Runtime Environment.
  // This new field will be available in tasks' actions, scripts, and tests.
  export interface HardhatRuntimeEnvironment {
    setNetworkMapping: typeof setNetworkMapping;
    env: typeof env;
    localChains: string[];
    networkMapping: typeof networkMapping;
  }
}
