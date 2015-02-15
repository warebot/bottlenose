# bottlenose
Simple NTP Service

[![Build Status](https://travis-ci.org/warebot/bottlenose.svg?branch=master)](https://travis-ci.org/warebot/bottlenose)

#### About
This project demonstrates the functionality of keepalive messages in a producer-consumer environment. Consumers register with the producer via akka messaging in order to start receiving Time messages. The producer will poll on a specified interval to begin housekeeping, and remove any consumers that have not sent keepalive messages within the specified interval
#### Requirements
- nix environment
- node >= v0.10.33

#### Installation and Usage
    Check out code
    cd [cloned directory]
    run "node app.js"
