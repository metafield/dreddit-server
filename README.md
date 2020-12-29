`yarn watch`, `yarn run dev` to spin up a dev server

If using dockerized postgresql (can use this guide https://docs.docker.com/engine/examples/postgresql_service/) be sure to run `docker run --rm -P --name pg_test eg_postgresql` if the service is down.

Since postgres is removed (--rm) on contianer shutdown be sure to recreate the `dreddit` database. TODO: automate this
