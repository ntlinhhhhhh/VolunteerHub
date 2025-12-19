#!/bin/sh

# Chờ nhiều host:port trước khi chạy app
for hp in "volunteer-mongo:27017" "rabbitmq:5672"
do
  host=$(echo $hp | cut -d: -f1)
  port=$(echo $hp | cut -d: -f2)
  while ! nc -z $host $port; do
    echo "Waiting for $host:$port..."
    sleep 2
  done
done

# Chạy lệnh Node app
exec "$@"
