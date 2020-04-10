# MongoDB and Kafka Messages

## About this example

This example aims to demonstrate the place where event-sourcing is usually required: reducing a state from a set of events. Althogh the integration with message delivery is out of skope of this project and it is up to the user do descide how to integrate Osiris, I wanted to demonstrate how simpe it is to integrate and how it can work in a real ife solution.

## The Staks

The stack can be loaded with the `docker-comose` and consists of a Kafka cluster with Zookeeper and a MongoDB for storing the events.

## What does this example do?

Set up a kafka cluster to stream messages from a peoducer to a consumer (server) which then can show the state with a basic HTTP API.


## Running this example

Pre-requisites:
1. Docker + Docker-compose enabled
2. NodeJS
3. yarn (npm i -g yarn)

Running
1. Start the stack with `docker-compose up -d`
2. cd into './server
3. yarn install && yarn start
4. in a new terminal: cd into ./producer
5. yarn install && yarn start

