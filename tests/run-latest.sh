#!/bin/bash

if [ "$1" = "--help" ]
then
  echo "Refreshes docker test container and runs all latest tests".
  echo "You can use --clear-test-data to clear the test data folder before running".
  exit
fi

if [ "$1" = "--clear-test-data" ]
then
  echo "Clearing test data".
  rm -rf data-tests
  rm -rf test-results
fi

npm install
docker build -t ipdc-stub:latest ./ipdc-stub
docker compose -f ./docker-compose.tests.yml -f ./docker-compose.tests.latest.yml -f ./docker-compose.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests down
docker compose -f ./docker-compose.tests.yml -f ./docker-compose.tests.latest.yml -f ./docker-compose.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests pull
docker compose -f ./docker-compose.tests.yml -f ./docker-compose.tests.latest.yml -f ./docker-compose.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests up -d
npm run test
docker compose -f ./docker-compose.tests.yml -f ./docker-compose.tests.latest.yml -f ./docker-compose.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests stop
