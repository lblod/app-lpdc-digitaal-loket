# Reclaim disk space on dev server

```shell
# show disk space used
df -h
# prune unused docker containers/networks/images
docker system prune -a
```
