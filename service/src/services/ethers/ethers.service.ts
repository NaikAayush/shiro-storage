import { Injectable } from '@nestjs/common';
import { BigNumber, ethers } from 'ethers';
import ShiroStore from '../../assets/ShiroStore.json' assert { type: 'json' };
import { IpfsService } from '../ipfs/ipfs.service.js';
import { StorageService } from '../storage/storage.service.js';

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

  constructor(private ipfs: IpfsService, private storage: StorageService) {
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.QUICKNODE_URL,
    );

    const contractAddress = process.env.CONTRACT_ADDRESS;
    this.contract = new ethers.Contract(
      contractAddress,
      ShiroStore.abi,
      this.provider,
    );

    console.log('Listening for events on contract: ', this.contract.address);

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

    const file = await this.ipfs.get(newFile.cid);
    console.log('content', file.content);

    const uids = await this.storage.upload(file);
    console.log('uploaded file to all storage backends', uids);
  }
}
