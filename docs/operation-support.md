# docker compose vs drc

On the installed servers, _drc_ is used as an alias for _docker compose_

# Logs

## dev test acc

**http traffic**

On the dev/tst/acc server, [app http logger](https://github.com/redpencilio/app-http-logger) is set up, as [Option 1: Logging traffic and directly visualizing it](https://github.com/redpencilio/app-http-logger#option-1-logging-traffic-and-directly-visualizing-it).

## prod

**http traffic**

On the prod server, [app http logger](https://github.com/redpencilio/app-http-logger) is set up, as [Option 2: Logging traffic to (encrypted) files](https://github.com/redpencilio/app-http-logger#option-2-logging-traffic-to-encrypted-files).

**access logs**

The nginx access logs are piped to the app-lpdc-digitaal-loket-lpdc-1 container. After logging on, you can manually tail and follow the logs:

```shell
cd /data/app-lpdc-digitaal-loket

# access logs from last 7 days:
drc logs --follow --since 168h --timestamps | grep app-lpdc-digitaal-loket-lpdc-1

# filtered access logs on http status code 404
drc logs --follow --since 168h --timestamps | grep app-lpdc-digitaal-loket-lpdc-1 | grep "\" 404 "
```

**viewing docker logs**

[docker compose logs docs](https://docs.docker.com/engine/reference/commandline/compose_logs/)

_an example:_
```shell
cd /data/app-lpdc-digitaal-loket

# viewing all logs from the last seven days:
drc logs --follow --since 168h --timestamps

# viewing all logs from the last seven days for the resource microservice
drc logs --follow --since 168h --timestamps | grep app-lpdc-digitaal-loket-resource-1
```

# Restore backup from production to acceptance

On production machine

```shell
cd /tmp

# connect to storagebox where backups are saved
ssh -p 23 -i /root/.ssh/backups_rsa <your storagebox host>
# find backup you want to restore
ls
exit

# secure copy backup to tmp folder
scp -P 23 -i /root/.ssh/backups_rsa -r <your storagebox host>:/home/data_backup_20231107T040001 .
exit

```

On local machine 

```shell
 scp -p -r root@lpdc-prod.s.redhost.be:/tmp/data_backup_20231107T040001 /tmp
 
 scp -p -r /tmp/data_backup_20231107T040001 root@lpdc-dev.s.redhost.be:/tmp
```

On dev machine

```shell
cd /data/app-lpdc-digitaal-loket-acc
drc down
rm -rf data
cp -r /tmp/data_backup_20231107T040001/data/app-lpdc-digitaal-loket/data data/
drc up -d

#clean up
cd /tmp
rm -rf data_backup_20231107T040001
```

on production machine

```shell
#clean up
cd /tmp
rm -rf data_backup_20231107T040001
```

# Reclaim disk space on dev server

```shell
# show disk space used
df -h
# prune unused docker containers/networks/images
docker system prune -a
```