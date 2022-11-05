import { Injectable } from '@nestjs/common';
import { pipe } from 'it-pipe';
import { extract } from 'it-tar';
import toBuffer from 'it-to-buffer';
import map from 'it-map';
import all from 'it-all';
import { Source } from 'it-stream-types';
import { IpfsFile, StorageProvider } from 'src/interfaces/storage-provider';
import { create, IPFSHTTPClient } from 'ipfs-http-client';

async function* tarballed(source: Source<Uint8Array>) {
  yield* pipe(source, extract(), async function*(source) {
    for await (const entry of source) {
      yield {
        ...entry,
        body: await toBuffer(map(entry.body, (buf) => buf.slice())),
      };
    }
  });
}

@Injectable()
export class IpfsService implements StorageProvider {
  private ipfs: IPFSHTTPClient;

  constructor() {
    this.ipfs = create({ url: process.env.IPFS_GATEWAY_URL });
  }

  async get(cid: string): Promise<IpfsFile> {
    const output = await pipe(this.ipfs.get(cid), tarballed, (source) =>
      all(source),
    );

    if (output.length != 1) {
      throw `Can only work on one file for now. Got ${output.length} files.`;
    }

    const file = output[0];

    const fileObj: IpfsFile = {
      path: file.header.name,
      content: file.body,
      mode: file.header.mode,
      mtime: file.header.mtime,
    };

    return fileObj;
  }

  async upload(file: IpfsFile): Promise<string> {
    let cid = await this.ipfs.add(file);

    let pinnedCid = await this.ipfs.pin.add(cid.cid);

    return pinnedCid.toString();
  }
}
