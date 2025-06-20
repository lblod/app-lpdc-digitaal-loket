# Changelog

## Unreleased

### Backend

- enable ACM/IDM logins for the dashboard [LPDC-1413]
- Enable ACM/IDM for LPDC [LPDC-1029] ([LPDC-1405] [LPDC-1406])
- New `lpdc-management-service` with better admin support

### Deploy notes

#### Dashboard

The new dashboard requires a slightly different deploy setup. The dispatcher redirects requests to the frontend based on the host name. 

- move the VIRTUAL_HOST and LETSENCRYT_* environment variables from the dashboard to the identifier service
  > Note that the host names for the ACC and PROD dashboards will be different now.
  > ACC: https://dashboard.acc.lpdc.lokaalbestuur.lblod.info
  > PROD: http://dashboard.lpdc.lokaalbestuur.vlaanderen.be
- add the correct environment variables to the dashboard and dashboard login services (See the overrides files for examples)
- remove the mock-login service once both the dashboard and controle environments use ACM/IDM (ACC & PROD only)

Once everything is updated in the docker-compose.override.yml file you need to `up -d` and restart some services.
- `drc restart migrations; drc logs -ft --tail=200 migrations`
- `drc up -d dashboard login-dashboard identifier`
- `drc restart dispatcher`

#### LPDC

* There is a new login-lpdc service. Rename the old `login` to `login-lpdc` in
  the `docker-compose.override.yml`.
* Start the `impersonation` service

    docker compose up -d impersonation

* Add the ACM/IDM client id and secret and start the new lpdc Loket frontend.

    drc up -d lpdc

* New dispatcher, resource, and mu-auth rules:

    drc restart cache resource database dispatcher

* New `lpdc-management-service`:

    drc up -d lpdc-management-service

#### Controle

All controle-* services and config should be removed from now on. This also
includes basic-auth setup. Make sure to move and collect all `VIRTUAL_HOST` and
`LETSENCRYPT_*` variables to the `identifier`. Restart and remove services
accordingly:

    drc up -d --remove-orphans

