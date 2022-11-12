export interface IpfsFile {
  // The path you want the file to be accessible at from the root CID _after_ it has been added
  path: string;
  // The contents of the file (see below for definition)
  content: Uint8Array;
  // File mode to store the entry with (see https://en.wikipedia.org/wiki/File_system_permissions#Numeric_notation)
  mode: number | string;
  // The modification time of the entry (see below for definition)
  mtime: Date;
}

export interface StorageProvider {
  upload(file: IpfsFile): Promise<string>;

  get(id: string): Promise<IpfsFile>;
}
