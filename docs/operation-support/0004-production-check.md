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

#### Lpdc-management logs

```shell
drc logs --since 24h --timestamps | grep app-lpdc-digitaal-loket-lpdc-management-1
```

Following is an example of normal behaviour. 1/ server started 2/ optimistic locking check went of 3 times 3/ processing of new conceptsnapshots

If we find any other type of **Error** or an **Invariant failure**, or anything else, we should we investigate.

```text
pp-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T11:45:18.451576632Z 
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T11:45:18.451659126Z > lpdc-management-service@0.34.1 start
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T11:45:18.451666821Z > ts-node app.ts
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T11:45:18.451672071Z 
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T11:45:23.195099287Z Starting server on 0.0.0.0:80 in development mode
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T12:48:09.697942295Z LPDCError {
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T12:48:09.697994793Z   status: 400,
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T12:48:09.698000574Z   message: 'De productfiche is gelijktijdig aangepast door een andere gebruiker. Herlaad de pagina en geef je aanpassingen opnieuw in.'
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T12:48:09.698004711Z }
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T12:58:55.066918687Z LPDCError {
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T12:58:55.066953783Z   status: 400,
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T12:58:55.066958992Z   message: 'De productfiche is gelijktijdig aangepast door een andere gebruiker. Herlaad de pagina en geef je aanpassingen opnieuw in.'
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T12:58:55.066963491Z }
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T15:12:48.922402945Z LPDCError {
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T15:12:48.922449453Z   status: 400,
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T15:12:48.922453881Z   message: 'De productfiche is gelijktijdig aangepast door een andere gebruiker. Herlaad de pagina en geef je aanpassingen opnieuw in.'
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T15:12:48.922457668Z }
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T15:20:23.546328785Z LdesPostProcessingQueue: Executing oldest task on queue
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T15:20:24.477814965Z New versioned resource found: https://ipdc.vlaanderen.be/id/conceptsnapshot/c9748c67-c913-4481-b99f-35a060653e17 of service https://ipdc.vlaanderen.be/id/concept/cf45ce1d-8a07-4c1a-81f0-9bc985192d68
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T15:20:24.907269461Z LdesPostProcessingQueue: Remaining number of tasks 0
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T18:35:25.790274488Z LdesPostProcessingQueue: Executing oldest task on queue
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T18:35:26.463021207Z New versioned resource found: https://ipdc.vlaanderen.be/id/conceptsnapshot/fdb8bc1d-145c-47ac-962c-737157399b06 of service https://ipdc.vlaanderen.be/id/concept/f5be8a28-9093-4826-b080-bf57cbb02e2d
app-lpdc-digitaal-loket-lpdc-management-1  | 2024-02-29T18:35:26.846351568Z LdesPostProcessingQueue: Remaining number of tasks 0
```

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
