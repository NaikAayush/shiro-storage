import { Injectable } from '@nestjs/common';
import { IpfsFile, StorageProvider } from 'src/interfaces/storage-provider.js';
import { IpfsService } from '../ipfs/ipfs.service.js';

@Injectable()
export class StorageService {
  private providers: StorageProvider[];

  constructor(private ipfs: IpfsService) {
    this.providers = [this.ipfs];
  }

  async upload(file: IpfsFile): Promise<string[]> {
    let results = await Promise.all(
      this.providers.map((provider) => {
        return provider.upload(file);
      }),
    );

    return results;
  }
}
