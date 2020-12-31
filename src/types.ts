import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core';
import { Request, Response } from 'express';

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
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: Request;
  res: Response;
};
