import { Post } from '../entities/Post';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { MyContext } from '../types';
import { isAuth } from '../middleware/isAuth';
import { getConnection } from 'typeorm';
import { Vote } from '../entities/Vote';
import { User } from '../entities/User';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    // This will do the magic to link posts and their creators in at most 2 sql queries
    // it will batch the id's passed to it (which is why the loaders expect an array of keys)
    // the keys are this post.creatorId
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 70) + '...';
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(@Root() post: Post, @Ctx() { voteLoader, req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    const vote = await voteLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return vote ? vote.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isVote = value !== -1;
    const realValue = isVote ? 1 : -1;
    const { userId } = req.session;

    const vote = await Vote.findOne({ where: { postId, userId } });

    // the user has voted on the post before
    // and they are changing their vote
    if (vote && vote.value !== realValue) {
      // TODO: learn transaction manager
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
    update vote
    set value = $1
    where "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId]
        );

        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2
        `,
          [2 * realValue, postId]
        );
      });
    } else if (!vote) {
      // has never voted before
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
    insert into vote ("userId", "postId", value)
    values ($1, $2, $3)
        `,
          [userId, postId, realValue]
        );

        await tm.query(
          `
    update post
    set points = points + $1
    where id = $2
      `,
          [realValue, postId]
        );
      });
    }

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    // cursor will be null first time this is run
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null // the date post was created
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(cursor);
    }

    // casting the ::date here fixes an error where it returns equal dates as less than
    // TODO: this SQL for posts fetches creators even when we may not need them video: 11:10:34
    // we could and do (the og logic is below) split this into multiple queries or
    // add a field resolver for a post creator(which we end up doing above)
    // `
    // select p.*,
    // json_build_object(
    //   'id', u.id,
    //   'username', u.username,
    //   'email', u.email
    // ) creator
    // from post p
    // inner join public.user u on u.id = p."creatorId"
    // ${cursor ? `where p."createdAt"::date < $2` : ''}
    // order by p."createdAt" DESC
    // limit $1
    // `;
    //
    // having a resolver for this is a massive performance hit because now we are doing
    // an extra 15-20 sql requests depending on how many posts we fetch
    // we can use the dataloader library to handle this for us
    // is is an n+1 problem
    // we fix this by making a data loader and then using that loader in the Creator resolver
    // right here in this file. ^

    const posts = await getConnection().query(
      `
    select p.* from post p ${cursor ? `where p."createdAt"::date < $2` : ''}
    order by p."createdAt" DESC
    limit $1
    `,
      replacements
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    // this is just one sql query
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await Post.delete({ id, creatorId: req.session.userId }); // WHERE is by default for delete({})
    return true;
  }
}
