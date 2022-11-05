import { Injectable } from '@nestjs/common';
import { BigNumber, ethers } from 'ethers';
import ShiroStore from '../../assets/ShiroStore.json' assert { type: 'json' };

interface NewFile {
  address: string;
  cid: string;
  timestamp: BigNumber;
  validity: BigNumber;
}

@Injectable()
export class EthersService {
  provider: ethers.providers.JsonRpcProvider;
  contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.QUICKNODE_URL,
    );

    const contractAddress = process.env.CONTRACT_ADDRESS;
    this.contract = new ethers.Contract(
      contractAddress,
      ShiroStore.abi,
      this.provider,
    );

    this.contract.on('NewFile', (address, cid, timestamp, validity) => {
      const info: NewFile = {
        address,
        cid,
        timestamp,
        validity,
      };
      this.handleNewFile(info);
    });
  }
  async handleNewFile(newFile: NewFile) {
    console.log('Got a new file', newFile);
  }
}
