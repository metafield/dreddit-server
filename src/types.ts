import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { createVoteLoader } from './utils/createVoteLoader';

// merge express-session with an interface to provide accurate session types
// https://www.typescriptlang.org/docs/handbook/declaration-merging.html
// declare module 'express-session' {
// would be used for a user object
// export interface SessionData {
//   user: { [key: string]: any };
// }

// following the ben awad example with a userId
declare module 'express-session' {
  export interface SessionData {
    userId: number;
  }
}

export type MyContext = {
  req: Request;
  res: Response;
  redis: Redis;
  voteLoader: ReturnType<typeof createVoteLoader>;
};
