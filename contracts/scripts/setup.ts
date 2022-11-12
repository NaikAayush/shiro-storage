import { ethers } from "hardhat";

async function main() {
    let contract = await ethers.getContractFactory("ShiroStore");
    let deployed = contract.attach("0x9A676e781A523b5d0C0e43731313A708CB607508");
    let res = await deployed.putFile("QmXSYX9fA6D6XAD8dpoxAtdk8tUNxgPY9M1veNtcViyfFH", 7200);
}