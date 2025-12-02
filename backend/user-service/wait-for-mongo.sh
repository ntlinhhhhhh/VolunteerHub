#!/bin/sh
set -e

# Wait for Mongo
host="$1"
shift
until nc -z "$host" 27017; do
  echo "Waiting for MongoDB at $host..."
  sleep 2
done
echo "MongoDB is ready!"

# Wait for RabbitMQ
host="$1"
port="$2"
shift 2
until nc -z "$host" "$port"; do
  echo "Waiting for RabbitMQ at $host:$port..."
  sleep 2
done
echo "RabbitMQ is ready!"

exec "$@"
