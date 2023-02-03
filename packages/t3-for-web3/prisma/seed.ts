/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);
  /**
   * Users
   */
  await prisma.user.create({
    data: {
      name: "DanielDS",
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      avatar:
        "https://cloudflare-ipfs.com/ipfs/QmWERugwxBkYWrc5nNB3AHMvjVDbkeVyiDZfX6t6o16TPu/3f4510d80c66c82e1b614f207b6e3ea1fd3b1a58fdd2c3e2876b1439349d74d9.png",
      registered: true,
      discordUsername: "DanielDS#7559",
      githubUsername: "DanielSintimbrean",
    },
  });
  /**
   * Projects
   */
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
