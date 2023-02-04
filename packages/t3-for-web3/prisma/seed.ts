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
  await prisma.project.create({
    data: {
      Owner: {
        connect: { address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" },
      },
      name: "Racks Project Manager V2",
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Orci phasellus egestas tellus rutrum tellus pellentesque. Pellentesque elit ullamcorper dignissim cras tincidunt. Egestas sed sed risus pretium quam vulputate dignissim. Libero id faucibus nisl tincidunt eget nullam non. Fames ac turpis egestas maecenas pharetra convallis. Nam aliquam sem et tortor consequat id porta nibh venenatis. Nec feugiat nisl pretium fusce id velit ut tortor pretium. Ac tincidunt vitae semper quis lectus. Condimentum mattis pellentesque id nibh. Lectus sit amet est placerat in. Lectus sit amet est placerat in.
Integer eget aliquet nibh praesent tristique magna sit. Luctus accumsan tortor posuere ac ut consequat. Nunc sed velit dignissim sodales ut. Id venenatis a condimentum vitae sapien pellentesque habitant. Lorem sed risus ultricies tristique nulla aliquet. Malesuada nunc vel risus commodo viverra maecenas accumsan. Commodo nulla facilisi nullam vehicula. Sed lectus vestibulum mattis ullamcorper velit sed ullamcorper. Tellus rutrum tellus pellentesque eu tincidunt tortor aliquam. Bibendum enim facilisis gravida neque convallis a. Imperdiet proin fermentum leo vel orci porta. Felis bibendum ut tristique et.`,
    },
  });
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
