# Shiro Share Contracts

This project uses Hardhat.

## Setup

Install all dependencies

```shell
npm install
```

Create a .env and add the following

```shell
QUICKNODE_URL=
PRIVATE_KEY=
POLYGONSCAN_API_KEY=
```

## Commands:

- To test the contract

  ```shell
  npx hardhat test
  ```

- To deploy to mumbai

  ```shell
  npx hardhat run scripts/deploy.ts --network matic
  ```

## Publish to npm

```
npm pack
```

Check resulting `shiro-store-x.y.z.tgz` to see that it only contains the required files. Then:

```
npm publish
```
