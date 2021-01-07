# Get This Stuff Working

`yarn watch`, `yarn run dev` to spin up a dev server

docker run --name pg4dreddit -e POSTGRES_PASSWORD=docker -d postgres

if you need to get into postgres from the command line oyu can do psql over docker via:
`docker exec -it pg4dreddit sh`
`psql`

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

#### MikroORM

- spin up postgres with docker
- make a new database for the project
- create entities with constraints
- make sure the orm config is getting the entities
- mikroORM: make sure migration.up is in the code (to create migrations from config)
- run migrations

####TypeORM

### GraphQL setup

- create a new express app
- set up a resolver with type-graphql
- set up an apolloServer passing in resolvers
- apply the express server as middleware to the apollo server
- run `.listen` on the express app
- pass required functionality such as the ORM into the context

### fixing cors errors

- add cors express middleware: `yarn add cors`
- config cors in the app middleware: app.use(cors({origin: ...}))
- make sure to set cors to false in the apollo server config or it will override these custom settings!

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

## How Sessions Work

When a property on req.session is set that data will be saved to redis.
`req.session.userId = user.id`
will give us:
{userId: 1} -- send to redis -- >

In redis (a key value store) the session will look like this:
key: `sess:1111djoisjfijos` val: `{ userId: 1 }`

The session middleware (express-session) sets a cookie on browser: `2222suofiusuf` which is a encrypts version of the session key: `1111djoisjfijos`

When user makes a request: `2222suofiusuf` -> sent to server

The server decrypts the key using the secret provided upon setup which transforms:
`2222suofiusuf` -> `sess:1111djoisjfijos` reaving the session variables for that user

### Next: Adding the Front

- install next and optionally a UI framework: `npx create-next-app --example with-chakra-ui someName`
- see the front end project for more info

### Nodemailer: send some emails

- `yarn add nodemailer` - `https://nodemailer.com
- add email to entities
- create migration
- remove old users or set them to nullable in the entity
- update InputType UsernamePasswordInput (user.ts resolver) to include email
- add some validation/errors for email in register mutation
- make sure to pass in the email to the new user creation: `em.create`
- change login from UsernamePassword -> arg: usernameOrEmail arg: password to let the user choose.
- send a link with a UUID token generated to the users email: `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
- we store this in redis and we need to interact with redis so grab both: `yarn add ioredis uuid`
- add the redis client to the context remembering to update the `MyContext` type
- remove `redis` (the old client) since we no longer use it
