import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployMrCryptoMock } from "../deploy";

describe("MrCrypto", function () {
  async function deploy() {
    const { MrCryptoNFT } = await deployMrCryptoMock();
    const [owner, otherAccount] = await ethers.getSigners();

    return { MrCryptoNFT, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should deploy", async function () {
      await loadFixture(deploy);
    });

    it("Should set the right owner", async function () {
      const { owner, MrCryptoNFT } = await loadFixture(deploy);

      expect(await MrCryptoNFT.owner()).to.equal(owner.address);
    });
  });
});
