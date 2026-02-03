import { Field, ObjectType, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Truck {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  operator?: string;

  @Field(() => Int)
  is_archived: number;

  @Field({ nullable: true })
  date_added?: string;
}