#bin/sh
set -e

host="$1"
shift

until nc -z "$host" 27017; do
  echo "Waiting for MongoDB at $host..."
  sleep 2
done

exec "$@"
