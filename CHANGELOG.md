# Changelog

## v0.21.6 (2024-09-06)
### Backend
- Remove duplicate URI for IBEG. (DL-5770)
- Bump `mu-cl-resources` to `v1.24.0`. (LPDC-1303)
### Deploy Notes
- Remove `mu-cl-resources` override from `docker-compose.override.yml`.
#### Docker Commands
- `drc restart migrations && drc logs -ft --tail=200 migrations`
- `drc restart resource cache`
- `drc up -d lpdc-management`: Previous version was not deployed, so this command has not been run yet.

## v0.21.5 (2024-08-24)

### Backend
- `lpcd-management-service` bumped to v0.44.2 to prevent overriding competent authorities when that field is empty in the concept (LPDC-1255)

## Deploy instructions
### Docker commands
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
