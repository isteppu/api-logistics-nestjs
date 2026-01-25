import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class Role {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;
}