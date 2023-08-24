# What's included?

This repository has two setups:

* *docker-compose.yml*: This provides you with the backend components; there is an included frontend application which you can publish using a separate proxy (we tend to put a letsencrypt proxy in front).
* *docker-compose.dev.yml*: Provides changes for a good frontend development setup.
    - publishes the backend services on port 90 directly, so you can run `ember serve --proxy http://localhost:90/` when developing the frontend apps natively.
    - publishes the database instance on port 8890, so you can easily see what content is stored in the base triplestore.
    - provides a mock-login backend service, so you don't need the ACM/IDM integration.

# Running and maintaining

General information on running and maintaining an installation

## Running your setup

### System requirements

You'll need a beefy machine, with at least 16 GB of RAM.

#### Running the dev setup

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
* A `docker-compose.override.yml` file with following content:

```
version: "3.7"
```

* And an `.env` file with following content:

```
COMPOSE_FILE=docker-compose.yml:docker-compose.dev.yml:docker-compose.override.yml
```

#### If you are starting for the first time:

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

At this point, you should be able to access the `/mock-login` path and see the available `bestuurseenheden`. After logging in and clicking on `Product of dienst toevoegen`, you will notice the following message: *Er werden geen producten of diensten gevonden*. In order to ingest concepts from IPDC, you need to trigger the `lpdc-ldes-consumer` service, which is set to run at 00:00 UTC time on a daily basis. Do note that you need to be mindful of the `UTC vs Local Time` and `Summer vs Winter Time` differences:

* A cron pattern of **"20 17 * * *"** runs at 17:20 UTC time every day
    - During *Summer Time*: Runs at 19:20 Brussels Time (UTC+2)
    - During *Winter Time*: Runs at 18:20 Brussels Time (UTC+1)

