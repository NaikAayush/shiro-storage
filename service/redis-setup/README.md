# Setting up Redis using Docker for Shiro Storage Service

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
