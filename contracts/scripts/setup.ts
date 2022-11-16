import { ethers } from "hardhat";

async function main() {
    let contract = await ethers.getContractFactory("ShiroStore");
    let deployed = contract.attach("0xa7d14Ef4Ca44a1218efbba9E103E5Ad049dE7198");
    let res = await deployed.putFile(
        "QmRxyew9ujdcByPwNaB8EVK8S5TBvJiRGuKPNEAvVMuGAm",
        7200,
        "ipfs",
        2048,
        {
            value: ethers.utils.parseEther("0.00004"),
            // gasPrice: 8000000000,
            // gasLimit: 4200000
        }
    );
}