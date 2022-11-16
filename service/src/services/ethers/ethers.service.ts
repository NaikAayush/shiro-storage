import { Injectable } from '@nestjs/common';
import { BigNumber, ethers } from 'ethers';
import ShiroStore from '../../assets/ShiroStore.json' assert { type: 'json' };
import { IpfsService } from '../ipfs/ipfs.service.js';
import { StorageService } from '../storage/storage.service.js';

interface NewFile {
  address: string;
  cid: string;
  provider: string;
  timestamp: BigNumber;
  validity: BigNumber;
  value: BigNumber;
  sizeInBytes: BigNumber;
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

    this.contract.on(
      'NewFile',
      (address, cid, provider, timestamp, validity, value, sizeInBytes) => {
        const info: NewFile = {
          address,
          cid,
          provider,
          timestamp,
          validity,
          value,
          sizeInBytes,
        };
        this.handleNewFile(info).catch((err) =>
          console.log('Error in handling new file', err),
        );
      },
    );
  }
  async handleNewFile(newFile: NewFile) {
    console.log('Got a new file', newFile);

    const file = await this.ipfs.get(newFile.cid);
    console.log('content', file.content);

    const uids = await this.storage.upload(file, newFile.provider);
    console.log('uploaded file to all storage backends', uids);
  }
}
