import DataLoader from 'dataloader';
import { User } from '../entities/User';

// i imagine this just smashes what you want into one sql query
// say we want posts: 3, 4, 6, 10
// it's gonna grab each user id from that one query then make a
// one query with those user id's and then merge them with the og posts
// this will be run on every request
// video: 11:16:40
export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });

    return userIds.map((userId) => userIdToUser[userId]);
  });
