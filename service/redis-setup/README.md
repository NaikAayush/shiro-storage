# Setting up Redis using Docker for Shiro Storage Service

## Set up

```
docker run \
    --name some-redis \
    -d \
    -p 6379:6379 \
    -v $PWD/redis-data:/data \
    -v $PWD/redis-conf:/usr/local/etc/redis \
    redis:7 \
    redis-server --save 60 1 --loglevel warning
```

## Restart

```
docker stop some-redis && docker rm some-redis
```

This will keep the data. Set it up again to restart.
