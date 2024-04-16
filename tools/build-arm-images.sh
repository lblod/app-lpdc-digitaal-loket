#!/bin/bash

trap 'echo "# $BASH_COMMAND"' DEBUG

cd /tmp || exit
rm -rf arm64-builds
mkdir arm64-builds
cd arm64-builds || exit

#javascript
git clone https://github.com/gauquiebart/mu-javascript-template
cd mu-javascript-template || exit
git checkout feature/node-18-decrease-development-reload-time
docker build --no-cache -t semtech/mu-javascript-template:feature-node-18-decrease-development-reload-time-arm64-build .
cd ..

rm -rf mu-javascript-template
git clone https://github.com/mu-semtech/mu-javascript-template.git
cd mu-javascript-template || exit
git checkout tags/v1.3.5
docker build --no-cache -t semtech/mu-javascript-template:1.3.5-arm64-build .
cd ..

rm -rf mu-javascript-template
git clone https://github.com/mu-semtech/mu-javascript-template.git
cd mu-javascript-template || exit
git checkout feature/node-16-support
docker build --no-cache -t semtech/mu-javascript-template:feature-node-16-support-arm64-build .
cd ..

rm -rf mu-javascript-template
git clone https://github.com/mu-semtech/mu-javascript-template.git
cd mu-javascript-template || exit
git checkout feature/node-18
docker build --no-cache -t semtech/mu-javascript-template:feature-node-18-arm64-build .
cd ..

rm -rf mu-javascript-template
git clone https://github.com/mu-semtech/mu-javascript-template.git
cd mu-javascript-template || exit
git checkout tags/v1.5.0-beta.3
docker build --no-cache -t semtech/mu-javascript-template:1.5.0-beta.3-arm64-build .
cd ..

#ruby
git clone https://github.com/erikap/docker-ruby-sinatra.git
cd docker-ruby-sinatra || exit
git checkout tags/v1.0.0
docker build --no-cache -t erikap/ruby-sinatra:1.0.0-arm64-build .
cd ..
rm -rf docker-ruby-sinatra

git clone https://github.com/erikap/docker-ruby-sinatra.git
cd docker-ruby-sinatra || exit
git checkout ruby2.3-latest
docker build --no-cache -t erikap/ruby-sinatra:ruby2.3-latest-arm64-build .
cd ..

git clone https://github.com/mu-semtech/mu-ruby-template.git
cd mu-ruby-template || exit
git checkout tags/v2.11.0-ruby2.5
sed -i '' -e 's/ruby-sinatra:1.0.0/ruby-sinatra:1.0.0-arm64-build/g' Dockerfile
docker build --no-cache -t semtech/mu-ruby-template:2.11.0-ruby2.5-arm64-build .
cd ..
rm -rf mu-ruby-template

git clone https://github.com/mu-semtech/mu-ruby-template.git
cd mu-ruby-template || exit
git checkout tags/v2.6.0-ruby2.3
sed -i '' -e 's/ruby-sinatra:ruby2.3-latest/ruby-sinatra:ruby2.3-latest-arm64-build/g' Dockerfile
docker build --no-cache -t semtech/mu-ruby-template:2.6.0-ruby2.3-arm64-build .
cd ..

#elixir
git clone https://github.com/madnificent/elixir-server-docker
cd elixir-server-docker || exit
git checkout tags/v1.9
docker build --no-cache -t madnificent/elixir-server:1.9-arm64-build .
cd ..
rm -rf elixir-server-docker

git clone https://github.com/madnificent/elixir-server-docker
cd elixir-server-docker || exit
git checkout tags/v1.10.0
docker build --no-cache -t madnificent/elixir-server:1.10.0-arm64-build .
cd ..

#services
git clone https://github.com/mu-semtech/mu-authorization.git
cd mu-authorization || exit
git checkout feature/service-roam-r1.1
sed -i '' -e 's/elixir-server:1.10.0/elixir-server:1.10.0-arm64-build/g' Dockerfile
docker build --no-cache -t semtech/mu-authorization:feature-service-roam-r1.1-arm64-build .
cd ..

git clone https://github.com/mu-semtech/mu-cache.git
cd mu-cache || exit
git checkout tags/v2.0.2
docker build --no-cache -t semtech/mu-cache:2.0.2-arm64-build .
cd ..

git clone https://github.com/mu-semtech/mu-migrations-service.git
cd mu-migrations-service || exit
git checkout tags/v0.8.0
sed -i '' -e 's/mu-ruby-template:2.11.0-ruby2.5/mu-ruby-template:2.11.0-ruby2.5-arm64-build/g' Dockerfile
docker build --no-cache -t semtech/mu-migrations-service:0.8.0-arm64-build .
cd ..

git clone https://github.com/lblod/mock-login-service.git
cd mock-login-service || exit
git checkout tags/v0.4.0
sed -i '' -e 's/mu-ruby-template:2.6.0-ruby2.3/mu-ruby-template:2.6.0-ruby2.3-arm64-build/g' Dockerfile
docker build --no-cache -t lblod/mock-login-service:0.4.0-arm64-build .
cd ..

