# DEV - TST - ACC

Docker container technology is used. 

On the lpdc-dev.s.redhost.be three docker projects are created (dev, tst, acc). 
There is one webserver, that based on the URL redirects traffic to correct docker project.

Environments:
- dev: https://dev.lpdc-dev.s.redhost.be/
- tst: https://tst.lpdc-dev.s.redhost.be/
- acc: https://acc.lpdc-dev.s.redhost.be/

Installation procedure (apply similar for dev, tst and acc)

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

**create docker-compose-override.yml:**

_Notes_
- this 'template' overrides all containers to development containers, if you want to deploy an official released version, don't do this
- exposed ports
    - for the ports, on dev, we use for identifier, 90:80, virtuoso: 8890:8890, lpdc-management: 9229:9229,
    - for the ports, on tst, we use for identifier, 91:80, virtuoso: 8891:8890, lpdc-management: 9230:9229,
    - for the ports, on acc, we use for identifier, 92:80, virtuoso: 8892:8890, lpdc-management: 9231:9229,
- VIRTUAL_HOST "dev.lpdc-dev.s.redhost.be" becomes "tst.lpdc-dev.s.redhost.be", "acc.lpdc-dev.s.redhost.be"
- LETSENCRYPT_HOST: "dev.lpdc-dev.s.redhost.be" becomes "tst.lpdc-dev.s.redhost.be", "acc.lpdc-dev.s.redhost.be"

_dev environment docker-compose.override.yml_:
```yml
version: "3.7"

services:

  mocklogin:
    image: lblod/mock-login-service:0.4.0

  identifier:
    ports:
      - "90:80"

  virtuoso:
    ports:
      - "8890:8890"

  lpdc:
    image: lblod/frontend-lpdc:latest
    environment:
      VIRTUAL_HOST: "dev.lpdc-dev.s.redhost.be"
      LETSENCRYPT_HOST: "dev.lpdc-dev.s.redhost.be"
      LETSENCRYPT_EMAIL: "info@redpencil.io"
    networks:
      - proxy
      - default

  database:
    environment:
      LOG_OUTGOING_SPARQL_QUERIES : "true"

  lpdc-management:
    image: lblod/lpdc-management-service:development

  lpdc-publish:
    image: lblod/lpdc-publish-service:development
    environment:
      IPDC_JSON_ENDPOINT: <your endpoint here>
      IPDC_X_API_KEY: <and its api key>

  lpdc-ldes-consumer:
    environment:
      LDES_ENDPOINT_HEADER_X-API-KEY: <your api key here>

networks:
  proxy:
    external:
      name: letsencrypt_default
```

_tst environment docker-compose.override.yml:_
```yml
version: "3.7"

services:
  
  mocklogin:
    image: lblod/mock-login-service:0.4.0

  identifier:
    ports:
      - "91:80"
  
  virtuoso:
    ports:
      - "8891:8890"
  
  lpdc:
    image: lblod/frontend-lpdc:latest
    environment:
      VIRTUAL_HOST: "tst.lpdc-dev.s.redhost.be"
      LETSENCRYPT_HOST: "tst.lpdc-dev.s.redhost.be"
      LETSENCRYPT_EMAIL: "info@redpencil.io"
    networks:
      - proxy
      - default

  database:
    environment:
      LOG_OUTGOING_SPARQL_QUERIES : "true"

  lpdc-management:
    image: lblod/lpdc-management-service:development
    ports:
      - "9230:9229"

  lpdc-publish:
    image: lblod/lpdc-publish-service:development
    environment:
      IPDC_JSON_ENDPOINT: <your endpoint here>
      IPDC_X_API_KEY: <and its api key>

  lpdc-ldes-consumer:
    environment:
      LDES_ENDPOINT_HEADER_X-API-KEY: <your api key here>

networks:
  proxy:
    external:
      name: letsencrypt_default
```

_acc environment docker-compose.override.yml:_
```yml
version: "3.7"

services:

  mocklogin:
    image: lblod/mock-login-service:0.4.0

  identifier:
    ports:
      - "92:80"

  virtuoso:
    ports:
      - "8892:8890"

  lpdc:
    image: lblod/frontend-lpdc:latest
    environment:
      VIRTUAL_HOST: "acc.lpdc-dev.s.redhost.be"
      LETSENCRYPT_HOST: "acc.lpdc-dev.s.redhost.be"
      LETSENCRYPT_EMAIL: "info@redpencil.io"
    networks:
      - proxy
      - default

  lpdc-management:
    image: lblod/lpdc-management-service:development

  lpdc-publish:
    image: lblod/lpdc-publish-service:development
    environment:
      IPDC_JSON_ENDPOINT: <your endpoint here>
      IPDC_X_API_KEY: <and its api key>

  lpdc-ldes-consumer:
    environment:
      LDES_ENDPOINT_HEADER_X-API-KEY: <your api key here>
      
networks:
  proxy:
    external:
      name: letsencrypt_default
```


**Create hidden .env file with contents:**

_Note:_: we don't use the docker-compose.dev.yml file ...
```dotenv
COMPOSE_FILE=docker-compose.yml:docker-compose.override.yml
```

**Bring docker container up**
```shell
drc up -d
```

**Verify ports correctly overridden:**
```shell
docker ps
```



# PRD

Physical server still to install.
