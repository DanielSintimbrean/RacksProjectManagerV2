import fs from "fs";
import path from "path";

export type NetworkMapping = Record<string, Record<string, [string]>>;
const _file = "../network-mapping.json";
const filePath = path.resolve(__dirname, _file);

export function getNetworkMapping(network: string, contract: string): string[] {
  let readFileSync = "";
  try {
    readFileSync = fs.readFileSync(filePath, "utf8");
  } catch (e) {
    fs.writeFileSync(filePath, JSON.stringify({}));
  }

  if (readFileSync) {
    const networkMapping: NetworkMapping = JSON.parse(readFileSync);

    return networkMapping[network][contract];
  }
  return [];
}

export function getAllNetworkMapping(
  network: string,
): Record<string, [string]> {
  const readFileSync = fs.readFileSync(filePath, "utf8");

  if (readFileSync) {
    const networkMapping: NetworkMapping = JSON.parse(readFileSync);

    return networkMapping[network];
  }

  return {};
}

export const setNetworkMapping = (
  network: string,
  contract: string,
  address: string,
) => {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}));

  const contractAddresses = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  contractAddresses[network] = {
    ...contractAddresses[network],
    [contract]: address,
  };

  fs.writeFileSync(filePath, JSON.stringify(contractAddresses, null, 2));
};