git clone https://github.com/mu-semtech/mu-dispatcher.git
cd mu-dispatcher || exit
git checkout tags/v2.1.0-beta.2
sed -i '' -e 's/elixir-server:1.9/elixir-server:1.9-arm64-build/g' Dockerfile
docker build --no-cache -t semtech/mu-dispatcher:2.1.0-beta.2-arm64-build .
cd ..

git clone https://github.com/mu-semtech/mu-identifier.git
cd mu-identifier || exit
git checkout tags/v1.10.0
sed -i '' -e 's/elixir-server:1.9/elixir-server:1.9-arm64-build/g' Dockerfile
docker build --no-cache -t semtech/mu-identifier:1.10.0-arm64-build .
cd ..

git clone https://github.com/cecemel/delta-notifier.git
cd delta-notifier || exit
sed -i '' -e 's/mu-javascript-template/mu-javascript-template:1.3.5-arm64-build/g' Dockerfile
docker build --no-cache -t cecemel/delta-notifier:0.2.0-beta.3-arm64-build .
cd ..

git clone https://github.com/redpencilio/ldes-consumer-service
cd ldes-consumer-service || exit
git checkout tags/v0.7.1
sed -i '' -e 's/mu-javascript-template:feature-node-16-support/mu-javascript-template:feature-node-16-support-arm64-build/g' Dockerfile
docker build --no-cache -t redpencil/ldes-consumer:0.7.1-arm64-build .
cd ..

rm -rf ldes-consumer-service
git clone https://github.com/redpencilio/ldes-consumer-service
cd ldes-consumer-service || exit
git checkout tags/v0.8.0-rc1
sed -i '' -e 's/mu-javascript-template:feature-node-18/mu-javascript-template:feature-node-18-arm64-build/g' Dockerfile
docker build --no-cache -t redpencil/ldes-consumer:0.8.0-rc1-arm64-build .
cd ..

rm -rf ldes-consumer-service
git clone https://github.com/redpencilio/ldes-consumer-service
cd ldes-consumer-service || exit
git checkout feature/stability-improvements
docker build --no-cache -t redpencil/ldes-consumer:feature-stability-improvements-arm64-build .
cd ..

rm -rf ldes-consumer-service
git clone https://github.com/redpencilio/ldes-consumer-service
cd ldes-consumer-service || exit
git checkout tags/vfeature-stability-improvements-r1.0
docker build --no-cache -t redpencil/ldes-consumer:feature-stability-improvements-r1.0-arm64-build .
cd ..


git clone https://github.com/lblod/acmidm-login-service.git
cd acmidm-login-service || exit
git checkout tags/v0.9.2
sed -i '' -e 's/mu-javascript-template:1.5.0-beta.3/mu-javascript-template:1.5.0-beta.3-arm64-build/g' Dockerfile
docker build --no-cache -t lblod/acmidm-login-service:0.9.2-arm64-build .
cd ..

git clone https://github.com/cecemel/file-service.git
cd file-service || exit
git checkout tags/v3.3.0
sed -i '' -e 's/mu-ruby-template:2.11.0/mu-ruby-template:2.11.0-ruby2.5-arm64-build/g' Dockerfile
docker build --no-cache -t cecemel/file-service:3.3.0-arm64-build .
cd ..

git clone https://github.com/lblod/loket-report-generation-service.git
cd loket-report-generation-service || exit
git checkout tags/v0.6.3
sed -i '' -e 's/mu-javascript-template:1.6.0/mu-javascript-template:feature-node-16-support-arm64-build/g' Dockerfile
docker build --no-cache -t lblod/loket-report-generation-service:0.6.3-arm64-build .
cd ..

git clone https://github.com/madnificent/sbcl-quicklisp.git
cd sbcl-quicklisp || exit
git checkout tags/v2.3.0-20221107
docker build --no-cache -t madnificent/sbcl-quicklisp:2.3.0-20221107-arm64-build .
cd ..

git clone https://github.com/madnificent/lisp-webservice-docker.git
cd lisp-webservice-docker || exit
git checkout tags/v0.4.0
sed -i '' -e 's/sbcl-quicklisp:2.3.0-20221107/sbcl-quicklisp:2.3.0-20221107-arm64-build/g' Dockerfile
docker build --no-cache -t madnificent/lisp-webservice:0.4.0-arm64-build .
cd ..

git clone https://github.com/mu-semtech/mu-cl-resources.git
cd mu-cl-resources || exit
git checkout feature/supply-info-on-empty-included
sed -i '' -e 's/lisp-webservice:0.4.0/lisp-webservice:0.4.0-arm64-build/g' Dockerfile
git submodule init
git submodule update
docker build --no-cache -t semtech/mu-cl-resources:feature-supply-info-on-empty-included-arm64-build .
cd ..
