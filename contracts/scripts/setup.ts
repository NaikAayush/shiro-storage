import { ethers } from "hardhat";

async function main() {
    let contract = await ethers.getContractFactory("ShiroStore");
    let deployed = contract.attach("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
    let res = await deployed.putFile("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "QmNrQn4bsZgApPR6J32AXXDfVDa9xv2iBEcfUhVnR7Rp3k", 7200);
}