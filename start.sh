#!/bin/bash
_term(){
  echo
  echo "Server shutting down"
  pkill node
  pkill vlc
  rm tmp/* &>/dev/null
  echo "Cleared"
}

trap _term SIGINT SIGTERM

echo "Starting"
node main
