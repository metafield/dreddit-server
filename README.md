# Get This Stuff Working

`yarn watch`, `yarn run dev` to spin up a dev server

If using dockerized postgresql (can use this guide https://docs.docker.com/engine/examples/postgresql_service/) be sure to run `docker run --rm -P --name pg_test eg_postgresql` if the service is down.

Since postgres is removed (--rm) on contianer shutdown be sure to recreate the `dreddit` database. TODO: automate this

# The Flow

### install:

- express, apollo-server-express
- type-graphql with reflect-metadata
- an orm such as mikro or typeORM
- pg or other database
- argon2 for hashing

### Basic Setup:

- `tsc -watch` and nodemon scripts

### ORM Setup:

- spin up postgres with docker
- make a new database for the project
- create entities with constraints
- make sure the orm config is getting the entities
- mikroORM: make sure migration.up is in the code (to create migrations from config)
- run migrations

### GraphQL setup

- create a new express app
- set up a resolver with type-graphql
- set up an apolloServer passing in resolvers
- apply the express server as middleware to the apollo server
- run `.listen` on the express app
- pass required functionality such as the ORM into the context

### Adding Main Functionality:

- Create an entity if it needs one
- Make sure to pass the entity into the ORM config/init and the migration is run.
- Create a resolver with type-graphql for the entity and include it in the apollo server resolvers config.
- Create the logic for the feature and then test using graphQL playground.
- Write unit tests for the feature if you did not already.
