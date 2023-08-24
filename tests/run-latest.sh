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
  rm -rf data-tests.
  rm -rf test-results.
fi

npm install
docker compose -f ./docker-compose.standalone.tests.yml -f ./docker-compose.standalone.tests.latest.yml -f ./docker-compose.standalone.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests down
docker compose -f ./docker-compose.standalone.tests.yml -f ./docker-compose.standalone.tests.latest.yml -f ./docker-compose.standalone.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests pull
docker compose -f ./docker-compose.standalone.tests.yml -f ./docker-compose.standalone.tests.latest.yml -f ./docker-compose.standalone.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests up -d
npm run test
docker compose -f ./docker-compose.standalone.tests.yml -f ./docker-compose.standalone.tests.latest.yml -f ./docker-compose.standalone.tests.latest.override.yml -p app-lpdc-digitaal-loket-tests stop
