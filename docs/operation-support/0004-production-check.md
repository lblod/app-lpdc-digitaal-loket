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
- app-lpdc-digitaal-loket-ldes-consumer-conceptsnapshot-ipdc-1

Following command strips off all other containers, and counts.
```shell
 docker ps | grep -v monitor | grep -v CREATED | grep -v app-http-logger | grep -v metrics-exporter | grep -v letsencrypt | wc -l
```
gives: 21 (as expected result)

#### ldes consumer stream from ipdc is still running

We see in the logs if the ldes consumer is still getting in the last 2 hours the ipdc ldes stream.

```shell
drc logs --timestamps --since 2h | grep ldes-consumer | grep EventStream -A 2
```

We should find recent logs:
```shell
...
app-lpdc-digitaal-loket-ldes-consumer-conceptsnapshot-ipdc-1  | 2023-11-14T12:18:56.114834250Z 2023-11-14T12:18:56.114Z [EventStream] info: GET https://ipdc.vlaanderen.be/doc/conceptsnapshot?limit=25&pageNumber=135
app-lpdc-digitaal-loket-ldes-consumer-conceptsnapshot-ipdc-1  | 2023-11-14T12:18:56.241465784Z 2023-11-14T12:18:56.241Z [EventStream] info: 200 https://ipdc.vlaanderen.be/doc/conceptsnapshot?limit=25&pageNumber=135 (127) ms
app-lpdc-digitaal-loket-ldes-consumer-conceptsnapshot-ipdc-1  | 2023-11-14T12:19:00.550893940Z 2023-11-14T12:19:00.550Z [EventStream] info: GET https://ipdc.vlaanderen.be/doc/conceptsnapshot?limit=25&pageNumber=136
app-lpdc-digitaal-loket-ldes-consumer-conceptsnapshot-ipdc-1  | 2023-11-14T12:19:00.965331560Z 2023-11-14T12:19:00.965Z [EventStream] info: 200 https://ipdc.vlaanderen.be/doc/conceptsnapshot?limit=25&pageNumber=136 (415) ms
app-lpdc-digitaal-loket-ldes-consumer-conceptsnapshot-ipdc-1  | 2023-11-14T12:19:03.948704851Z CONSUMER DONE
...
```

#### Login logs reveal that users can login to the application

We see in the logs of login if the users can create new sessions. We verify if the last 7 days there are any logins.

```shell
drc logs --since 168h --timestamps | grep app-lpdc-digitaal-loket-login | grep "foaf:firstName" | wc -l
```
gives: 25 (about this as expected result)

#### Access logs reveal that users can use the application

We see in the access logs of lpdc (the ui proxy) and grep for a business operation

```shell
drc logs --since 24h --timestamps | grep app-lpdc-digitaal-loket-lpdc-1 | grep formal-informal-choices | grep "HTTP/1.1\" 200" | wc -l
```
gives: 735 (at least several hundreds as expected result)

#### Http 404 errors

We want to take a quick glance at the 404 errors. Mostly they are attempts to attack the system.

```shell
drc logs --since 168h --timestamps | grep app-lpdc-digitaal-loket-lpdc-1 | grep "\" 404 "
```

#### Http 500 errors

Similar than [404 errors](0004-production-check#http-404-errors)

```shell
drc logs --since 168h --timestamps | grep app-lpdc-digitaal-loket-lpdc-1 | grep "\" 500 "
```

#### lpdc publish to ipdc

We want to verify if there are not too many errors in the logs ... and if the publish ran. \
A report will be generated once a day. This can be viewed and downloaded in `dashboard-service`.
Login as 'Agentschap Binnenlands Bestuur'.

To verify where not missing data in report we can look for failed creation of publicationError
```shell
docker compose logs --timestamps --since 70m | grep lpdc-publish-1 | grep "Could not save publicationError"
```
or

```shell
docker compose logs --timestamps --since 70m | grep lpdc-publish-1 | grep "Could not publish"
```
