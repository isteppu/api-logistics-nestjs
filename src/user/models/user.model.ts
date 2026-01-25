import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Role } from './role.model.js';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  first_name: string;

  @Field()
  last_name: string;

  @Field({ nullable: true })
  middle_name?: string;

  @Field(() => Role)
  role: Role;

  @Field({ nullable: true })
  last_logged_in?: Date;
}