import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './Post';
import { User } from './User';

// how this works in sql:
// it's a many to many m to m
// users <-> posts many users many posts
// needs a join table to work
// user -> join table <- posts
// user -> vote(this file) <- posts
// these don't have a single primary key

@Entity()
export class Vote extends BaseEntity {
  @Column({ type: 'int' })
  value: number;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, (user) => user.votes)
  user: User;

  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => Post, (post) => post.votes)
  post: Post;
}
