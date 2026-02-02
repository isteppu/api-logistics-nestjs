import { Field, ObjectType, ID, Int } from '@nestjs/graphql';
import { Role } from './role.model.js';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  role_id?: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  first_name?: string;

  @Field({ nullable: true })
  last_name?: string;

  @Field({ nullable: true })
  middle_name?: string;

  @Field(() => Role)
  role: Role;

  @Field({ nullable: true })
  current_session?: string;

  @Field({ nullable: true })
  last_logged_in?: Date;
}

@ObjectType()
export class UserResponse {
  @Field(() => [User])
  items: User[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Boolean)
  hasMore: boolean;
}