import { MyContext } from '../types';
import { MiddlewareFn } from 'type-graphql';

// Middleware works by running before your resolver.

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error('not authenticated');
  }

  return next();
};
