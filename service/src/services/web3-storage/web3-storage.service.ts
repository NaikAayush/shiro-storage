import { Injectable } from '@nestjs/common';
import { IpfsFile, StorageProvider } from 'src/interfaces/storage-provider.js';
import { Web3Storage } from 'web3.storage';

@Injectable()
export class Web3StorageService implements StorageProvider {
  private web3stor: Web3Storage;

  constructor() {
    this.web3stor = new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN });
  }

  async upload(file: IpfsFile): Promise<string> {
    const web3File = {
      name: file.path,
      stream: () =>
        new ReadableStream({
          start(controller) {
            controller.enqueue(file.content);
            controller.close();
          },
        }),
    };
    const files = [web3File];
    const cid = await this.web3stor.put(files, {
      name: file.path,
      maxRetries: 3,
      wrapWithDirectory: false,
    });
    return cid;
  }

  async get(id: string): Promise<IpfsFile> {
    let resp = await this.web3stor.get(id);
    let files = await resp.files();
    if (files.length != 1) {
      throw `Can only get files with 1 file. Got: ${files}`;
    }

    let file = files[0];

    let ipfsFile = {
      path: file.name,
      content: new Uint8Array(await file.arrayBuffer()),
      mode: '644',
      mtime: new Date(),
    };

    return ipfsFile;
  }
}
