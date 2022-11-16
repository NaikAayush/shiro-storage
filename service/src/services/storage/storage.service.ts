import { Injectable } from '@nestjs/common';
import { IpfsFile, StorageProvider } from 'src/interfaces/storage-provider.js';
import { IpfsService } from '../ipfs/ipfs.service.js';
import { Web3StorageService } from '../web3-storage/web3-storage.service.js';

@Injectable()
export class StorageService {
  private providers: Record<string, StorageProvider>;

  constructor(private ipfs: IpfsService, private web3stor: Web3StorageService) {
    this.providers = {
      ipfs: this.ipfs,
      'web3.storage': this.web3stor,
    };
  }

  async upload(file: IpfsFile, provider: string): Promise<string> {
    if (this.providers[provider]) {
      let result = await this.providers[provider].upload(file);
      return result;
    } else {
      throw `Unsupported provider: ${provider}`;
    }
  }

  async uploadToAll(file: IpfsFile): Promise<string[]> {
    let results = await Promise.all(
      Object.entries(this.providers).map(([_name, provider]) => {
        return provider.upload(file);
      }),
    );

    return results;
  }
}
