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
