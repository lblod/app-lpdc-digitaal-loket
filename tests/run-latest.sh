#!/bin/bash

if [ "$1" = "--help" ]
then
  echo "Refreshes docker test container and runs all latest tests".
  exit
fi

refresh_latest_containers() {
  echo "Stopping and removing containers"
  docker compose -f ./docker-compose.tests.yml -f ./docker-compose.tests.latest.yml -f ./docker-compose.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests stop
  docker compose -f ./docker-compose.tests.yml -f ./docker-compose.tests.latest.yml -f ./docker-compose.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests down

  echo "Clearing test data"
  rm -rf data-tests
  rm -rf test-results

  echo "Building and starting latest containers"
  npm install
  docker build -t ipdc-stub:latest ./ipdc-stub
  docker compose -f ./docker-compose.tests.yml -f ./docker-compose.tests.latest.yml -f ./docker-compose.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests pull
  docker compose -f ./docker-compose.tests.yml -f ./docker-compose.tests.latest.yml -f ./docker-compose.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests up -d
}

refresh_latest_containers

echo "Running playwright api tests"
npx playwright test --project=api
code=$?
echo "playwright api tests exit code = $code"

if [ "$code" -eq 0 ]; then

  refresh_latest_containers
  echo "Waiting..."
  sleep 120 ## wait for ldes-consumer to finish

  echo "Running playwright e2e tests"
  npx playwright test --project=e2e
  code=$?
  echo "playwright e2e tests exit code = $code"
else
  echo "Not running playwright e2e tests"
fi

echo "Stopping containers"
docker compose -f ./docker-compose.tests.yml -f ./docker-compose.tests.latest.yml -f ./docker-compose.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests stop

exit $code