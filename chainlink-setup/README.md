# Setting up a chainlink node with custom job

## Chainlink Node

### Pre-requisites

Assuming debian-based system.
- Docker:
- Docker compose (tested on v1):
    ```bash
    sudo apt install python3 python3-pip
    pip install docker-compose
    ```

### Node setup

- Clone this directory and `cd` into it.
- Create env files:
    - `postgres.env`:
        ```
        POSTGRES_PASSWORD=password
        POSTGRES_DB=chainlink
        ```
    - `chainlink.env` (make sure to replace `ETH_CHAIN_ID` and `ETH_URL` accordingly. Note `ETH_URL` needs to be websocket.):
        ```
        ROOT=/chainlink
        LOG_LEVEL=debug
        ETH_CHAIN_ID=80001
        CHAINLINK_TLS_PORT=0
        SECURE_COOKIES=false
        ALLOW_ORIGINS=*
        ETH_URL=<<<REPLACE_THIS>>>
        DATABASE_URL=postgresql://postgres:password@postgres:5432/chainlink?sslmode=disable
        MIN_OUTGOING_CONFIRMATIONS=1
        ETH_FINALITY_DEPTH=1
        ```
- One time setup:
    ```
    mkdir -p chainlink_data
    # api user email
    echo "admin@store.shiro.network" > chainlink_data/.api
    # api password
    echo "ShareAllTheThings" >> chainlink_data/.api
    # node wallet password
    echo "ShareAllTheThings" > chainlink_data/.password
    chown -R 14933:14933 chainlink_data
    docker-compose build
    ```
- Run services:
    ```
    docker-compose up -d
    ```
- Check health:
    ```
    docker-compose ps
    ```
- Use ssh tunneling to access UI. For example, on GCP:
    ```
    gcloud compute ssh $INSTANCE_NAME -- -L 6688:localhost:6688
    ```
- Use API username/password from above one time setup commands to login on [`http://localhost:6688/`](http://localhost:6688/).

### Fulfilling requests

Follow [the docs](https://docs.chain.link/docs/fulfilling-requests/#deploy-your-own-oracle-contract) with some important changes:
- Use [`Operator.sol`](https://github.com/smartcontractkit/chainlink/blob/48e251901d90b8d1c9a87de856f93d9c75e8d12b/contracts/src/v0.7/Operator.sol) instead of `Oracle.sol`
    - Use `setAuthorizedSenders` to authorize the node's address
    - Use the deployed address of this contract in place of Oracle address everywhere - especially `contractAddress` in the job spec.
- Add a new job using the [`jobspec.toml`](./jobspec.toml) - change things as needed.

