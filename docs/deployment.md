# Making a release

app-lpdc-digitaal-loket uses 3 other docker containers we also develop directly: 
- lblod/frontend-lpdc:<version>
- lblod/lpdc-management-service:<version>
- lblod/lpdc-publish-service:<version>

After the demo after each sprint, we want to make a release of app-lpdc-digitaal-loket. For this we should first verify if we made any changes to any of the three other docker containers. (frontend, management, publish).
If needed, we first make a new release of these containers. Then we can update the versions in the docker-compose file. And make a release of app-lpdc-digitaal-loket, by making a release version in git (which also tags).

# Deploying a release / latest

## Local

Locally, we should always depend on the latest docker containers. So:

_docker-compose.override.yml_:
```yml
version: "3.7"

services:

  lpdc:
    image: lblod/frontend-lpdc:latest

  lpdc-management:
    image: lblod/lpdc-management-service:latest

  lpdc-publish:
    image: lblod/lpdc-publish-service:latest
```

## Dev

The dev environment is configured to run the latest of the kunlabora branch, and to also use the 'latest' dependents for frontend, management, publish.

```shell
  ssh root@lpdc-dev.s.redhost.be

  cd /data/app-lpdc-digitaal-loket-dev

  git pull

  drc down
  
  drc pull

  drc up -d

 docker compose logs  --follow --timestamps --since 1m
 
```

## Tst

On tst we always deploy a released version.

```shell
  ssh root@lpdc-dev.s.redhost.be

  cd /data/app-lpdc-digitaal-loket-tst
  
  git fetch --all --tags

  git checkout tags/<my version>
  #e.g. of a version: v0.2.0 

  drc down
  
  drc pull

  drc up -d

  docker compose logs  --follow --timestamps --since 1m
 
```

## Acc

On acc we always deploy a released version. Similar instructions as tst.

## Prd

//TODO 