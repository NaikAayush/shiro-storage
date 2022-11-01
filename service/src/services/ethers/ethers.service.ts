import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class EthersService {
  provider: ethers.providers.JsonRpcProvider;
  contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.QUICKNODE_URL,
    );
    const contractAddress = '';
    this.contract = new ethers.Contract(contractAddress, 'abi', this.provider);
    this.contract.on('Log', (sender, message, event) => {
      let info = {
        sender: sender,
        message: message,
      };
      console.log(info);
    });
  }
}
