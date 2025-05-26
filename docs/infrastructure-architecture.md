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
- In the config/dispatcher/dispatcher.ex the _mock login is disabled on the machine itself_. We don't want unlimited access.
```diff --git a/config/dispatcher/dispatcher.ex b/config/dispatcher/dispatcher.ex
index c0b05a6..8d46f5b 100644
--- a/config/dispatcher/dispatcher.ex
+++ b/config/dispatcher/dispatcher.ex
@@ -26,9 +26,9 @@ defmodule Dispatcher do
     forward conn, path, "http://cache/bestuurseenheid-classificatie-codes/"
   end
 
-  match "/mock/sessions/*path" do
-    forward conn, path, "http://mocklogin/sessions/"
-  end
+ # match "/mock/sessions/*path" do
+ #   forward conn, path, "http://mocklogin/sessions/"
+ # end
   match "/sessions/*path" do
     forward conn, path, "http://login/sessions/"
   end
```
- To still enable **access for the lpdc test user**, an additional _basic authentication scheme is implemented_
  - /config/basic-auth/app.conf defines the config
  - In hidden file /config/basic-auth/.htpasswd , a list of username/hashed passwords is stored
  - in docker-overrides/acc.override.yml you will find _extra containers_:
    - controle (basic auth enabled)
    - controle-identifier
    - controle-dispatcher
    - mocklogin
  - So, upon installing the initial and **for each new version**, do following steps,
    - Ensure to **copy the /config/dispatcher/dispatcher.ex** (without the commented /mock/sessions) to /config/controle-dispatcher/dispatcher.ex. .
    - **Merge the /config/dispatcher/dispatcher.ex** change of the /mock/sessions with the latest version of this file.
    - **Update in the docker-compose-override.yml** manually the frontend version (controle container), identifier version (controle-identifier container) and dispatcher version (controle-dispatcher) to the one of this release.
- URLS
  - ACM/IDM login url: https://acc.lpdc-dev.s.redhost.be/ , or https://acc.lpdc.lokaalbestuur.lblod.info/
  - dashboard url: https://dashboard.acc.lpdc.lokaalbestuur.lblod.info
  - controle url: https://acc.controle.lpdc.lpdc-dev.s.redhost.be/mock-login

# PROD

Same config as [acc](#acc). 

- URLS
  - ACM/IDM login url: https://lpdc.lokaalbestuur.vlaanderen.be
  - dashboard url : https://dashboard.lpdc.lokaalbestuur.vlaanderen.be
  - controle url: https://controle.lpdc.lpdc-prod.s.redhost.be/mock-login , or https://controle.prod.lpdc.lblod.info/mock-login
