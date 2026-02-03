import { Field, ObjectType, ID } from '@nestjs/graphql';

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