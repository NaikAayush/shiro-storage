import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ShiroStore", function () {
  async function deployShiroStoreFixture() {
    const ShiroStore = await ethers.getContractFactory("ShiroStore");

    const [owner, anotherAddress] = await ethers.getSigners();

    const shiroStore = await ShiroStore.deploy();
    await shiroStore.deployed();

    return { shiroStore, owner, anotherAddress };
  }

  async function uploadNewFile() {
    const ret = await deployShiroStoreFixture();

    const cid = "QmNrQn4bsZgApPR6J32AXXDfVDa9xv2iBEcfUhVnR7Rp3k";
    const validity = 60 * 60 * 60;

    await ret.shiroStore.putFile(cid, validity);

    return Object.assign(ret, { cid, validity });
  }

  describe("Deployment", function () {
    it("Should show a newly uploaded file", async function () {
      const { shiroStore, cid, validity } = await loadFixture(uploadNewFile);

      const files = await shiroStore.getFiles();

      expect(files.length).to.equal(1);

      const file = files[0];

      expect(file.valid).to.equal(true);
      expect(file.deleted).to.equal(false);
      expect(file.cid).to.equal(cid);
      expect(file.validity).to.equal(validity);
      expect(file.timestamp).to.equal(await time.latest());
    });

    it("Should not show someone else's files", async function () {
      const { shiroStore, anotherAddress } = await loadFixture(uploadNewFile);

      const files = await shiroStore.connect(anotherAddress).getFiles();

      expect(files.length).to.equal(0);
    });

    it("Should not show a deleted file", async function () {
      const { shiroStore, cid } = await loadFixture(uploadNewFile);

      await shiroStore.deleteFile(cid);

      const files = await shiroStore.getFiles();

      expect(files.length).to.equal(0);
    });

    it("Should not be able to double delete a file", async function () {
      const { shiroStore, cid } = await loadFixture(uploadNewFile);

      await shiroStore.deleteFile(cid);

      expect(shiroStore.deleteFile(cid)).to.be.revertedWith(
        "File not found or is deleted."
      );
    });

    it("Should delete file after expiring if garbage collected", async function () {
      const { shiroStore, validity } = await loadFixture(uploadNewFile);

      await time.increase(validity);

      await shiroStore.garbageCollect();

      const files = await shiroStore.getFiles();

      expect(files.length).to.equal(0);
    });

    it("Should not delete file before expiring if garbage collected", async function () {
      const { shiroStore, validity } = await loadFixture(uploadNewFile);

      // 1 second before expiry
      await time.setNextBlockTimestamp((await time.latest()) + validity - 1);

      await shiroStore.garbageCollect();

      const files = await shiroStore.getFiles();

      expect(files.length).to.equal(1);
    });

    it("Should renew file before expiry", async function () {
      const { shiroStore, cid, validity } = await loadFixture(uploadNewFile);

      // 1 second before expiry
      await time.setNextBlockTimestamp((await time.latest()) + validity - 1);

      await shiroStore.putFile(cid, validity);

      const files = await shiroStore.getFiles();
      expect(files.length).to.equal(1);
      const file = files[0];

      expect(file.valid).to.equal(true);
      expect(file.deleted).to.equal(false);
      expect(file.cid).to.equal(cid);
      expect(file.validity).to.equal(validity + 1);
      expect(file.timestamp).to.equal(await time.latest());
    });

    it("Should renew file after expiry", async function () {
      const { shiroStore, cid, validity } = await loadFixture(uploadNewFile);

      // 1 second after expiry
      await time.setNextBlockTimestamp((await time.latest()) + validity + 1);

      await shiroStore.putFile(cid, validity);

      const files = await shiroStore.getFiles();
      expect(files.length).to.equal(1);
      const file = files[0];

      expect(file.valid).to.equal(true);
      expect(file.deleted).to.equal(false);
      expect(file.cid).to.equal(cid);
      expect(file.validity).to.equal(validity);
      expect(file.timestamp).to.equal(await time.latest());
    });
  });
});
