#!/usr/bin/env bash

LOGFILE="connection.log"
connect() {
    #echo "connecting to server"
    exec 3<>/dev/tcp/localhost/1338

    echo "sending request"
    printf "stream:test.stream" >&3
    #printf "stream:test.stream" | nc localhost 1338

    read token <&3
    echo "response: $token"

    echo "sending payload"
    cat "testData" | tee >(sha1sum -b | awk '{ print $1 }' > hashValue) | nc localhost 1338 &>/dev/null
    cat "hashValue"

    echo "closing"
    exec 3<&-
    exec 3>&-

    exit 0
}

connect

