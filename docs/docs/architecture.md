---
sidebar_position: 11
---

# Architecture

Broadly, Shiro Storage has these components:
1. The `ShiroStore` contract
1. A Chainlink operator node with a custom `Operator.sol`
1. A [Service](https://github.com/NaikAayush/shiro-storage/tree/main/service) that listens for events from `ShiroStore` and pins it on the appropriate provider.

With some helpers:
1. Chainlink token (`LINK`)
1. Chainlink price feed - mainly `USD/ETH`

## Working

- First, the client uploads the file to the [Shiro IPFS relay](./contract-addresses.md#ipfs-relay).
- Then, a contract, let's call it `ShiroUser` calls `ShiroStore.putFile` with a file and how long to keep it for. This transaction includes a value - the payment for storing the file.
- `ShiroStore` then calculates the price to charge based on a fixed price per GB per second. The price is then converted from USD to ETH/MATIC in real time using a [Chainlink price feed](https://docs.chain.link/data-feeds/price-feeds).
    - Why is the price calculated in USD? - because some of the storage backends we use charge in USD.
    - If the value is too low, the transaction is rejected.
- Then, `ShiroStore` calls our service to verify the given file size. This is an in-contract API call powered by [Chainlink Any API](https://docs.chain.link/any-api/introduction).
- The Any API call is picked up by our custom [Chainlink Operator Node](https://docs.chain.link/chainlink-nodes/running-a-chainlink-node) which makes the API call and sends the output to a callback function in `ShiroStore`.
- The callback in `ShiroStore` verifies that the file size matches the input given. If it does not match, the file is rejected and the payment is reverted (sans gas fees). If it does match, the contract emits a `NewFile` event.
- The [Shiro Service](./deployment/service.md) listens for events on the `ShiroStore` contract.
    - When it finds a `NewFile` event, it gets the file from the Shiro IPFS relay.
    - The file is then uploaded by the service to the given [Storage Provider](./providers.md).
