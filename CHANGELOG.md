# Changelog
## Unreleased
### Backend
- Bump `frontend` and `lpdc-management` to add the merger feature flag (LPDC-1339)
- Disable cache on public service concepts route [LPDC-1360]
#### Docker commands
- `drc pull lpdc lpdc-management; drc up -d lpdc lpdc-management`
- `drc restart dispatcher`


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