## v0.27.3 (2025-06-20)
### Frontend
- Bump to [v0.50.1](https://github.com/lblod/lpdc-management-service/releases/tag/v0.50.1)
### Frontend
- Bump to [v0.22.2](https://github.com/lblod/frontend-lpdc/blob/master/CHANGELOG.md#v0222-2025-06-20)
### Deploy notes
- On ACC and PROD: bump the frontend version for the `controle` service in `docker-compose.override.yml`
#### Docker commands
- `drc pull lpdc lpdc-management; drc up -d lpdc lpdc-management`

## v0.27.2 (2025-06-13)
### Backend
- datafix: rename rename PZ Rivierenland to PZ Bornem/Puurs-Sint-Amands/Mechelen/Willebroek [LPDC-1424]
### Deploy notes
#### Docker commands
- `drc restart migrations; drc logs -ft --tail=200 migrations`

## v0.27.1 (2025-06-02)
### Frontend
- Bump to [v0.22.1](https://github.com/lblod/frontend-lpdc/blob/development/CHANGELOG.md#v0221-2025-05-28)
### Deploy notes
- On PROD, comment the frontend image override in `docker-compose.override.yml`
- On ACC and PROD: bump the frontend version for the `controle` service in `docker-compose.override.yml`
#### Docker instructions
- `drc pull lpdc; drc up -d lpdc`
- `drc pull controle; drc up -d controle` (only on PROD and ACC)

## v0.27.0 (2025-05-26)
### Frontend
- Bump to [v0.21.0](https://github.com/lblod/frontend-lpdc/blob/development/CHANGELOG.md#v0210-2025-04-10)
- Bump to [v0.21.1](https://github.com/lblod/frontend-lpdc/blob/development/CHANGELOG.md#v0211-2025-04-15)
- Bump to [v0.22.0](https://github.com/lblod/frontend-lpdc/blob/development/CHANGELOG.md#v0220-2025-05-16)
### Management
- Bump to [v0.49.0](https://github.com/lblod/lpdc-management-service/releases/tag/v0.49.0)
- Bump to [v0.50.0](https://github.com/lblod/lpdc-management-service/releases/tag/v0.50.0)
### Backend
- datafix: disable municipality merger labels for product instances [LPDC-1403]
- added the competency and executing level to all the orgs with a migration [LPDC-1278]
- Bump `frontend` and `lpdc-management` to add validation before saving between authority levels and authorities [LPDC-1278]
- Additional reports to monitor for authorities without levels [LPDC-1393]
- datafix: delete triples with empty values for contact point URLs and address box numbers [LPDC-1297]
- bump BCT and Ghent LDES consumer to new version [LPDC-1414]
- add creator and lastmodifier user for publicServices [LPDC-1359]
### Deploy notes
- On ACC and PROD: bump the frontend version for the `controle` service in `docker-compose.override.yml`
- On TEST and PROD: In the `docker-compose.override.yml` for `ldes-consumer-instancesnapshot-gent`, remove the `LDES_STREAM` entry, rename `LDES_LOGGING_LEVEL` to `LOG_LEVEL`, and update `LDES_ENDPOINT_VIEW` to
  + TEST: "https://ldes.qa.stad.gent/ldes/lpdc/by-page"
  + PROD: "https://ldes.stad.gent/ldes/lpdc/by-page"
#### Docker instructions
- `drc restart migrations; drc logs -ft --tail=200 migrations`
- `drc pull lpdc lpdc-management; drc up -d lpdc lpdc-management`
- `drc pull report-generation; drc up -d report-generation`
- `drc restart resource cache`
- `drc pull ldes-consumer-instancesnapshot-bct; drc up -d ldes-consumer-instancesnapshot-bct`
- `drc pull ldes-consumer-instancesnapshot-gent; drc up -d ldes-consumer-instancesnapshot-gent`

## v0.26.1 (2025-04-04)
### Backend
- datafix: ensure all resources in IPDCOrganisaties concept scheme have the type `skos:Concept`
### Deploy notes
#### Docker commands
- `drc restart migrations; drc logs -ft --tail=200 migrations`

## v0.26.0 (2025-03-28)
### Frontend
- Bump to [v0.20.0](https://github.com/lblod/frontend-lpdc/blob/development/CHANGELOG.md#v0200-2025-03-04)
### Management
- Bump to [v0.48.0](https://github.com/lblod/lpdc-management-service/releases/tag/v0.48.0)
### Backend
- Bump `frontend` and `lpdc-management` to add the merger feature flag (LPDC-1339)
- Disable cache on public service concepts route [LPDC-1370]
- Bump the BCT LDES consumer to a tagged version
- Bump `lpdc-managament` adding extra validations on incoming instance snapshots [LPDC-1301]
- datafix: link active organisations to new spatials [LPDC-1383]
### Deploy notes
- On ACC and PROD: bump the frontend version for the `controle` service in `docker-compose.override.yml`
#### Docker commands
- `drc pull lpdc lpdc-management; drc up -d lpdc lpdc-management`
- `drc restart dispatcher`
- `drc pull ldes-consumer-instancesnapshot-bct; drc up -d ldes-consumer-instancesnapshot-bct`
- `drc restart migrations; drc logs -ft --tail=200 migrations`
- On ACC and PROD: `drc up -d controle`

## v0.25.1 (2025-02-25)
### Backend
- Persist state for LDES consumer
#### Docker commands
- `drc pull ldes-consumer-instancesnapshot-bct; drc up -d ldes-consumer-instancesnapshot-bct`

## v0.25.0 (2025-02-25)
### Backend
- Add an LDES consumer for BCT to support additional integrating organisations  [LPDC-1324]
### Deploy instructions
- To enable the LDES consumer for BCT set the correct `LDES_ENDPOINT_VIEW` in the environment's `docker-compose.override.yaml`. Ensure the migration adding data to the authorisation graph is executed before starting the LDES consumer.
#### Docker commands
- `drc restart migrations; drc logs -ft --tail=200 migrations`
- `drc pull ldes-consumer-instancesnapshot-bct; drc up -d ldes-consumer-instancesnapshot-bct`

## v0.24.0 (2025-02-10)
### Backend
- Archive product instances for merged municipalities and OCMWs (LPDC-1317)
- Add organisation statuses from OP (LPDC-1340)
- Bump `lpdc-management` service to v0.46.2 that no longer allows publishing  product instances linked to old organisations (LPDC-1335)
- Add `District Borsbeek` (LPDC-1336)
### Deploy instructions
Generate the environment-specific migrations to archive product instances following these [instructions](https://github.com/lblod/lpdc-management-service/blob/development/migration-scripts/transfer-instances/readme.md#transfer-instances) and place these migrations in the `config/migrations/local/` folder.
#### Docker commands
- `drc restart migrations; drc logs -ft --tail=200 migrations`
- `drc pull lpdc-management; drc up -d lpdc-management`

## v0.23.2 (2024-12-17)
### Backend
- Rename municipalities and OCMWs for 2025 municipality mergers (LPDC-1331)
### Deploy instructions
- Execute the migration to update the organisation names
#### Docker commands
- `drc restart migrations; drc logs -ft --tail=200 migrations`

## v0.23.1 (2024-12-03)
### Backend
- Fix: prefill geographical scope field for merged organisations (LPDC-1332)
### Deploy instructions
- Execute the migration to insert the missing werkingsgebieden
#### Docker commands
- `drc restart migrations; drc logs -ft --tail=200 migrations`

## v0.23.0 (2024-11-28)
### Frontend
- [v0.19.0](https://github.com/lblod/frontend-lpdc/blob/development/CHANGELOG.md#v0190-2024-11-28) (LPDC-1318)
### Backend
- Bump `frontend`
- Bump `lpdc-management` to v0.45.0 to allow publishing product instances with the merger label enabled (LPDC-1318)
### Deploy Notes
- Add local migrations to transfer product instances in the context of the 2025 municipality mergers, see the [script's README](https://github.com/lblod/lpdc-management-service/blob/development/migration-scripts/transfer-instances/readme.md#transfer-instances) for details.
- On ACC and PROD: bump the frontend version for the `controle` service in `docker-compose.override.yml`
#### Docker Commands
- `drc up -d lpdc lpdc-management`
- On ACC and PROD: `drc up -d controle`
- `drc restart migrations; drc logs -ft --tail=200 migrations`

## v0.22.0 (2024-11-25)
### Backend
- Add `mock-login` accounts for the new fusies. (LPDC-1291)
- Add new NUTS 2024 codelist.
- Bump `lpdc-management`.
### Deploy instructions
#### Docker Commands
- `drc up -d lpdc-management`
- `drc restart migrations && drc logs -ft --tail=200 migrations`

## v0.21.6 (2024-09-06)
### Backend
- Remove duplicate URI for IBEG. (DL-5770)
- Bump `mu-cl-resources` to `v1.24.0`. (LPDC-1303)
### Deploy instructions
- Remove `mu-cl-resources` override from `docker-compose.override.yml`.
#### Docker Commands
- `drc restart migrations && drc logs -ft --tail=200 migrations`
- `drc restart resource cache`
- `drc up -d lpdc-management`: Previous version was not deployed, so this command has not been run yet.

## v0.21.5 (2024-08-24)
### Backend
- `lpcd-management-service` bumped to v0.44.2 to prevent overriding competent authorities when that field is empty in the concept (LPDC-1255)
### Deploy instructions
#### Docker commands
- `drc up -d lpdc-management`

## v0.21.3 (2024-08-08)
### Frontend
- [v0.18.4](https://github.com/lblod/frontend-lpdc/blob/development/CHANGELOG.md#v0184-2024-08-08) (LPDC-1282)

### Deploy instructions
#### Docker commands
- `drc up -d lpdc`

## v0.21.2 (2024-08-07)
### Frontend
- [v0.18.3](https://github.com/lblod/frontend-lpdc/blob/development/CHANGELOG.md#v0183-2024-08-07) (LPDC-1282)
- [v0.18.2](https://github.com/lblod/frontend-lpdc/blob/development/CHANGELOG.md#v0182-2024-08-05) (LPDC-1270, LPDC-1276)

### Deploy instructions
#### Docker commands
- `drc up -d lpdc`
