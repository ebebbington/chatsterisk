#!/bin/bash

if [ "$MAKE_BUILD" == "true" ]
then
  make build
fi
make start
