# DEV - TEST

Docker container technology is used. 

On the lpdc-dev.s.redhost.be three docker projects are created (dev, test, acc). 
There is one webserver, that based on the URL redirects traffic to correct docker project.

Environments:
- dev: https://dev.lpdc-dev.s.redhost.be/
- test: https://test.lpdc-dev.s.redhost.be/

Installation procedure (apply similar for dev, test)

**Clone app-lpdc-digitaal-loket**

```shell
ssh root@lpdc-dev.s.redhost.be  

cd /data

git clone https://github.com/lblod/app-lpdc-digitaal-loket.git app-lpdc-digitaal-loket-dev
```

**Checkout correct branch / tag**

```shell
git checkout development
```

**create docker-compose.override.yml:**

For [dev](docker-overrides/dev.override.yml), [test](docker-overrides/test.override.yml), [acc](docker-overrides/acc.override.yml).

_Note_: on dev, the latest versions of our lpdc containers are used.

_Note_: secrets are blanked.

**Create hidden .env file with contents:**

_Note:_: we don't use the docker-compose.dev.yml file ...
```dotenv
COMPOSE_FILE=docker-compose.yml:docker-compose.override.yml
```

**Bring docker container up**
```shell
drc up -d
```

# ACC

Contains a copy of production data.

Installation same as dev - test, with following (manual additions/changes):

- [docker compose override acc template](docker-overrides/acc.override.yml).
- URLS
  - ACM/IDM login url: https://acc.lpdc-dev.s.redhost.be/ , or https://acc.lpdc.lokaalbestuur.lblod.info/
  - dashboard url: https://dashboard.acc.lpdc.lokaalbestuur.lblod.info

# PROD

Same config as [acc](#acc). 

- URLS
  - ACM/IDM login url: https://lpdc.lokaalbestuur.vlaanderen.be
  - dashboard url : https://dashboard.lpdc.lokaalbestuur.vlaanderen.be
