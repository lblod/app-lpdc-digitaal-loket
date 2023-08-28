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
docker build -t semtech/mu-javascript-template:feature-node-18-arm64-build .
cd ..

rm -rf mu-javascript-template
git clone https://github.com/mu-semtech/mu-javascript-template.git
cd mu-javascript-template || exit
git checkout tags/v1.3.5
docker build -t semtech/mu-javascript-template:1.3.5-arm64-build .
cd ..

rm -rf mu-javascript-template
git clone https://github.com/mu-semtech/mu-javascript-template.git
cd mu-javascript-template || exit
git checkout feature/node-16-support
docker build -t semtech/mu-javascript-template:feature-node-16-support-arm64-build .
cd ..

#ruby
git clone https://github.com/erikap/docker-ruby-sinatra.git
cd docker-ruby-sinatra || exit
git checkout tags/v1.0.0
docker build -t erikap/ruby-sinatra:1.0.0-arm64-build .
cd ..
rm -rf docker-ruby-sinatra

git clone https://github.com/erikap/docker-ruby-sinatra.git
cd docker-ruby-sinatra || exit
git checkout ruby2.3-latest
docker build -t erikap/ruby-sinatra:ruby2.3-latest-arm64-build .
cd ..

git clone https://github.com/mu-semtech/mu-ruby-template.git
cd mu-ruby-template || exit
git checkout tags/v2.11.0-ruby2.5
sed -i '' -e 's/ruby-sinatra:1.0.0/ruby-sinatra:1.0.0-arm64-build/g' Dockerfile
docker build -t semtech/mu-ruby-template:2.11.0-ruby2.5-arm64-build .
cd ..
rm -rf mu-ruby-template

git clone https://github.com/mu-semtech/mu-ruby-template.git
cd mu-ruby-template || exit
git checkout tags/v2.6.0-ruby2.3
sed -i '' -e 's/ruby-sinatra:ruby2.3-latest/ruby-sinatra:ruby2.3-latest-arm64-build/g' Dockerfile
docker build -t semtech/mu-ruby-template:2.6.0-ruby2.3-arm64-build .
cd ..

#elixir
git clone https://github.com/madnificent/elixir-server-docker
cd elixir-server-docker || exit
git checkout tags/v1.9
docker build -t madnificent/elixir-server:1.9-arm64-build .
cd ..
rm -rf elixir-server-docker

git clone https://github.com/madnificent/elixir-server-docker
cd elixir-server-docker || exit
git checkout tags/v1.10.0
docker build -t madnificent/elixir-server:1.10.0-arm64-build .
cd ..

#services
git clone https://github.com/mu-semtech/mu-authorization.git
cd mu-authorization || exit
git checkout feature/service-roam-r1
sed -i '' -e 's/elixir-server:1.10.0/elixir-server:1.10.0-arm64-build/g' Dockerfile
docker build -t semtech/mu-authorization:feature-service-roam-r1.1-arm64-build .
cd ..

git clone https://github.com/mu-semtech/mu-cache.git
cd mu-cache || exit
git checkout tags/v2.0.2
docker build -t semtech/mu-cache:2.0.2-arm64-build .
cd ..

git clone https://github.com/mu-semtech/mu-migrations-service.git
cd mu-migrations-service || exit
git checkout tags/v0.8.0
sed -i '' -e 's/mu-ruby-template:2.11.0-ruby2.5/mu-ruby-template:2.11.0-ruby2.5-arm64-build/g' Dockerfile
docker build -t semtech/mu-migrations-service:0.8.0-arm64-build .
cd ..

git clone https://github.com/lblod/mock-login-service.git
cd mock-login-service || exit
git checkout tags/v0.4.0
sed -i '' -e 's/mu-ruby-template:2.6.0-ruby2.3/mu-ruby-template:2.6.0-ruby2.3-arm64-build/g' Dockerfile
docker build -t lblod/mock-login-service:0.4.0-arm64-build .
cd ..

git clone https://github.com/mu-semtech/mu-dispatcher.git
cd mu-dispatcher || exit
git checkout tags/v2.1.0-beta.2
sed -i '' -e 's/elixir-server:1.9/elixir-server:1.9-arm64-build/g' Dockerfile
docker build -t semtech/mu-dispatcher:2.1.0-beta.2-arm64-build .
cd ..

git clone https://github.com/mu-semtech/mu-identifier.git
cd mu-identifier || exit
git checkout tags/v1.10.0
sed -i '' -e 's/elixir-server:1.9/elixir-server:1.9-arm64-build/g' Dockerfile
docker build -t semtech/mu-identifier:1.10.0-arm64-build .
cd ..

git clone https://github.com/cecemel/delta-notifier.git
cd delta-notifier || exit
sed -i '' -e 's/mu-javascript-template/mu-javascript-template:1.3.5-arm64-build/g' Dockerfile
docker build -t cecemel/delta-notifier:0.2.0-beta.3-arm64-build .
cd ..

git clone https://github.com/redpencilio/ldes-consumer-service
cd ldes-consumer-service || exit
git checkout tags/v0.7.1
sed -i '' -e 's/mu-javascript-template:feature-node-16-support/mu-javascript-template:feature-node-16-support-arm64-build/g' Dockerfile
docker build -t redpencil/ldes-consumer:0.7.1-arm64-build .
cd ..

