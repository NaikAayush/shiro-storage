---
sidebar_position: 4
---

# Service

**Repository**: [https://github.com/NaikAayush/shiro-storage/tree/main/service](https://github.com/NaikAayush/shiro-storage/tree/main/service)

The most important component.

## Why?

This is the service which reads events on the chain and actually uploads files.

## Pre-requisites

- NodeJS v18
- yarn

## Set up

### Install dependencies
```
yarn
```

### Create a `.env` file

```
PORT=3000
QUICKNODE_URL=<URL of your ETH node - could be infura, quicknode, etc.>
CONTRACT_ADDRESS=<ShiroStore contract address>
IPFS_GATEWAY_URL=https://<Domain of IPFS deployment>/api/v0
WEB3STORAGE_TOKEN=<If using web3.storage, provide API Token here>
```

## Dev server

```
yarn start:dev
```

## Production deployment

### systemd unit file

Script (name it `start.sh`, change `HOME` and nvm stuff if necessary):
```bash
#!/bin/bash

set -euxo pipefail

export HOME="/root"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

cd "$SCRIPT_DIR"

yarn build

yarn start:prod
```

### nginx config

```nginx
server {
    server_name <your domain>;

    location / {
            proxy_pass http://127.0.0.1:3000;
    }
}
```

`certbot` can then be used to set up SSL/TLS for HTTPS.
