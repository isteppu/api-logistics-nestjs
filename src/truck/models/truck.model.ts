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

@ObjectType()
export class TruckPagination {
  @Field(() => [Truck])
  items: Truck[];

  @Field(() => Int)
  totalCount: number;

  @Field()
  hasMore: boolean;
}