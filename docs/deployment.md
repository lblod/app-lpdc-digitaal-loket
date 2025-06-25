# Development

## Test

The Test environment is configured to run the latest of the development branch, and to also use the 'latest' dependents for frontend, management, publish.

Following steps can be used if you want to manually deploy a new version on dev environment; however see Continuous Integration.

```shell
  ssh root@lpdc-dev.s.redhost.be

  cd /data/app-lpdc-digitaal-loket-dev # or `cd /data/app-lpdc-digitaal-loket-test` for Test

  git pull

  drc down --remove-orphans

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

New releases are created whenever appropriate and the frequency can differ over time.

## Classic release

0. Check that the [changelog](https://github.com/lblod/app-lpdc-digitaal-loket/blob/master/CHANGELOG.md) contains the necessary instructions for deployment.
1. Merge all required changes into the master branch. This usually means merging the development branch into master.
2. In the [changelog](https://github.com/lblod/app-lpdc-digitaal-loket/blob/master/CHANGELOG.md) move the content of the `Unreleased` to a new release section with the version number and (intended) release date as title.
3. Add an appropriate tag `vX.Y.Z[-N]`. For a pre-release, to be deployed to ACC, be sure to append a `-N`.
4. Push the updated changelog and tag
5. Merge the changes performed in master back into development.

## Hotfix release

0. Create a hotfix branch by starting from master. Make the necessary changes in that branch, make a PR, and have it reviewed.
1. Merge the hotfix branch directly into master, typically after the corresponding PR has been reviewed and approved.
3. Add an appropriate tag `vX.Y.Z[-N]`. For a pre-release, to be deployed to ACC, be sure to append a `-N`.
4. Push the changes along with the tag.
5. After the hotfix release is finalised, merge the changes in master into the development branch.

# Deploying (a release)

## TEST

The TEST environment follows the development branch and does not explicitly deploy releases. Note, in this environment the frontend is also configured to follow the latest tag.

```shell
ssh root@lpdc-dev.s.redhost.be

cd /data/app-lpdc-digitaal-loket-test

# Pull the latest changes
git pull

# Follow (new) instructions in the Deploy notes subsection in the changelog's Unreleased section. If you are deploying the changes from a hotfix release follow the instructions in that release's section.
```

## ACC

On ACC we always deploy a (pre-)released version.

```shell
ssh root@lpdc-dev.s.redhost.be

cd /data/app-lpdc-digitaal-loket-acc

# Follow the same instructions as for PROD.
```

## PROD

On PROD we always deploy a released version.

Optional, mention on rocket chat that we will perform a new release, so the operations team is warned. For example, in case (significant) downtime is expected.

```shell
  ssh root@lpdc-prod.s.redhost.be

  cd /data/app-lpdc-digitaal-loket

  # Optional, verify that ldes consumers and its processing in lpdc-management have finished (via logs)

  drc logs --timestamps --since 10m | grep ldes-consumer

  drc logs --timestamps --since 10m | grep lpdc-management-1

  # Optional, remove all user sessions to avoid that users can keep working on cached version
  # DELETE WHERE  {
  #   GRAPH <http://mu.semte.ch/graphs/sessions> {
  #     ?s ?p ?o.
  #   }
  # }

  # If virtuoso will be stopped, make sure all db changes are saved to disk
  docker exec -it my-virtuoso bash
  isql-v -U dba -P $DBA_PASSWORD
  SQL> checkpoint;

  # Fetch all tags
  git fetch --all --tags

  # Switch to the appropriate tag
  git switch --detach VERSION_TAG

  # Follow the instructions in the changelog. The Deploy notes and/or Docker instructions section for the release at hand should list all necessary steps.
```
