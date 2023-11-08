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

The dev environment is configured to run the latest of the development branch, and to also use the 'latest' dependents for frontend, management, publish.

Following steps can be used if you want to manually deploy a new version on dev environment; however see Continuous Integration.

```shell
  ssh root@lpdc-dev.s.redhost.be

  cd /data/app-lpdc-digitaal-loket-dev

  git pull

  drc down
  
  drc pull

  drc up -d

  drc logs  --follow --timestamps --since 1m
 
```

# Continuous Integration

Continuous integration (CI) is the practice of merging all developers' working copies to a shared mainline several times a day. 
However, we agreed to [use trunk-based-development](./adr/0002-trunk-based-development.md). Developers commit directly on the development branch (for each of the projects).  
So we need a continuous integration build that verifies all commits (either on the app-lpdc-digitaal-loket, or frontend-lpdc, or lpdc-management-service, or lpdc-publish). A commit on lpdc-publish can also break something on app-lpdc-digitaal-loket ...

So we created a ci pipeline that verifies all when committing on development branches: [overview of Continuous Integration setup (private link)](https://miro.com/app/board/uXjVPrXQm7w=/?moveToWidget=3458764562721514615&cot=14). 

More in detail:
We have an automated build pipeline in woodpecker ci that:
- [builds frontend-lpdc, runs its component and unit tests and deploys a new latest docker container on commit of development branch](https://build.redpencil.io/repos/2368)
- [builds lpdc-management-service, runs its unit tests and deploys a new latest docker container on commit of development branch](https://build.redpencil.io/repos/2378)
- [builds lpdc-publish and deploys a new latest docker container on commit of development branch](https://build.redpencil.io/repos/2379)

When woodpecker ci build created a new latest container of frontend-lpdc, lpdc-management-service or lpdc-publish; or on a new commit on development branch of app-lpdc-digitaal-loket, [the run-latest test suite and deploy dev is run for app-lpdc-digitaal-loket project](https://build.redpencil.io/repos/2382)
When this build succeeds, a new latest build is automatically deployed on development environment as well.

### Configuration notes
- We created a private / public key pair on the woodpecker ci server. The private key was exposed as ssh_key on the woodpecker ci, the public key was added to authorized keys on the lpdc dev machine.
- We noticed connection ssh problems from the woodpecker ci machine to the lpdc dev machine, the ufw limit always hit, so we added an extra rule to allow traffic from the woodpeckeer ci machine to the lpdc dev machine 
```shell
   sudo ufw insert 1 allow from <<the ip address from the woodpecker ci machine>>
```
  This might cause future problems if the ip address from the woodpecker ci ever changes ... 
- We did a checkout in the folder _data/app-lpdc-digitaal-loket-ci_ on the lpdc dev machine, on branch development.
- For the frontend-lpdc, lpdc-management-service, and the lpdc-publish project in woodpecker, a secret with name _woodpecker_token_ was added containing a ['Personal Access Token'](https://build.redpencil.io/user) from a user of the project that has access to the app-lpdc-digitaal-loket project.

### Viewing playwright test results and/or traces from a specific build

Woodpecker ci can unfortunately not directly be configured to view the playwright html test results or the traces. Only a textual output can be viewed in woodpecker ci. 

If you would like to view the html report (and traces), you have to _manually copy the results from the lpdc-dev machine to your local machine_.

_How_ ? The build automatically copies the playwright build results to a folder specific per build on the lpdc-dev machine.

You can view the results locally by first configuring playwright globally (only needed first time):
```shell
  npm install --global -D @playwright/test
```

And then executing for a specific build:
```shell
  cd /tmp
  scp -p -r root@lpdc-dev.s.redhost.be:/data/woodpecker-ci-app-lpdc-digitaal-loket-ci-build-results/build-<your build number here> /tmp
  cd /tmp/build-<your build number here>/all-reports
  npx playwright show-report playwright-report-api # for the api tests; browser should open automatically
  npx playwright show-report playwright-report-e2e # for the e2e tests
```

# Making a release

app-lpdc-digitaal-loket uses 3 other docker containers we also develop directly: 
- lblod/frontend-lpdc:<version>
- lblod/lpdc-management-service:<version>
- lblod/lpdc-publish-service:<version>

After the demo after each sprint, we want to make a release of app-lpdc-digitaal-loket. For this we should first verify if we made any changes to any of the three other docker containers. (frontend, management, publish).
If needed, we first make a new release of these containers (instructions to be found in these repos). Then we can update the versions in the docker-compose file. And make a release of app-lpdc-digitaal-loket, by making a release version in git (which also tags).

# Deploying a release

## Test

On test we always deploy a released version.

```shell
  ssh root@lpdc-dev.s.redhost.be

  cd /data/app-lpdc-digitaal-loket-test

  git fetch --all --tags

  git checkout tags/<my version>
  #e.g. of a version: v0.2.0 
  
  drc down
  
  drc pull

  drc up -d

  drc logs  --follow --timestamps --since 1m
 
```

## Acc

On acc we always deploy a released version. 

_Infrastructure notes_:  [acceptance currently has special configs we want to remove over time](infrastructure-architecture.md#acc).

Deployment instructions: see [prod](#prod).

## Prod

On prod we always deploy a released version. 

_Infrastructure notes_:  [production currently has special configs we want to remove over time](infrastructure-architecture.md#prod).

```shell
  ssh root@lpdc-prod.s.redhost.be
 
  cd /data/app-lpdc-digitaal-loket
  
  drc down
  
  cd /data
  
  #take a backup of all
  tar -zcvf app-lpdc-digitaal-loket-prod.tar.gz app-lpdc-digitaal-loket/
  
  cd /data/app-lpdc-digitaal-loket

  git fetch --all --tags
  
  #some configs are only for prod, so stash them for now
  git stash -u

  git checkout tags/<my version>
  #e.g. of a version: v0.2.0 
  
  # get back those configs
  git stash apply
  
  #manually merge and verify the configs unstashed (sometimes new configs have been added, and need manual additions/corrections)
  
  #(possibly non exhaustive) list of manual changes: 
  
  #Ensure to copy the /config/dispatcher/dispatcher.ex (without the commented /mock/sessions) to /config/controle-dispatcher/dispatcher.ex. .
  #Merge the /config/dispatcher/dispatcher.ex change of the /mock/sessions with the latest version of this file.
  #Update in the docker-compose-override.yml manually the frontend version (controle container), identifier version (controle-identifier container) and dispatcher version (controle-dispatcher) to the one of this release.
  
  drc pull

  drc up -d

  drc logs  --follow --timestamps --since 1m
  
  git stash clear
  
  cd /data
  
  #take a backup of all
  tar -zcvf app-lpdc-digitaal-loket-prod-2.tar.gz app-lpdc-digitaal-loket/
  
  #move backups to /backups/prod-data-backups/<releasename> folder (e.g. 2023-09)
 
```


