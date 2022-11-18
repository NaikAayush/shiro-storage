import { ethers } from "hardhat";

async function main() {
    let contract = await ethers.getContractFactory("ShiroStore");
    let deployed = contract.attach("0x039a4697C8B6CD4dE6D2C0aef690e8c9073b67a6");
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
