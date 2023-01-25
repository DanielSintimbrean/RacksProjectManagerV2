import { run } from "hardhat";

export const verify = async (contractAddress: string, args: unknown[]) => {
  console.log("Verifying contract...");

  await new Promise((resolve) => setTimeout(resolve, 30000));

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (
      e instanceof Error &&
      e.message.toLowerCase().includes("already verified")
    ) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
};
