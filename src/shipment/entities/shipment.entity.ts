import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Shipment {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
