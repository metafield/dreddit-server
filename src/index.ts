import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { COOKIE_NAME, __prod__ } from './constants';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from './types';
import cors from 'cors';
import { User } from './entities/User';
import { Post } from './entities/Post';
import path from 'path';
import { Vote } from './entities/Vote';
import { createVoteLoader } from './utils/createVoteLoader';
import { createUserLoader } from './utils/createUserLoader';

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    database: 'dreddit',
    username: 'postgres',
    password: 'docker',
    port: 54320,
    logging: true,
    synchronize: false, // auto-migrations and can cause issues if left on
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [Post, User, Vote],
  });

  // await Post.delete({})

  await conn.runMigrations();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax', // TODO: look into more (csrf)
        secure: __prod__, // https only in production
      },
      secret: 'TODO:HideThisWithEnvVars',
      resave: false,
      saveUninitialized: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis,
      voteLoader: createVoteLoader(),
      userLoader: createUserLoader(),
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log('server started on localhost: 4000');
  });
};

main().catch((err) => {
  console.log(err.message);
});
