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
