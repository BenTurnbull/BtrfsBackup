#!/usr/bin/env bash

readonly LOG="testLog"
readonly server_address=localhost
readonly SESSION_PORT=50027

info() {
  date_time=$(date +%Y-%m-%dT%H:%M:%S:%3N)
  printf "\e[1;32m[${date_time}]: $@ \e[0m\n" | tee >> ${LOG}

  if [[ -e /proc/$$/fd/3 ]]; then
    echo "log-event:INFO:[${date_time}]: $@" >&3
    read -t 0.1 token <&3
    echo "response from server: ${token}"
  fi
}

main() {

  if [[ -e ${LOG} ]]; then
    rm -f ${LOG}
  fi

  info "connecting to server on ${server_address}:${SESSION_PORT}"
  exec 3<>/dev/tcp/${server_address}/${SESSION_PORT}
  info "connected to server"

  info "sending custom log event"
  info "$@"
  info "custom log event sent"
  info "1"
  info "2"
  info "3"
  info "4"
  info "5"
  info "6"
  info "6"
  info "6"
  info "7"
  info "8"
  info "9"
  info "10"

  # this prevents premature closing of the connection
  while [ $? -eq 0 ]
  do
    read -t 1 token <&3
  done

  info "closing connection to server"
  exec 3<&-
  exec 3>&-
  info "connection closed"
}

main "$@"