You can force-trigger the service to run by overriding the `CRON_PATTERN` in your `docker-compose.override.yml` file; [crontab guru](https://crontab.guru/) is a nice playground to explore changing the pattern, and it houses a dedicated [examples section](https://crontab.guru/examples.html) where you can view the different options.

After changing the cron pattern, run `docker compose up -d` if the stack is offline or `docker compose up -d lpdc-ldes-consumer` if the stack is already running in order to let the consumer service pick up this new change. Once the cron pattern is triggered, you can see the consumer pulling in the concepts from the IPDC TNI environment:

```
[EventStream] info: GET https://ipdc.tni-vlaanderen.be/doc/conceptsnapshot?pageNumber=5
[EventStream] info: 200 https://ipdc.tni-vlaanderen.be/doc/conceptsnapshot?pageNumber=7 (42458) ms
```

The entire process takes between 30-60 minutes; you can confirm the job is done when no new logs are printed (the service itself does not log the end of the consumption process). At this stage, you can repeat the `/mock-login` flow again and click on `Product of dienst toevoegen`, where you will see the loaded IPDC TNI concepts.

### Normal start

This should be your go-to way of starting the stack:

```
docker compose up # or "docker compose up -d" if you want to run it in the background
```

Always double check the status of the migrations `docker compose logs -f --tail=200 migrations` and wait for everything to boot to ensure clean caches.

Once the migrations have run, you can start developing your application by connecting the ember frontend application to this backend. See <https://github.com/lblod/frontend-lpdc> for more information on development with the ember application.

In case your work only involves changes in the backend, you can use the included `frontend-lpdc` image in order to interface with the frontend without having to run it separately on your local machine; you can do so by adding the following to your `docker-compose.override.yml` file:

```
lpdc:
  ports:
    - 4205:80
```

You can then access the frontend by going to `http://localhost:4205/mock-login` (4205 can be changed to any other unused port on your system).

### Running the regular setup

```
docker compose up -d
```

The stack is built starting from [mu-project](https://github.com/mu-semtech/mu-project).

OpenAPI documentation can be generated using [cl-resources-openapi-generator](https://github.com/mu-semtech/cl-resources-openapi-generator).

## Upgrading your setup

Once installed, you may desire to upgrade your current setup to follow development of the main stack. The following example describes how to do this easily for both the demo setup, as well as for the development one.

### Upgrading the development setup

For the dev setup, we assume you'll pull more often and will most likely clear the database separately:

```
# This assumes the .env file has been set

# Bring the stack down
docker compose down

# Pull in the changes
git pull

# Launch the stack
docker compose up -d
```

As with the initial setup, we wait for everything to boot to ensure clean caches. You may choose to monitor the migrations service in a separate terminal to and wait for the overview of all migrations to appear: `docker compose logs -f --tail=200 migrations`.

Once the migrations have run, you can go on with your current setup.

### Backing up your local database

One helpful way to ease your development process is to back up your local database (the `/data/db/` folder) after migrations are completed, and concepts are pulled through the `lpdc-ldes-consumer` service.

If your local data reaches a stage you deem to be tainted and you want to start anew, you can do the following:

```
# Bring down the running stack
docker compose down

# Remove existing database folder
rm -rf data/db

# Copy backed-up database folder
cp -r [location-of-backed-up-db-folder] data/

# Bring the stack back up again
docker compose up
```

This process will restore your local data to the state in which they were backed up in.

## Cleaning the database

At some point, you may want to clean the database and make sure it's in a pristine state.

```
# This assumes the .env file has been set

# Bring down the current setup
docker compose down

# Keep only required database files
rm -Rf data/db
git checkout data/db

# Bring the stack back up
docker compose up -d
```

_Notes_:
- Virtuoso can take a while to execute its first run; the database will be inaccessible in the meantime. Make sure to also wait for the migrations to run.
- `docker compose` (bundled with the new docker engine) is used in the README instead of the old `docker-compose` command.


## Running tests

A test container is provided. It creates a new docker project called app-lpdc-digitaal-loket-tests, using a separate environment from the development container.
It serves as an end-to-end test suite for the app-lpdc-digitaal-loket, stubbing any dependencies outside the bounded context (e.g. ipdc).

You can either run all tests against 'latest', or in a development mode.

### Prerequisites when running on mac arm64

Create Dockerfile in tests folder with name `docker-compose.standalone.tests.latest.override.yml` and following content when running mac arm64
```dockerfile
version: "3.7"

services:

  resource:
    image: semtech/mu-cl-resources:feature-arm64-builds
```

Create Dockerfile in tests folder with name `docker-compose.standalone.tests.development.override.yml` and following content when running mac arm64
```dockerfile
version: "3.7"

services:

  resource:
    image: semtech/mu-cl-resources:feature-arm64-builds

  lpdc-management:
    image: mu-javascript-template:feature-node-18-arm64-build
```

Build a local arm64 image from https://github.com/gauquiebart/mu-javascript-template/tree/feature/node-18-decrease-development-reload-time . (temporary from this repo till PR is merged into main mu-javascript-template ) 

```shell
docker build -t mu-javascript-template:feature-node-18-arm64-build .
```

### Prerequisites when not running on mac arm64

Create Dockerfile in tests folder with name `docker-compose.standalone.tests.latest.override.yml` and following content

```dockerfile
version: "3.7"

```

Create Dockerfile in tests folder with name `docker-compose.standalone.tests.development.override.yml` and following content

```dockerfile
version: "3.7"

```

### Running all tests against a local development version

A script is provided to start the docker containers for the tests in development mode. This will navigate use the local sources of the lpdc-management-service project and start a container in node development mode.

```shell
cd tests
./run-development.sh
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
docker compose -f ./docker-compose.standalone.tests.yml -f ./docker-compose.standalone.tests.latest.yml -f ./docker-compose.standalone.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests up -d
```

This includes:
- A virtuoso database is available on port 8896 (instead of standard port 8890), and has its data stored in the ./data-test folder
- An identifier / dispatcher endpoint available on port 96 (instead of standard port 90)
- Following containers have been disabled or are not included: lpdc, login, lpdc-publish and lpdc-ldes-consumer container (for now).

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
docker compose -f ./docker-compose.standalone.tests.yml -f ./docker-compose.standalone.tests.latest.yml -f ./docker-compose.standalone.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests down
```

Refreshing the latest docker containers (update the latest versions)
```shell
cd tests
docker compose -f ./docker-compose.standalone.tests.yml -f ./docker-compose.standalone.tests.latest.yml -f ./docker-compose.standalone.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests pull
```

_Note_: the test container keeps it database under the folder /tests/data-tests. It is reused over test runs. It contains the migrated data related to bestuurseenheden, personen, etc. If you want to have a very clean test run, stop docker, delete this folder, and restart test container.



