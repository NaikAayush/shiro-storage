import { Injectable } from '@nestjs/common';
import { pipe } from 'it-pipe';
import { extract } from 'it-tar';
import toBuffer from 'it-to-buffer';
import map from 'it-map';
import all from 'it-all';
import { Source } from 'it-stream-types';

type IPFSType = Awaited<ReturnType<typeof import('ipfs-core').create>>;

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

export interface IpfsFile {
  // The path you want the file to be accessible at from the root CID _after_ it has been added
  path?: string;
  // The contents of the file (see below for definition)
  content?: Uint8Array;
  // File mode to store the entry with (see https://en.wikipedia.org/wiki/File_system_permissions#Numeric_notation)
  mode?: number | string;
  // The modification time of the entry (see below for definition)
  mtime?: Date;
}

@Injectable()
export class IpfsService {
  private ipfs: IPFSType;

  async init() {
    const IPFS = await import('ipfs-core');

    this.ipfs = await IPFS.create();
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
}
