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

# Verify if production is working correctly

This is a manual process.

On production terminal
```shell
cd /data/app-lpdc-digitaal-loket
```

#### Memory usage

```shell
htop
```

Memory usage typically is **8.5 G / 15 G used**.

#### CPU load
```shell
htop
```

Load average is typically very low, 0.50 0.42 0.38; unless a batch is running , then you typically have 4 or 5 load average. If there is a high load average, there should be a reason.

#### All docker containers are running

```shell
docker ps
```
Following containers should be at least in the list:  
- app-lpdc-digitaal-loket-lpdc-1
- app-lpdc-digitaal-loket-identifier-1
- app-lpdc-digitaal-loket-dispatcher-1
- app-lpdc-digitaal-loket-dashboard-1
- app-lpdc-digitaal-loket-report-generation-1
- app-lpdc-digitaal-loket-file-1
- app-lpdc-digitaal-loket-controle-1
- app-lpdc-digitaal-loket-controle-identifier-1
- app-lpdc-digitaal-loket-controle-dispatcher-1
- app-lpdc-digitaal-loket-login-1
- app-lpdc-digitaal-loket-sink-1
- app-lpdc-digitaal-loket-mocklogin-1
- app-lpdc-digitaal-loket-cache-1
- app-lpdc-digitaal-loket-resource-1
- app-lpdc-digitaal-loket-database-1
- app-lpdc-digitaal-loket-virtuoso-1
- app-lpdc-digitaal-loket-migrations-1
- app-lpdc-digitaal-loket-deltanotifier-1
- app-lpdc-digitaal-loket-lpdc-management-1
- app-lpdc-digitaal-loket-lpdc-publish-1
- app-lpdc-digitaal-loket-lpdc-ldes-consumer-1

Following command strips off all other containers, and counts. 
```shell
 docker ps | grep -v monitor | grep -v CREATED | grep -v app-http-logger | grep -v metrics-exporter | grep -v letsencrypt | wc -l
 >> 21 (as expected result)
```

#### ldes consumer stream from ipdc is still running

We see in the logs if the ldes consumer is still getting in the last 2 hours the ipdc ldes stream.  

```shell
drc logs --timestamps --since 2h | grep ldes-consumer | grep EventStream -A 2
```

We should find recent logs:
```shell
...
app-lpdc-digitaal-loket-lpdc-ldes-consumer-1  | 2023-11-14T12:18:56.114834250Z 2023-11-14T12:18:56.114Z [EventStream] info: GET https://ipdc.vlaanderen.be/doc/conceptsnapshot?limit=25&pageNumber=135
app-lpdc-digitaal-loket-lpdc-ldes-consumer-1  | 2023-11-14T12:18:56.241465784Z 2023-11-14T12:18:56.241Z [EventStream] info: 200 https://ipdc.vlaanderen.be/doc/conceptsnapshot?limit=25&pageNumber=135 (127) ms
app-lpdc-digitaal-loket-lpdc-ldes-consumer-1  | 2023-11-14T12:19:00.550893940Z 2023-11-14T12:19:00.550Z [EventStream] info: GET https://ipdc.vlaanderen.be/doc/conceptsnapshot?limit=25&pageNumber=136
app-lpdc-digitaal-loket-lpdc-ldes-consumer-1  | 2023-11-14T12:19:00.965331560Z 2023-11-14T12:19:00.965Z [EventStream] info: 200 https://ipdc.vlaanderen.be/doc/conceptsnapshot?limit=25&pageNumber=136 (415) ms
app-lpdc-digitaal-loket-lpdc-ldes-consumer-1  | 2023-11-14T12:19:03.948704851Z CONSUMER DONE
...
```

#### Login logs reveal that users can login to the application

We see in the logs of login if the users can create new sessions. We verify if the last 7 days there are any logins.

```shell
drc logs --since 168h --timestamps | grep app-lpdc-digitaal-loket-login | grep "foaf:firstName" | wc -l
>> 25 (about this as expected result)
```

#### Access logs reveal that users can use the application 

We see in the access logs of lpdc (the ui proxy) and grep for a business operation

```shell
drc logs --since 24h --timestamps | grep app-lpdc-digitaal-loket-lpdc-1 | grep formal-informal-choices | grep "HTTP/1.1\" 200" | wc -l
>> 735 (at least several hundreds as expected result)
```

#### Http 404 errors

We want to take a quick glance at the 404 errors. Mostly they are attempts to attack the system.

```shell
drc logs --since 168h --timestamps | grep app-lpdc-digitaal-loket-lpdc-1 | grep "\" 404 "
```

#### Http 500 errors

Similar than [404 errors](operation-support.md#http-404-errors)

```shell
drc logs --since 168h --timestamps | grep app-lpdc-digitaal-loket-lpdc-1 | grep "\" 500 "
```

#### lpdc publish to ipdc

We want to verify if there are not too many errors in the logs ... and if the publish ran.

```shell
docker compose logs --timestamps --since 70m | grep lpdc-publish-1 | grep "Response status code"
```

20 items seems reasonable:

```
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:00.746075626Z Response status code: 500
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:34.966504398Z Response status code: 500
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:35.762599335Z Response status code: 500
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:36.431217833Z Response status code: 500
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:36.980860162Z Response status code: 500
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:37.563557006Z Response status code: 500
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:38.229948920Z Response status code: 500
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:38.845901495Z Response status code: 500
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:39.426254816Z Response status code: 500
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:40.024528857Z Response status code: 500
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:40.688958453Z Response status code: 500
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:41.434440134Z Response status code: 400
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:42.256561855Z Response status code: 500
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:42.987004518Z Response status code: 500
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:43.799075028Z Response status code: 400
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:44.779003857Z Response status code: 400
app-lpdc-digitaal-loket-lpdc-publish-1  | 2023-11-14T14:00:45.532188679Z Response status code: 500
```

# Restart LDES stream

## Test

Query to clear state in database
```shell
DELETE { 
	GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
		<https://ipdc.tni-vlaanderen.be/doc/conceptsnapshot> <http://mu.semte.ch/vocabularies/ext/state> ?state. 
	} 
} 
WHERE { 
	GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
		<https://ipdc.tni-vlaanderen.be/doc/conceptsnapshot> <http://mu.semte.ch/vocabularies/ext/state> ?state. 
	} 
}
```

restart ldes docker container
```shell
docker restart app-lpdc-digitaal-loket-test-lpdc-ldes-consumer-1
```

## PROD

Query to clear state in database
```shell
DELETE {
    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> {
          <https://ipdc.vlaanderen.be/id/conceptsnapshot> <http://mu.semte.ch/vocabularies/ext/state> ?state.
    }
} WHERE {
    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> {
        <https://ipdc.vlaanderen.be/id/conceptsnapshot> <http://mu.semte.ch/vocabularies/ext/state> ?state.
    }
}
```

restart ldes docker container
```shell
docker restart app-lpdc-digitaal-loket-lpdc-ldes-consumer-1
```













