---
sidebar_position: 2
---

# Getting started

## What you'll need

1. A client app (usually Javascript or Typescript) that can:
    - Upload to IPFS. [`ipfs-http-client`](https://www.npmjs.com/package/ipfs-http-client) can be used for this.
    - Call a function on an Ethereum contract. [`ethers.js`](https://docs.ethers.io/v5/) can be used for this.
2. A Solidity contract that handles your decentralized logic.

## Contract

### Set up

:::note

You can skip this step if you're using Remix - it will handle the installation for you.

:::

Install the `shiro-store` npm package that includes all contracts:
```bash
npm install shiro-store
```

### Contract set up

Import the `ShiroStore` contract:
```solidity title="ExampleFileUploader.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// highlight-next-line
import "shiro-store/contracts/ShiroStore.sol";

contract ExampleFileUploader {
}
```

Declare a private variable for the `ShiroStore` contract:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "shiro-store/contracts/ShiroStore.sol";

contract ExampleFileUploader {
    // highlight-next-line
    IShiroStore private shiroStore;
}
```

Initialize it in the constructor. When deploying the contract, pass it the [ShiroStore contract address for your network](./contract-addresses.md).
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "shiro-store/contracts/ShiroStore.sol";

contract ExampleFileUploader {
    IShiroStore private shiroStore;

    // highlight-start
    constructor(address shiroStoreAddr) {
        shiroStore = IShiroStore(shiroStoreAddr);
    }
    // highlight-end
}
```

### Uploading files

Use `shiroStore.putFile` to upload a file. The parameters are:
- `string cid`: IPFS CID of the file to be uploaded. We will see in the [client set up](#client) how to get this.
- `uint256 validity`: how long to keep the file for, in seconds.
- `string provider`: one of the available [providers' name](./providers.md). Use `ipfs` if you're not sure.
- `uint256 sizeInBytes`: file size. Must be accurate as seen by IPFS or it could lead to the file not being pinned correctly. We will see in the client set up how to get the accurate value of this.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "shiro-store/contracts/ShiroStore.sol";

contract ExampleFileUploader {
    IShiroStore private shiroStore;

    constructor(address shiroStoreAddr) {
        shiroStore = IShiroStore(shiroStoreAddr);
    }

    // highlight-start
    function upload(string memory cid, uint256 sizeInBytes) external payable {
        // This is 1000 hours (a month and then some)
        uint256 validity = 3600 * 1000;
        // IPFS is a safe bet
        string memory provider = "ipfs";
        shiroStore.putFile(cid, validity, provider, sizeInBytes);
    }
    // highlight-end
}
```

### List files

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "shiro-store/contracts/ShiroStore.sol";

contract ExampleFileUploader {
    IShiroStore private shiroStore;

    constructor(address shiroStoreAddr) {
        shiroStore = IShiroStore(shiroStoreAddr);
    }

    function upload(string memory cid, uint256 sizeInBytes) external payable {
        // This is 1000 hours (a month and then some)
        uint256 validity = 3600 * 1000;
        // IPFS is a safe bet
        string memory provider = "ipfs";
        shiroStore.putFile(cid, validity, provider, sizeInBytes);
    }

    // highlight-start
    function doSomething() external view {
        File storage files = shiroStore.getFiles();
        // do something with the files or return them
    }
    // highlight-end
}
```

### Delete file

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "shiro-store/contracts/ShiroStore.sol";

contract ExampleFileUploader {
    IShiroStore private shiroStore;

    constructor(address shiroStoreAddr) {
        shiroStore = IShiroStore(shiroStoreAddr);
    }

    function upload(string memory cid, uint256 sizeInBytes) external payable {
        // This is 1000 hours (a month and then some)
        uint256 validity = 3600 * 1000;
        // IPFS is a safe bet
        string memory provider = "ipfs";
        shiroStore.putFile(cid, validity, provider, sizeInBytes);
    }

    function doSomething() external view {
        File storage files = shiroStore.getFiles();
        // do something with the files or return them
    }

    // highlight-start
    function remove(string memory cid) external {
        shiroStore.deleteFile(cid);
    }
    // highlight-end
}
```

## Client

Broadly, the client needs to follow this process to upload a file:
- Upload the file to the [Shiro IPFS Relay](./contract-addresses.md#ipfs-relay).

:::caution
Ensure that the file is uploaded to the Shiro Relay. Not uploading it to this relay may lead to the file not being pinned.
:::

- Calculate size of the file. This needs to be the file as seen by IPFS.
    - There is a helper API endpoint for it: `https://storage.shiro.network/fileSizeOnly?cid=<cid>`. For example: `https://storage.shiro.network/fileSizeOnly?cid=QmRxyew9ujdcByPwNaB8EVK8S5TBvJiRGuKPNEAvVMuGAm`. This returns a JSON with the `size` key having the size in bytes.
- Calculate the price.
    - There are two ways to do this:
        1. The contract will revert execution with an error indicating the needed price.
            - Example: `execution reverted: Not enough value given!. Got: 0 Wanted at least: 337964`
            - The last number is the actual price needed. Though, make sure to provide a bit higher value because of market volatility.
        2. Use the helper API: `https://storage.shiro.network/estimatePrice?cid=<cid>&validity=<validity-in-seconds>`
            - Example: `https://storage.shiro.network/estimatePrice?cid=QmRxyew9ujdcByPwNaB8EVK8S5TBvJiRGuKPNEAvVMuGAm&validity=3600000`
            - The `price` key has the price in wei as a string.
    - See [pricing details](./pricing.md) for more information on how pricing is calculated.
- Call the function in your contract which calls `shiroStore.putFile` with the options: `{ value: "<price>" }` replacing `<price>` with the price calculated in the previous step.

## Examples

TODO: a minimal example.

See [Shiro Share](https://github.com/NaikAayush/shiro-share) as an example of a real app using Shiro Storage as a backend.

