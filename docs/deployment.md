# Development

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

Following steps can be used if you want to manually deploy a new version on dev environment; however see Continuous Integration.

```shell
  ssh root@lpdc-dev.s.redhost.be

  cd /data/app-lpdc-digitaal-loket-dev

  git pull

  drc down
  
  drc pull

  drc up -d

  docker compose logs  --follow --timestamps --since 1m
 
```

# Continuous Integration

Continuous integration (CI) is the practice of merging all developers' working copies to a shared mainline several times a day. 

We have an automated build pipeline in woodpecker ci that:
- [builds frontend-lpdc, runs its component and unit tests and deploys a new latest docker container on commit of kunlabora branch](https://build.redpencil.io/repos/2368)
- [builds lpdc-management-service, runs its unit tests and deploys a new latest docker container on commit of kunlabora branch](https://build.redpencil.io/repos/2378)
- [builds lpdc-publish and deploys a new latest docker container on commit of kunlabora branch](https://build.redpencil.io/repos/2379)

When woodpecker ci build created a new latest container of frontend-lpdc, lpdc-management-service or lpdc-publish; or on a new commit on kunlabora branch of app-lpdc-digitaal-loket, [the run-latest test suite and deploy dev is run for app-lpdc-digitaal-loket project](https://build.redpencil.io/repos/2382)
When this build succeeds, a new latest build is automatically deployed on development environment as well.

_Configuration notes_
- we created a private / public key pair on the woodpecker ci server. The private key was exposed as ssh_key on the woodpecker ci, the public key was added to authorized keys on the lpdc dev machine.
- We noticed connection ssh problems from the woodpecker ci machine to the lpdc dev machine, the ufw limit always hit, so we added an extra rule to allow traffic from the woodpeckeer ci machine to the lpdc dev machine 
```shell
   sudo ufw insert 1 allow from <<the ip address from the woodpecker ci machine>>
```
  This might cause problems if the ip address from the woodpecker ci changes ... 
- We did a checkout in the folder _data/app-lpdc-digitaal-loket-ci_  on the lpdc dev machine, on branch kunlabora.
- For the frontend-lpdc, lpdc-management-service, and the lpdc-publish project in woodpecker, a secret with name _woodpecker_token_ was added containing a ['Personal Access Token'](https://build.redpencil.io/user) from a user of the project that has access to the app-lpdc-digitaal-loket project.

# Making a release

app-lpdc-digitaal-loket uses 3 other docker containers we also develop directly: 
- lblod/frontend-lpdc:<version>
- lblod/lpdc-management-service:<version>
- lblod/lpdc-publish-service:<version>

After the demo after each sprint, we want to make a release of app-lpdc-digitaal-loket. For this we should first verify if we made any changes to any of the three other docker containers. (frontend, management, publish).
If needed, we first make a new release of these containers (instructions to be found in these repos). Then we can update the versions in the docker-compose file. And make a release of app-lpdc-digitaal-loket, by making a release version in git (which also tags).

# Deploying a release

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