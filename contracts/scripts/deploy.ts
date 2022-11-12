import { ethers } from "hardhat";

async function main() {
  const ShiroStore = await ethers.getContractFactory("ShiroStore");
  const shiroStore = await ShiroStore.deploy();
  await shiroStore.deployed();

  console.log(`ShiroStore deployed to ${shiroStore.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
