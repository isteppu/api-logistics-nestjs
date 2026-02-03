import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Storable {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
