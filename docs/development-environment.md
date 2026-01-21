# What's included?

This repository has two setups:

* *docker-compose.yml*: This provides you with the backend components; there is an included frontend application which you can publish using a separate proxy (we tend to put a letsencrypt proxy in front).
* *docker-compose.dev.yml*: Provides changes for a good frontend development setup.
    - publishes the backend services on port 90 directly, so you can run `ember serve --proxy http://localhost:90/` (or `eds --proxy http://host:90/` if you use [docker-ember](https://github.com/madnificent/docker-ember)) when developing the frontend app locally.
    - publishes the database instance on port 8890, so you can easily see what content is stored in the base triplestore.
    - provides a mock-login backend service, so you don't need the ACM/IDM integration.

## Setting up a local development stack

Setting up a local stack essentially consists of two steps: 1) checking out this project, and 2) initialising the local database with some data.

### Prerequisites

First install `git-lfs` (see <https://github.com/git-lfs/git-lfs/wiki/Installation>)
```
  # Ensure git-lfs is enabled after installation
  git lfs install

  # Clone this repository
  git clone https://github.com/lblod/app-lpdc-digitaal-loket.git

  # Move into the directory
  cd app-lpdc-digitaal-loket
```

To ease all typing for `docker compose` commands, start by creating the following files in the directory of the project:
* A `docker-compose.override.yml` file that can remain empty for now
* A `.env` file with following content:

```
COMPOSE_FILE=docker-compose.yml:docker-compose.dev.yml:docker-compose.override.yml
```

### Setting up the app for the first time
Update docker-compose.override.yml to add the config of op-public-consumer:
```
  op-public-consumer:
    environment:
      DCR_SYNC_BASE_URL: "https://dev.organisaties.abb.lblod.info" # For DEV
      DCR_SYNC_BASE_URL: "https://organisaties.abb.lblod.info" # For QA
      DCR_SYNC_BASE_URL: "https://organisaties.abb.vlaanderen.be" # For PROD
      DCR_LANDING_ZONE_DATABASE: "virtuoso"
      DCR_REMAPPING_DATABASE: "virtuoso"
      DCR_DISABLE_DELTA_INGEST: "true"
      DCR_DISABLE_INITIAL_SYNC: "false"
```

Then run
```
drc up -d
drc restart migrations; drc logs -ft --tail=200 migrations # wait for all migrations to run
drc up -d op-public-consumer; drc logs -ft --tail=200 op-public-consumer # wait for the initial sync to complete
```

Update the docker-compose.override.yml again:
```
  op-public-consumer:
    environment:
      DCR_SYNC_BASE_URL: "https://dev.organisaties.abb.lblod.info" # For DEV
      DCR_SYNC_BASE_URL: "https://organisaties.abb.lblod.info" # For QA
      DCR_SYNC_BASE_URL: "https://organisaties.abb.vlaanderen.be" # For PROD
      DCR_LANDING_ZONE_DATABASE: "database"
      DCR_REMAPPING_DATABASE: "database"
      DCR_DISABLE_DELTA_INGEST: "false"
      DCR_DISABLE_INITIAL_SYNC: "false"
```

And finally, run:
```
drc up -d
# Wait for the op-public-consumer to ingest all it needs to ingest
drc exec db-cleanup curl -X GET "http://localhost/runCronJob?cronJobID=38887a85-dba2-4edc-9298-ae87c82bc662"
drc exec db-cleanup curl -X GET "http://localhost/runCronJob?cronJobID=f5ac21ba-5672-43cd-855f-b57f560f50dg"
# you might need to run this one about 5 times to test the creation of products in newly added admin units, because especially on DEV many concepts need to be linked to the new besturen. Otherwise, let the cron job do its work and in a few hours it should be ready!
# the last query takes a little while to execute, but it should come through without timeouts
```

### Initialise your local database

This is an optional step. If you trust your machine is powerful enough, you can move on (this step should only be done once).
First start virtuoso and let it setup itself:

```
docker compose up virtuoso
```

Wait for the following logs:

```
HTTP/WebDAV server online at 8890
Server online at 1111 (pid 1)
```

Stop the service (usually through `ctrl+c`) and then run the migrations service:

```
docker compose up migrations
```

This will take a while; you may choose to monitor the migrations service in a separate terminal to and wait for the overview of all migrations to appear: `docker compose logs -f --tail=200 migrations`. When finished, it should look similar to this:

```
[2023-04-07 20:13:15] INFO  WEBrick 1.4.2
[2023-04-07 20:13:15] INFO  ruby 2.5.1 (2018-03-29) [x86_64-linux]
== Sinatra (v1.4.8) has taken the stage on 80 for production with backup from WEBrick
[2023-04-07 20:13:15] INFO  WEBrick::HTTPServer#start: pid=13 port=80
```

At this point, after booting the your local stack, you should be able to access the `/mock-login` path and see the available administrative units (*nl. bestuurseenheden*). After logging in and clicking on `Product of dienst toevoegen`, you will notice the following message: *Er werden geen producten of diensten gevonden*. In order to ingest concepts from IPDC, you need to trigger the `ldes-consumer-conceptsnapshot-ipdc` service, which is set to run at 00:00 UTC time on a daily basis. Do note that you need to be mindful of the `UTC vs Local Time` and `Summer vs Winter Time` differences:

* A cron pattern of **"20 17 * * *"** runs at 17:20 UTC time every day
    - During *Summer Time*: Runs at 19:20 Brussels Time (UTC+2)
    - During *Winter Time*: Runs at 18:20 Brussels Time (UTC+1)

You can force-trigger the service to run by overriding the `CRON_PATTERN` in your `docker-compose.override.yml` file; [crontab guru](https://crontab.guru/) is a nice playground to explore changing the pattern, and it houses a dedicated [examples section](https://crontab.guru/examples.html) where you can view the different options.

NOTE: for environment variables setup, ask a developer for the necessary keys.

After changing the cron pattern, run `docker compose up -d` if the stack is offline or `docker compose up -d ldes-consumer-conceptsnapshot-ipdc` if the stack is already running in order to let the consumer service pick up this new change. Once the cron pattern is triggered, you can see the consumer pulling in the concepts from the IPDC TNI environment:

```
[EventStream] info: GET https://ipdc.tni-vlaanderen.be/doc/conceptsnapshot?pageNumber=5
[EventStream] info: 200 https://ipdc.tni-vlaanderen.be/doc/conceptsnapshot?pageNumber=7 (42458) ms
```

The entire process takes between 30-60 minutes; you can confirm the job is done when no new logs are printed (the service itself does not log the end of the consumption process). At this stage, you can repeat the `/mock-login` flow again and click on `Product of dienst toevoegen`, where you will see the loaded IPDC TNI concepts.

### Alternative: initialise local database with TEST data

:warning: This is a quick but dirty way to add data into a database. Although it usually works well enough for local development setups, it should never be used in other environments. Consult the docker-virtuoso [README](https://github.com/redpencilio/docker-virtuoso/blob/master/README.md#L104) for proper ways to load data into virtuoso.

Alternatively you can initialise your local development setup with data from the TEST environment. This has the advantage that it is already properly populated with product instances and other relevant data. This does requires you have ssh access to the server with the TEST environment.

```shell
cd /path/to/your/local/app-lpdc-digitaal-loket

# If the stack is running, bring it down first
docker compose down

# Remove any current database folder
rm -r data/db

# sync the data from the test environment
rsync -e ssh -avz -P root@lpdc-dev.s.redhost.be:/data/app-lpdc-digitaal-loket-test/data/db data/

# Start virtuoso and the migrations service
docker compose up -d virtuoso migrations

# When the migrations have run successfully, start the rest of the stack
docker compose up -d
```

### Normal start

This should be your go-to way of starting the stack:

```
docker compose up -d # or "docker compose up" if you do not want to run it in the background
```

Always double check the status of the migrations `docker compose logs -f --tail=200 migrations` and wait for everything to boot to ensure clean caches.

Once the migrations have run, you can start developing your application by connecting the ember frontend application to this backend. See <https://github.com/lblod/frontend-lpdc> for more information on development with the ember application.

In case your work only involves changes in the backend, you can use the included `frontend-lpdc` image which is exposed by the `identifier` on port 90 in `docker-compose.dev.yml` without having to run the frontend separately on your local machine. You can access it by going to `http://localhost:90/mock-login`.


LPDC relies on an external service[^1] to verify the validity of addresses inputted in the frontend. This service requires an API key to be provided for it to reply correctly. Otherwise you can encounter error messages in the frontend when handling address data. In your browser's developer console such errors will show up as `500` errors on requests for the `lpdc-management/address/...` route. You can configure LPDC's management service with a correct API key to prevent such errors, by adding something like the following to your `docker-compose.override.yml` file:

```
lpdc-management:
  environment:
    ADRESSEN_REGISTER_API_KEY: "REPLACE_BY_A_VALID_API_KEY"
```

The `docker-compose.override.yml` files in the different server environments for LPDC contain usable keys.

## Running the regular setup

```
docker compose up -d
```

The stack is built starting from [mu-project](https://github.com/mu-semtech/mu-project).

OpenAPI documentation can be generated using [cl-resources-openapi-generator](https://github.com/mu-semtech/cl-resources-openapi-generator).

## Additional steps when running on mac arm64

Build all arm64 images using script
```shell
cd tools
./build-arm-images.sh
```

On mac arm64, create dockerfile with name `docker-compose.override.yml`. See [an example docker-compose.override-arm64.yml](docker-overrides/docker-compose.override-arm64.yml) for an example; don't forget to replace api keys templates.

## Running tests

A test container is provided. It creates a new docker project called app-lpdc-digitaal-loket-tests, using a separate environment from the development container.
It serves as an end-to-end test suite for the app-lpdc-digitaal-loket, stubbing any dependencies outside the bounded context (e.g. ipdc).

You can either run all tests against 'latest' images built on dockerhub, or in a development mode (which uses your local sources - so don't forget to update to correct branch from this project and all dependent projects).

### Prerequisites when running on mac arm64

Build all arm64 images using script
```shell
cd tools
./build-arm-images.sh
```

Create Dockerfile in tests folder with name `docker-compose.tests.latest.override.yml`.
See [contents for mac arm64](docker-overrides/docker-compose.tests.latest.override-arm64.yml) for an example; don't forget to replace api keys templates..

Create Dockerfile in tests folder with name `docker-compose.tests.development.override.yml`.
See [contents for mac arm64](docker-overrides/docker-compose.tests.development.override-arm64.yml) for an example; don't forget to replace api keys templates..

### Prerequisites when not running on mac arm64

Create a Dockerfile in tests folder with name `docker-compose.tests.latest.override.yml` and following content; don't forget to replace api keys templates.

```dockerfile
services:
  lpdc-management:
    environment:
      ADRESSEN_REGISTER_API_KEY: <ADRESSEN_REGISTER_API_KEY>

```

Create Dockerfile in tests folder with name `docker-compose.tests.development.override.yml` and following content; don't forget to replace api keys templates.

```dockerfile
services:
  lpdc-management:
    environment:
      ADRESSEN_REGISTER_API_KEY: <ADRESSEN_REGISTER_API_KEY>

```

### Running all tests against a local development version

A script is provided to start the docker containers for the tests in development mode. This will navigate use the local sources of the lpdc-management-service project and start a container in node development mode.

```shell
cd tests
./run-development.sh
```

Clear all test data before running:
```shell
cd tests
./run-development.sh --clear-test-data
```

Run tests by running
```shell
cd tests
npm run tests
```

### Running all tests against latest

A script is provided to serve as a no-brainer to configure the container and run all tests against stable latest versions of lpdc-management, etc.

```shell
cd tests
./run-latest.sh
```

#### All steps explained for running all tests against latest

You can start docker environment for running tests with the with following command:

```shell
cd tests
docker compose -f ./docker-compose.tests.yml -f ./docker-compose.tests.latest.yml -f ./docker-compose.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests up -d
```

This includes:
- A virtuoso database is available on port 8896 (instead of standard port 8890), and has its data stored in the ./data-test folder
- An identifier / dispatcher endpoint available on port 96 (instead of standard port 90)

Viewing logs :
```shell
cd tests
docker compose -p app-lpdc-digitaal-loket-tests logs
```

Running the tests:
```shell
cd tests
npm run tests
```

Stopping the docker container for tests:
```shell
cd tests
docker compose -f ./docker-compose.tests.yml -f ./docker-compose.tests.latest.yml -f ./docker-compose.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests down
```

Refreshing the latest docker containers (update the latest versions)
```shell
cd tests
docker compose -f ./docker-compose.tests.yml -f ./docker-compose.tests.latest.yml -f ./docker-compose.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests pull
```

_Note_: the test container keeps it database under the folder /tests/data-tests. It is reused over test runs. It contains the migrated data related to bestuurseenheden, personen, etc. If you want to have a very clean test run, stop docker, delete this folder, and restart test container.


[^1]: https://api.basisregisters.vlaanderen.be
