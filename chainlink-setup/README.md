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
