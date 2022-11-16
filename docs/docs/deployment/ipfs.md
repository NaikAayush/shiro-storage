---
sidebar_position: 5
---

# IPFS

## Set up

[Install IPFS](https://docs.ipfs.io/install/)

## systemd unit file

```systemd
[Unit]
Description=IPFS daemon

[Service]
ExecStart=/usr/local/bin/ipfs daemon
Restart=on-failure

[Install]
WantedBy=default.target
```

## nginx config

```nginx
server {
        server_name <your domain>;
        client_max_body_size 100M;

        location /ipfs {
                proxy_pass http://127.0.0.1:8080;
                client_max_body_size 100M;
        }

        location / {
                proxy_pass http://127.0.0.1:5001;
                client_max_body_size 100M;
        }
}
```

`certbot` can then be used to set up SSL/TLS for HTTPS.
