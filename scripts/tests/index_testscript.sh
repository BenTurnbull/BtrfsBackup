#!/usr/bin/env bash

list() {
  declare -a index=($(find *.stream 2>/dev/null))
  index_length=${#index[@]}
  echo "detected ${index_length} backups"

  for backup in "${index[@]}"
  do
  echo "${backup%.stream}"
  done
}

list

