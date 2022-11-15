import { ethers } from "hardhat";

async function main() {
  const chainlinkTokenAddr = process.env.CHAINLINK_TOKEN_ADDR!;
  const chainlinkOracleAddr = process.env.CHAINLINK_ORACLE_ADDR!;
  const chainlinkUsdEthPriceFeedAddr = process.env.CHAINLINK_USD_ETH_PRICE_FEED_ADDR!;
  console.log(chainlinkTokenAddr, chainlinkOracleAddr, chainlinkUsdEthPriceFeedAddr);
  const ShiroStore = await ethers.getContractFactory("ShiroStore");
  const shiroStore = await ShiroStore.deploy(chainlinkTokenAddr, chainlinkOracleAddr, chainlinkUsdEthPriceFeedAddr);
  await shiroStore.deployed();

  console.log(`ShiroStore deployed to ${shiroStore.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
