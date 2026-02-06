import { Field, ObjectType, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Storable {
  @Field(() => ID)
  id: string;

  @Field()
  type: string; // e.g., 'PORT', 'CONTAINER', 'WAREHOUSE'

  @Field({ nullable: true })
  description?: string;

  @Field()
  date_created: Date;

  @Field({ nullable: true })
  created_by?: string;
}

@ObjectType()
export class StorablePagination {
  @Field(() => [Storable])
  items: Storable[];

  @Field(() => Int)
  totalCount: number;

  @Field()
  hasMore: boolean;
}