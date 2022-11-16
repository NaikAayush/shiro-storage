---
sidebar_position: 2
---

# Contract

**Repository**: [https://github.com/NaikAayush/shiro-storage/tree/main/contracts](https://github.com/NaikAayush/shiro-storage/tree/main/contracts)

## Pre-requisites

- NodeJS v18
- npm

## Set up

### Dependencies

```
npm i
```

### Create a `.env` file

```
QUICKNODE_URL=<URL of your ETH node - could be infura, quicknode, etc.>
PRIVATE_KEY=<Contract owner's private key>
POLYGONSCAN_API_KEY=<>
CHAINLINK_TOKEN_ADDR=<>
CHAINLINK_ORACLE_ADDR=<>
CHAINLINK_USD_ETH_PRICE_FEED_ADDR=<>
```

Chainlink Token addresses can be found [here](https://docs.chain.link/resources/link-token-contracts/).

Chainlink Price Feed addresses can be found [here](https://docs.chain.link/data-feeds/price-feeds/addresses)

`CHAINLINK_ORACLE_ADDR` is obtained from [Chainlink Operator Node set up](./operator.md).

### Hardhat config

TODO

## Deploy

Compile contract:
```
npx hardhat compile
```

Deploy contract (replace `mumbai` with network in your hardhat config):
```
npx hardhat run scripts/deploy.ts --network mumbai
```

:::info
Note the address printed here. You will need it later.
:::
