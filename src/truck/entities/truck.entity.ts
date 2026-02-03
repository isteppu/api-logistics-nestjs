import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Truck {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
