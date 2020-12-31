# Get This Stuff Working

`yarn watch`, `yarn run dev` to spin up a dev server

If using dockerized postgresql (can use this guide https://docs.docker.com/engine/examples/postgresql_service/) be sure to run `docker run --rm -P --name pg_test eg_postgresql` if the service is down.

Since postgres is removed (--rm) on container shutdown be sure to recreate the `dreddit` database. TODO: automate this

# The Flow

### services:

redis: TODO: decide to -rm this on container shutdown (erring on a no to persist it to match production)

- `docker run -d -p 6379:6379 --name redis4dreddit redis`

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

### Sessions:

- `yarn add redis connect-redis express-session`
- `yarn add -D @types/redis @types/express-session @types/connect-redis`
- follow install @ https://github.com/tj/connect-redis
- set up the cookie and session options
- access sessions in resolves by using req/res object in apollo server's `context`:
  `context: ({ req, res }): MyContext => ({ em: orm.em, req, res })`
- don't forget to update MyContext types for the new context values; req and res.
- when testing cookies in playground be sure to set `"request.credentials": "include",` in config (gear in top right)
