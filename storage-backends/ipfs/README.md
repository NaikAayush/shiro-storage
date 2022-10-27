# Setting up a IPFS node

<!-- 1. Install go -->
<!-- 2. -->
<!--     ``` -->
<!--     sudo apt install make pkg-config libssl-dev libcrypto++-dev -->
<!--     ``` -->
<!-- 3. -->
<!--     ``` -->
<!--     mkdir -p ~/tmp -->
<!--     git clone https://github.com/ipfs/go-ipfs.git ~/tmp/ipfs -->
<!--     cd ~/tmp/ipfs -->
<!--     ``` -->
<!-- 4. -->
<!--     ``` -->
<!--     go get github.com/lucas-clemente/quic-go -->
<!--     GOTAGS=openssl make install -->
<!--     ``` -->

1.
    ```
    wget https://dist.ipfs.tech/kubo/v0.16.0/kubo_v0.16.0_linux-amd64.tar.gz
    tar -xvzf kubo_v0.16.0_linux-amd64.tar.gz
    cd kubo
    sudo bash install.sh
    ```
1. Run daemon:
   ```
   ipfs daemon --enable-gc=true --migrate=true
   ```

